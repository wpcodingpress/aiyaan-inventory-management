import type { ResolvedMikuConfig } from "../config/types"
import type { ToolCall } from "../types"
import {
  frameData,
  ProviderError,
  safeJsonParse,
  sseFrames,
  type LlmChunk,
  type LlmMessage,
  type LlmProvider,
  type LlmStreamOptions,
} from "./types"

const BASE = "https://generativelanguage.googleapis.com/v1beta"

interface GeminiPart {
  text?: string
  functionCall?: { name?: string; args?: Record<string, unknown> }
  functionResponse?: { name?: string; response?: Record<string, unknown> }
  /**
   * Sits beside `functionCall`, not inside it. Gemini 3.x rejects a
   * functionCall round-tripped without it ("Function call is missing a
   * thought_signature"), so it has to survive the trip through MIKU's
   * provider-neutral history or every tool-using turn 400s.
   */
  thoughtSignature?: string
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[]; role?: string }
  finishReason?: string
}

interface GeminiFrame {
  candidates?: GeminiCandidate[]
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }
  error?: { message?: string; status?: string }
}

function apiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
}

export function getGeminiModel(config?: ResolvedMikuConfig): string {
  if (config?.llm.model) return config.llm.model
  if (config?.llm.models.gemini) return config.llm.models.gemini
  // Pinned to a stable, non-preview model that was actually serving at the time
  // of writing: `gemini-2.0-flash` and `gemini-2.5-flash` both 404 ("no longer
  // available to new users"), and the full `gemini-3.5-flash` was timing out
  // while the lite variant answered 5/5. `GEMINI_MODEL` overrides this.
  return process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
}

/**
 * Equivalents tried, in order, when the configured model is unavailable.
 *
 * Free-tier load is uneven — on any given day the lite model answers and the
 * full one times out, or exactly the reverse. Pinning one name means a demand
 * spike takes chat down entirely, so we walk a short list before giving up.
 * The names are deliberately generic because Google both retires and re-ships
 * them constantly; a name that 404s today is simply skipped.
 */
const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
]

/** The configured model first, then equivalents, with no duplicates. */
function geminiModelCandidates(config?: ResolvedMikuConfig): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const model of [getGeminiModel(config), ...GEMINI_FALLBACK_MODELS]) {
    if (!seen.has(model)) {
      seen.add(model)
      out.push(model)
    }
  }
  return out
}

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey())
}

/** Converts the normalised history into Gemini's contents array. */
function toContents(
  messages: LlmMessage[],
  systemParts: GeminiPart[]
): { role: string; parts: GeminiPart[] }[] {
  const contents: { role: string; parts: GeminiPart[] }[] = []
  if (systemParts.length > 0) contents.push({ role: "user", parts: systemParts })

  for (const msg of messages) {
    if (msg.role === "user") {
      contents.push({ role: "user", parts: [{ text: msg.content || " " }] })
      continue
    }
    const parts: GeminiPart[] = []
    if (msg.content) parts.push({ text: msg.content })
    for (const call of msg.toolCalls ?? []) {
      const part: GeminiPart = { functionCall: { name: call.name, args: call.args } }
      // Gemini refuses the replay without the signature it handed us.
      if (call.thoughtSignature) part.thoughtSignature = call.thoughtSignature
      parts.push(part)
    }
    if (parts.length === 0) continue
    contents.push({ role: "model", parts })

    if (msg.toolResults?.length) {
      // Gemini requires every functionResponse to sit in the turn that directly
      // follows its functionCall.
      contents.push({
        role: "user",
        parts: msg.toolResults.map((r) => ({
          functionResponse: {
            name: r.name,
            response: r.ok ? { result: r.observation } : { error: r.observation },
          },
        })),
      })
    }
  }
  return contents
}

export async function* streamGemini(
  config: ResolvedMikuConfig,
  opts: LlmStreamOptions
): AsyncGenerator<LlmChunk> {
  const key = apiKey()
  if (!key) {
    yield { type: "error", message: "Gemini is not configured (GEMINI_API_KEY missing)" }
    return
  }

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: toContents(opts.messages, []),
    generationConfig: {
      temperature: config.llm.temperature,
      maxOutputTokens: config.llm.maxOutputTokens,
    },
  }
  if (opts.tools?.length) {
    body.tools = [
      {
        functionDeclarations: opts.tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      },
    ]
    body.toolConfig = { functionCallingConfig: { mode: "AUTO" } }
  }

  // Walk the model list only until the first one answers. Switching is only
  // ever safe before the first byte, so a partially-streamed answer is never
  // truncated — we simply never reach this loop again once streaming begins.
  let res: Response | null = null
  let lastError: ProviderError | null = null

  for (const model of geminiModelCandidates(config)) {
    const url = `${BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`

    let attempt: Response
    try {
      attempt = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: opts.signal,
      })
    } catch (err) {
      lastError = new ProviderError(
        err instanceof Error ? err.message : "Gemini request failed",
        true
      )
      continue
    }

    if (!attempt.ok || !attempt.body) {
      const text = await attempt.text().catch(() => "")
      // 404 = retired model, 429/5xx = load: both are worth another model.
      // Anything else (400, 401, 403) is a real configuration problem — surface
      // it rather than masking it behind a model that happens to answer.
      const retryable =
        attempt.status === 404 || attempt.status === 429 || attempt.status >= 500
      lastError = new ProviderError(
        `Gemini ${attempt.status}: ${text.slice(0, 300)}`,
        retryable
      )
      if (!retryable) throw lastError
      continue
    }

    res = attempt
    break
  }

  if (!res || !res.body) {
    if (lastError) throw lastError
    yield { type: "error", message: "Gemini request failed", retryable: true }
    return
  }
  const stream = res.body

  const usage: { in?: number; out?: number } = {}
  let callSeq = 0

  for await (const frame of sseFrames(stream, opts.signal)) {
    const payload = frameData(frame)
    if (payload === null) continue
    const parsed = safeJsonParse<GeminiFrame | null>(payload, null)
    if (!parsed) continue
    if (parsed.error) {
      yield { type: "error", message: parsed.error.message || "Gemini error" }
      continue
    }
    if (parsed.usageMetadata) {
      usage.in = parsed.usageMetadata.promptTokenCount ?? usage.in
      usage.out = parsed.usageMetadata.candidatesTokenCount ?? usage.out
    }
    const candidate = parsed.candidates?.[0]
    if (!candidate) continue

    for (const part of candidate.content?.parts ?? []) {
      if (part.functionCall?.name) {
        const call: ToolCall = {
          id: `gemini-${Date.now().toString(36)}-${callSeq++}`,
          name: part.functionCall.name,
          args: part.functionCall.args ?? {},
          // Keep it or the follow-up turn 400s on replay.
          ...(part.thoughtSignature ? { thoughtSignature: part.thoughtSignature } : {}),
        }
        yield { type: "tool_call", toolCall: call }
        continue
      }
      if (part.text) yield { type: "text", text: part.text }
    }

    if (candidate.finishReason) {
      yield {
        type: "done",
        finishReason: candidate.finishReason,
        inputTokens: usage.in,
        outputTokens: usage.out,
      }
    }
  }
}

/**
 * Gemini is the only provider MIKU can embed with, so its default must track
 * what the API actually serves. `text-embedding-004` was removed from the API
 * in 2026 and now returns 404 for `embedContent`, which would fail every
 * ingest — verified directly against v1beta. `gemini-embedding-001` replaces it
 * and accepts `outputDimensionality`, so 256 dims stays a cheap, sane default.
 */

/**
 * Chunks per `batchEmbedContents` request.
 *
 * Measured against the free tier: 1100-char chunks are ~275 tokens each, and
 * the quota is roughly 30k tokens per minute. The old batch of 100 was ~27.5k
 * tokens — a single request that consumed the entire minute's budget, so the
 * very next page came back 429 no matter how long it waited. 32 lands at ~8.8k
 * tokens, leaving room for the other batches in the same window.
 */
const EMBED_BATCH_SIZE = 32

/** Statuses worth waiting out. 404 and 401 are configuration problems, not load. */
const RETRYABLE_EMBED_STATUS = new Set([408, 429, 500, 502, 503, 504])
const EMBED_MAX_ATTEMPTS = 8
const EMBED_BACKOFF_CAP_MS = 60_000

/**
 * Exponential backoff with jitter, capped, and overridden whenever the API
 * states how long to wait — either the `Retry-After` header or Google's
 * `retryDelay` body field. The jitter matters: a crawl embeds pages in a loop,
 * so without it every batch would retry at the same instant and collide again.
 *
 * The budget is deliberately generous. Tokens-per-minute refills over a whole
 * minute, so a backoff that gives up after ~30s would keep timing out against a
 * window it never outlives.
 */
function embedBackoffMs(
  attempt: number,
  retryAfter: string | null,
  body: string
): number {
  const header = Number(retryAfter)
  if (retryAfter !== null && Number.isFinite(header) && header >= 0) {
    return Math.min(header * 1000, EMBED_BACKOFF_CAP_MS)
  }
  const delayField = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(body)
  if (delayField) {
    return Math.min(Number(delayField[1]) * 1000, EMBED_BACKOFF_CAP_MS)
  }
  const exponential = 2_000 * 2 ** attempt
  return Math.min(exponential + Math.random() * 750, EMBED_BACKOFF_CAP_MS)
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function embedWithGemini(
  texts: string[],
  dimensions: number,
  model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001"
): Promise<number[][]> {
  const key = apiKey()
  if (!key) throw new ProviderError("Gemini is not configured; cannot embed")

  const out: number[][] = []
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE)

    for (let attempt = 0; ; attempt++) {
      const res = await fetch(
        `${BASE}/models/${encodeURIComponent(model)}:batchEmbedContents?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: batch.map((text) => ({
              model: `models/${model}`,
              content: { parts: [{ text }] },
              outputDimensionality: dimensions,
            })),
          }),
        }
      )

      if (res.ok) {
        const json = (await res.json()) as { embeddings?: { values: number[] }[] }
        for (const e of json.embeddings ?? []) out.push(e.values)
        break
      }

      const body = await res.text().catch(() => "")
      const canRetry =
        RETRYABLE_EMBED_STATUS.has(res.status) && attempt < EMBED_MAX_ATTEMPTS - 1
      if (!canRetry) {
        throw new ProviderError(
          `Gemini embed ${res.status}: ${body.slice(0, 200)}`,
          res.status === 429
        )
      }

      // Free-tier embedding quotas refill per minute, so a full-site crawl hits
      // them routinely. Losing the page over that would leave silent holes in
      // the index, and prune would later treat the gap as the page being gone.
      const wait = embedBackoffMs(attempt, res.headers.get("retry-after"), body)
      console.warn(
        `[miku] Gemini embed ${res.status} — retrying in ${Math.round(wait)}ms ` +
          `(attempt ${attempt + 1}/${EMBED_MAX_ATTEMPTS - 1})`
      )
      await delay(wait)
    }
  }
  return out
}

/** Wraps this module's factory into an LlmProvider bound to one config. */
export function createGeminiProvider(config: ResolvedMikuConfig): LlmProvider {
  return {
    id: "gemini",
    isConfigured: isGeminiConfigured,
    streamChat: (opts) => streamGemini(config, opts),
    embed: (texts, dims) => embedWithGemini(texts, dims, config.llm.embeddingModel),
  }
}
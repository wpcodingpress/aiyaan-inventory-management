/**
 * ESM resolve hook for the `miku` CLI.
 *
 * MIKU ships TypeScript source that uses bundler-style relative imports
 * (`"./store"`, `"./config"`) because that is the form Next.js, webpack,
 * Turbopack and TypeScript all expect. Node's own module resolver is stricter:
 * it wants an explicit file extension and it refuses directory imports, so a
 * `.ts` file run directly on plain Node cannot resolve `"./store"` or
 * `"./config"`.
 *
 * Rather than litter the shipped source with `.ts` extensions (which would
 * then fail `tsc` inside a host that type-checks the package), the CLI registers
 * this hook and Node asks it to resolve every specifier. When Node cannot find
 * a relative import, this tries the same path with a known extension and the
 * conventional `index` file inside a directory.
 *
 * It only ever rewrites RELATIVE or absolute paths, and only when Node's own
 * resolution already failed, so it cannot change how real dependencies resolve.
 */
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const CANDIDATE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
]

export async function resolve(specifier, context, nextResolve) {
  // Bare specifiers (packages such as "zod") and node: builtins are resolved by
  // Node exactly as before.
  const isPath =
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("file:")
  if (!isPath) return nextResolve(specifier, context)

  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    const code = error && error.code
    if (code !== "ERR_MODULE_NOT_FOUND" && code !== "ERR_UNSUPPORTED_DIR_IMPORT") {
      throw error
    }

    const base = new URL(specifier, context.parentURL)
    const candidates = []

    if (base.pathname.endsWith("/")) {
      for (const ext of CANDIDATE_EXTENSIONS) candidates.push(base.href + "index" + ext)
    } else {
      for (const ext of CANDIDATE_EXTENSIONS) candidates.push(base.href + ext)
      for (const ext of CANDIDATE_EXTENSIONS) candidates.push(base.href + "/index" + ext)
    }

    for (const candidate of candidates) {
      try {
        if (existsSync(fileURLToPath(candidate))) {
          return { url: candidate, shortCircuit: true }
        }
      } catch {
        // Ignore malformed candidate URLs and keep looking.
      }
    }

    throw error
  }
}

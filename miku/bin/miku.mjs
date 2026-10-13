#!/usr/bin/env node
/**
 * `miku` launcher.
 *
 * MIKU ships TypeScript source so it needs no build step, which is what lets it
 * sit in a host's app without a compile pipeline. That leaves the CLI needing to
 * run a .ts file directly, which Node learned to do in 22.6 (type stripping) and
 * made usable for real code in 22.7 (type transformation).
 *
 * This shim exists so `npx miku ingest` works on a plain Node install with no
 * extra dependency. It re-executes the CLI with Node's TypeScript support and a
 * small resolve hook (miku-register.mjs) that teaches Node to follow MIKU's
 * extensionless, bundler-style relative imports. It gives a usable message where
 * the runtime is too old to run the source at all.
 */
import { spawnSync } from "node:child_process"
import { fileURLToPath, pathToFileURL } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const cli = join(here, "..", "src", "cli.ts")
// Installs the resolve hook (see miku-hooks.mjs) that lets Node run the
// extensionless, bundler-style imports in MIKU's TypeScript source.
const hook = pathToFileURL(join(here, "miku-register.mjs")).href
const args = process.argv.slice(2)

const [major, minor] = process.versions.node.split(".").map(Number)
// `--experimental-transform-types` (Node 22.7+) strips types *and* rewrites the
// TypeScript-only constructs that have runtime behaviour — constructor
// parameter properties, enums. MIKU's source uses those, so plain type stripping
// (Node 22.6) cannot execute it.
const canRun = major > 22 || (major === 22 && minor >= 7)

if (!canRun) {
  console.error(
    `miku requires Node 22.7 or newer (this is ${process.versions.node}).\n` +
      `Either upgrade Node, or run the CLI through your project's TypeScript runner:\n\n` +
      `  npx tsx node_modules/miku/src/cli.ts ${args.join(" ")}\n`
  )
  process.exit(1)
}

const nodeArgs = ["--experimental-transform-types", "--no-warnings"]
const result = spawnSync(process.execPath, [...nodeArgs, "--import", hook, cli, ...args], {
  stdio: "inherit",
})

if (result.error) {
  console.error(`miku: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)

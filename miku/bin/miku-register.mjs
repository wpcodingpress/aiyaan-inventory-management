/**
 * Registers the `miku` resolve hook so the CLI's TypeScript source can run on a
 * plain Node install. Loaded once via `node --import`, before the CLI itself.
 */
import { register } from "node:module"

register("./miku-hooks.mjs", import.meta.url)

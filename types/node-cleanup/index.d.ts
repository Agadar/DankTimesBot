// Type definitions for node-cleanup.
// Note that ES6 modules cannot directly export callable functions.
// This file should be imported using the CommonJS-style:
//    import nodeCleanup = require('node-cleanup');
// Project: https://github.com/jtlapp/node-cleanup
// Definitions by: Agadar <https://github.com/agadar>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export = install;

declare function install(cleanupHandler?: (exitCode: number | null, signal: string | null) => boolean | undefined,
  stderrMessages?: { ctrl_C: string; uncaughtException: string }): void;

declare module install {
  export function uninstall(): void;
}
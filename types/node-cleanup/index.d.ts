// Type definitions for node-cleanup
// Project: https://github.com/jtlapp/node-cleanup
// Definitions by: Agadar <https://github.com/agadar>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTy

export declare function nodeCleanup(cleanupHandler?: (exitCode: number | null, signal: string | null) => boolean | undefined,
  stderrMessages?: { ctrl_C: string; uncaughtException: string }): void;
export declare namespace nodeCleanup {
  export function uninstall(): void;
}
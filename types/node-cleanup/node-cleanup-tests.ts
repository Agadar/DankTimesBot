import { nodeCleanup } from 'node-cleanup';

function cleanupHandler(exitCode: number | null, signal: string | null): boolean | undefined {
  return true;
}
const stderrMessages = { ctrl_C: 'ctrl_c', uncaughtException: 'UncaughtException' };

nodeCleanup(cleanupHandler);
nodeCleanup(cleanupHandler, stderrMessages);
nodeCleanup(undefined, stderrMessages);
nodeCleanup.uninstall();
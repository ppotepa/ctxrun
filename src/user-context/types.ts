/**
 * The resolved identity ctxrun operates on: who is actually running the
 * command (`currentUser`/`currentUid`), and whose config/home directory
 * should be used instead (`targetUser`/`targetHome`) when invoked through
 * `sudo`.
 */
export interface UserContext {
  currentUid: number;
  currentUser: string;
  targetUser: string;
  targetHome: string;
  isRoot: boolean;
  sudoUser?: string;
  env: NodeJS.ProcessEnv;
}

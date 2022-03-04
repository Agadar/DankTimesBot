export interface BasicUser {
  readonly id: number;
  name: string;
  score: number;
  currentAvatar: string;
  availableAvatars: string[];
  broadcastOptin: boolean;
  readonly lastScoreTimestamp: number;
}

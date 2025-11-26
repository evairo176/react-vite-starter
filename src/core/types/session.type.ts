export interface IPSession {
  id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiredAt: string;
  isCurrent: boolean;
  isRevoke: boolean;
}

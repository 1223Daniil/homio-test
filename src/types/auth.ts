export enum UserRole {
  ADMIN = "ADMIN",
  DEVELOPER = "DEVELOPER",
  AGENT = "AGENT",
  CLIENT = "CLIENT"
}

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  developerId?: string;
  agentId?: string;
  clientId?: string;
}

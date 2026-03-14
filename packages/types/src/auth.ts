// Auth request / response shapes shared between API and mobile.
// No Prisma dependency — plain TypeScript interfaces.

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  locale?: string;
  consentGiven?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string; // short-lived JWT, stored in memory on client
  user: UserDto;
}

// Public user profile — never includes passwordHash
export interface UserDto {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  consentGiven: boolean;
  onboardedModules: ModuleIdValue[];
}

export type ModuleIdValue = "ENERGY" | "PAIN" | "MOOD";

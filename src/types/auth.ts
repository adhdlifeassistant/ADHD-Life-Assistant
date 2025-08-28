export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'microsoft';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

export interface AuthProvider {
  signIn(): Promise<User>;
  signOut(): Promise<void>;
  refreshAccessToken(): Promise<string>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

export type AuthProviderType = 'google' | 'microsoft';
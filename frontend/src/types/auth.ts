export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

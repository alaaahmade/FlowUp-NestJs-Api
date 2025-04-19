export interface UserResponse {
  id: number;
  email: string;
  fullName?: string;
  roles: string[];
  picture?: string;
}

export interface registerResponse {
  success: boolean;
  message: string;
  user: UserResponse;
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponse;
  message?: string;
}

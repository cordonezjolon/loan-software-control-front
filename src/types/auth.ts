export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  role?: UserRole;
}

export enum UserRole {
  Admin = 'admin',
  LoanOfficer = 'loan_officer',
  Employee = 'employee',
}

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
}

export interface JwtAuthResponse {
  accessToken: string;
  user: UserResponse;
}

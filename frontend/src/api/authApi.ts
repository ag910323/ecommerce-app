import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  UserRegistrationRequest,
  UserResponse
} from "../types";

/**
 * Login User
 */
export async function loginUser(
  req: LoginRequest
): Promise<LoginResponse> {

  const response = await api.post<ApiResponse<LoginResponse>>(
    "/api/public/auth/login",
    req
  );

  return response.data.data;
}

/**
 * Register User
 */
export async function registerUser(
  req: UserRegistrationRequest
): Promise<UserResponse> {

  const response = await api.post<ApiResponse<UserResponse>>(
    "/api/public/auth/register",
    req
  );

  return response.data.data;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface AuthUser {
  id: number;
  email: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

async function authRequest(
  endpoint: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.detail;

    const message =
      typeof detail === "string"
        ? detail
        : "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return data as AuthResponse;
}

export function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  return authRequest("signup", email, password);
}

export function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return authRequest("login", email, password);
}


const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem("clarivue_access_token");
}

export function clearAccessToken(): void {
  localStorage.removeItem("clarivue_access_token");
}

interface RequestOptions extends RequestInit {
  authenticated?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { authenticated = false, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getAccessToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`,
      {
        ...requestOptions,
        headers: requestHeaders,
      }
    );
  } catch {
    throw new ApiError(
      "Unable to connect to Clarivue. Please check that the backend is running.",
      0
    );
  }

  const contentType = response.headers.get("content-type") || "";

  let data: unknown = null;

  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => "");
    }
  }

  if (!response.ok) {
    const payload =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};

    const detail = payload.detail;
    let message = `Request failed (${response.status}). Please try again.`;

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = detail
        .map((item) => {
          if (item && typeof item === "object") {
            const entry = item as Record<string, unknown>;
            const location = Array.isArray(entry.loc)
              ? entry.loc.join(" → ")
              : "";

            return [location, entry.msg]
              .filter(Boolean)
              .join(": ");
          }

          return String(item);
        })
        .join("; ");
    } else if (typeof payload.message === "string") {
      message = payload.message;
    }

    if (response.status === 401 && authenticated) {
      clearAccessToken();
    }

    throw new ApiError(message, response.status, detail);
  }

  return data as T;
}

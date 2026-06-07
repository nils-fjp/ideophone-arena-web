import type {
  AnswerResultResponse,
  AttemptResponse,
  AuthResponse,
  GameSessionResponse,
  LeaderboardEntry,
  LoginRequest,
  NextRoundResponse,
  RegisterRequest,
  StartSessionRequest,
  SubmitAnswerRequest,
} from "./types";

const API_BASE_URL = (
  String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081").trim()
).replace(/\/$/, "");

const TOKEN_STORAGE_KEY = "ideophone-arena-token";

type JsonBody = unknown;

type ApiErrorBody = {
  message?: string;
  error?: string;
  validationErrors?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function backendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchBackendBlob(path: string) {
  const token = getAuthToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(backendUrl(path), { headers });
  } catch (caught) {
    throw new ApiError(
      0,
      `Backend unavailable at ${API_BASE_URL || "the Vite proxy"}`,
      caught,
    );
  }

  if (!response.ok) {
    const parsed = await parseBody(response);
    throw new ApiError(
      response.status,
      errorMessage(response.status, parsed, response.statusText),
      parsed,
    );
  }

  return response.blob();
}

function errorMessage(status: number, body: unknown, fallbackText: string) {
  if (isApiErrorBody(body)) {
    const validation = body.validationErrors
      ? Object.entries(body.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("; ")
      : "";
    const main = body.message ?? body.error;
    return [main, validation].filter(Boolean).join(" ") || fallbackText;
  }

  return fallbackText || `Request failed with status ${status}`;
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === "object" && body !== null;
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: JsonBody;
  } = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (caught) {
    throw new ApiError(
      0,
      `Backend unavailable at ${API_BASE_URL || "the Vite /api proxy"}`,
      caught,
    );
  }

  const parsed = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(response.status, parsed, response.statusText),
      parsed,
    );
  }

  return parsed as T;
}

export function register(request: RegisterRequest) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: request,
  });
}

export function login(request: LoginRequest) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
  });
}

export function startSession(request: StartSessionRequest) {
  return apiRequest<GameSessionResponse>("/api/game/sessions", {
    method: "POST",
    body: request,
  });
}

export function getNextRound(sessionUuid: string) {
  return apiRequest<NextRoundResponse>(
    `/api/game/sessions/${encodeURIComponent(sessionUuid)}/rounds/next`,
  );
}

export function submitAnswer(
  sessionUuid: string,
  request: SubmitAnswerRequest,
) {
  return apiRequest<AnswerResultResponse>(
    `/api/game/sessions/${encodeURIComponent(sessionUuid)}/answers`,
    {
      method: "POST",
      body: request,
    },
  );
}

export function getLeaderboard() {
  return apiRequest<LeaderboardEntry[]>("/api/leaderboard");
}

export function getMyAttempts() {
  return apiRequest<AttemptResponse[]>("/api/game/me/attempts");
}

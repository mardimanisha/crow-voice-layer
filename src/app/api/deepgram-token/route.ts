import { NextRequest, NextResponse } from "next/server";

const CORS_MAX_AGE = "86400";
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 tokens per minute per IP

/** In-memory rate limit: IP -> { count, resetAt }. Per-instance only; provides burst protection. */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function getCorsOrigin(request: NextRequest): string {
  const allowed = process.env.DEEPGRAM_TOKEN_ALLOWED_ORIGINS;
  if (!allowed?.trim()) return "*";
  const origins = allowed.split(",").map((o) => o.trim()).filter(Boolean);
  if (origins.length === 0) return "*";
  const origin = request.headers.get("origin");
  if (!origin) return origins[0] ?? "*";
  return origins.includes(origin) ? origin : origins[0];
}

function cleanupRateLimitMap(): void {
  if (rateLimitMap.size < 100) return;
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}

function isRateLimited(ip: string): boolean {
  cleanupRateLimitMap();
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) return true;
  return false;
}

function corsHeaders(request: NextRequest): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(request),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": CORS_MAX_AGE,
  };
}

function jsonResponse(
  body: { access_token: string; expires_in: number } | { error: string },
  status: number,
  request: NextRequest,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(body, {
    status,
    headers: { ...corsHeaders(request), ...extraHeaders },
  });
}

async function grantToken(
  request: NextRequest
): Promise<
  NextResponse<{ access_token: string; expires_in: number } | { error: string }>
> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey?.trim()) {
    return jsonResponse({ error: "Token service unavailable" }, 503, request);
  }

  try {
    const res = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 60 }),
    });

    if (!res.ok) {
      return jsonResponse(
        { error: "Token service temporarily unavailable" },
        res.status >= 500 ? res.status : 503,
        request
      );
    }

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    const access_token = data?.access_token;
    const expires_in = typeof data?.expires_in === "number" ? data.expires_in : 30;

    if (typeof access_token !== "string" || typeof expires_in !== "number") {
      return jsonResponse(
        { error: "Token service temporarily unavailable" },
        503,
        request
      );
    }

    return jsonResponse({ access_token, expires_in }, 200, request);
  } catch {
    return jsonResponse(
      { error: "Token service temporarily unavailable" },
      503,
      request
    );
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonResponse(
      { error: "Too many requests" },
      429,
      request,
      { "Retry-After": "60" }
    );
  }
  return grantToken(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return jsonResponse(
      { error: "Too many requests" },
      429,
      request,
      { "Retry-After": "60" }
    );
  }
  return grantToken(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

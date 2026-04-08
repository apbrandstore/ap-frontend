import { NextRequest, NextResponse } from "next/server";
import {
  STOREFRONT_API_ORIGIN,
  ensurePathnameTrailingSlash,
  storefrontPublishableKeyServer,
} from "@/lib/storefront-config";

function upstreamBase(): string | null {
  const o = STOREFRONT_API_ORIGIN?.replace(/\/$/, "");
  return o || null;
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const origin = upstreamBase();
  const key = storefrontPublishableKeyServer();
  if (!origin) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL is not configured." },
      { status: 503 }
    );
  }
  if (!key) {
    return NextResponse.json(
      {
        detail:
          "Storefront API key missing. Set NEXT_PUBLIC_PUBLISHABLE_KEY (or optional STOREFRONT_PUBLISHABLE_KEY on the server).",
      },
      { status: 503 }
    );
  }

  const { search } = req.nextUrl;
  const pathname = ensurePathnameTrailingSlash(req.nextUrl.pathname);
  // Use pathname (not `pathSegments.join`) so trailing slashes survive for Django APPEND_SLASH.
  const url = pathname.startsWith("/api/v1")
    ? `${origin}${pathname}${search}`
    : `${origin}/api/v1/${
        pathSegments.length > 0 ? pathSegments.join("/") : ""
      }${search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
  };
  const ct = req.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) init.body = buf;
  }

  const res = await fetch(url, init);
  const outHeaders = new Headers();
  const resCt = res.headers.get("content-type");
  if (resCt) outHeaders.set("Content-Type", resCt);
  const retry = res.headers.get("retry-after");
  if (retry) outHeaders.set("Retry-After", retry);

  const body = await res.arrayBuffer();
  return new NextResponse(body, { status: res.status, headers: outHeaders });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxyRequest(req, path ?? []);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  return proxyRequest(req, path ?? []);
}

/// <reference types="node" />

/**
 * Helper de OAuth para YouTube Data API.
 *
 * Uso:
 *   npx tsx scripts/youtube-oauth.ts auth-url
 *   npx tsx scripts/youtube-oauth.ts exchange <AUTH_CODE|CALLBACK_URL>
 *   npx tsx scripts/youtube-oauth.ts test
 *
 * Variables requeridas en .env.local:
 *   YT_OAUTH_CLIENT_ID
 *   YT_OAUTH_CLIENT_SECRET
 *   YT_OAUTH_REDIRECT_URI
 *
 * Para test:
 *   YT_OAUTH_REFRESH_TOKEN
 */

const AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta variable de entorno: ${name}`);
  return value;
}

function buildAuthUrl() {
  const clientId = requireEnv("YT_OAUTH_CLIENT_ID");
  const redirectUri = requireEnv("YT_OAUTH_REDIRECT_URI");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return `${AUTH_BASE_URL}?${params.toString()}`;
}

function extractAuthCode(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("AUTH_CODE vacío");

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const code = parsed.searchParams.get("code");
    if (!code) {
      const error = parsed.searchParams.get("error");
      if (error) {
        throw new Error(`OAuth devolvió error=${error}`);
      }
      throw new Error("La URL no contiene parámetro code");
    }
    return code;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("No se pudo parsear AUTH_CODE/CALLBACK_URL");
  }
}

async function exchangeCodeForTokens(code: string) {
  const clientId = requireEnv("YT_OAUTH_CLIENT_ID");
  const clientSecret = requireEnv("YT_OAUTH_CLIENT_SECRET");
  const redirectUri = requireEnv("YT_OAUTH_REDIRECT_URI");

  const payload = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error token exchange (${res.status}): ${text}`);
  }

  const tokens = await res.json();
  return tokens as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
  };
}

async function refreshAccessToken() {
  const clientId = requireEnv("YT_OAUTH_CLIENT_ID");
  const clientSecret = requireEnv("YT_OAUTH_CLIENT_SECRET");
  const refreshToken = requireEnv("YT_OAUTH_REFRESH_TOKEN");

  const payload = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error refresh token (${res.status}): ${text}`);
  }

  const tokens = await res.json();
  return tokens as {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

async function testYoutubeAccess() {
  const token = await refreshAccessToken();

  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error YouTube API (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      snippet?: { title?: string };
      statistics?: { subscriberCount?: string; videoCount?: string };
    }>;
  };

  const first = data.items?.[0];
  if (!first) {
    console.log("OAuth OK, pero no se pudo resolver canal con mine=true.");
    return;
  }

  console.log("Canal autenticado:");
  console.log(`- id: ${first.id}`);
  console.log(`- title: ${first.snippet?.title ?? "(sin título)"}`);
  console.log(`- subscribers: ${first.statistics?.subscriberCount ?? "n/a"}`);
  console.log(`- videos: ${first.statistics?.videoCount ?? "n/a"}`);
}

async function main() {
  const command = process.argv[2];

  if (!command || ["auth-url", "exchange", "test"].indexOf(command) === -1) {
    console.log("Uso:");
    console.log("  npx tsx scripts/youtube-oauth.ts auth-url");
    console.log("  npx tsx scripts/youtube-oauth.ts exchange <AUTH_CODE|CALLBACK_URL>");
    console.log("  npx tsx scripts/youtube-oauth.ts test");
    process.exit(1);
  }

  if (command === "auth-url") {
    const url = buildAuthUrl();
    console.log("Abre esta URL y autoriza la app con la cuenta admin del canal:");
    console.log(url);
    return;
  }

  if (command === "exchange") {
    const authInput = process.argv[3];
    if (!authInput) {
      throw new Error(
        "Falta AUTH_CODE/CALLBACK_URL. Uso: npx tsx scripts/youtube-oauth.ts exchange <AUTH_CODE|CALLBACK_URL>",
      );
    }

    const code = extractAuthCode(authInput);

    const tokens = await exchangeCodeForTokens(code);
    console.log("Token exchange OK.");
    console.log(`access_token: ${tokens.access_token ? "[OK]" : "[MISSING]"}`);
    console.log(`refresh_token: ${tokens.refresh_token ? tokens.refresh_token : "[NO DEVUELTO]"}`);
    console.log("Guarda refresh_token en YT_OAUTH_REFRESH_TOKEN de .env.local");
    return;
  }

  await testYoutubeAccess();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

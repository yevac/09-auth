type SameSite = "lax" | "strict" | "none";

type CookieOptions = {
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: SameSite;
  secure?: boolean;
};

type CookieStoreLike = {
  set: (name: string, value: string, options?: CookieOptions) => void;
};

type ParsedCookie = {
  name: string;
  value: string;
  attributes: Record<string, string | true>;
};

const AUTH_COOKIE_NAMES = new Set(["accessToken", "refreshToken"]);

function normalizeSetCookieHeader(setCookie: string | string[] | undefined): string[] {
  if (!setCookie) return [];
  const rawValues = Array.isArray(setCookie) ? setCookie : [setCookie];
  return rawValues.flatMap((value) =>
    value
      .split(/,(?=\s*[^;,\s]+=)/g)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function parseCookie(rawCookie: string): ParsedCookie | null {
  const segments = rawCookie.split(";").map((segment) => segment.trim());
  const [nameValue, ...attributeSegments] = segments;
  if (!nameValue) return null;

  const separatorIndex = nameValue.indexOf("=");
  if (separatorIndex < 1) return null;

  const name = nameValue.slice(0, separatorIndex).trim();
  const value = nameValue.slice(separatorIndex + 1).trim();
  if (!name || !value) return null;

  const attributes: Record<string, string | true> = {};
  for (const segment of attributeSegments) {
    if (!segment) continue;
    const index = segment.indexOf("=");
    if (index === -1) {
      attributes[segment.toLowerCase()] = true;
      continue;
    }
    const key = segment.slice(0, index).trim().toLowerCase();
    const attrValue = segment.slice(index + 1).trim();
    attributes[key] = attrValue;
  }

  return { name, value, attributes };
}

function toSameSite(value: string | true | undefined): SameSite | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "lax" || normalized === "strict" || normalized === "none") {
    return normalized;
  }
  return undefined;
}

export function setAuthCookiesFromHeader(
  cookieStore: CookieStoreLike,
  setCookie: string | string[] | undefined
): boolean {
  let setAnyCookie = false;
  for (const rawCookie of normalizeSetCookieHeader(setCookie)) {
    const parsedCookie = parseCookie(rawCookie);
    if (!parsedCookie || !AUTH_COOKIE_NAMES.has(parsedCookie.name)) {
      continue;
    }

    const maxAgeAttr = parsedCookie.attributes["max-age"];
    const parsedMaxAge =
      typeof maxAgeAttr === "string" ? Number.parseInt(maxAgeAttr, 10) : Number.NaN;
    const expiresAttr = parsedCookie.attributes.expires;
    const parsedExpires = typeof expiresAttr === "string" ? new Date(expiresAttr) : undefined;

    cookieStore.set(parsedCookie.name, parsedCookie.value, {
      path:
        typeof parsedCookie.attributes.path === "string"
          ? parsedCookie.attributes.path
          : "/",
      ...(Number.isFinite(parsedMaxAge) ? { maxAge: parsedMaxAge } : {}),
      ...(parsedExpires && !Number.isNaN(parsedExpires.getTime())
        ? { expires: parsedExpires }
        : {}),
      ...(parsedCookie.attributes.httponly ? { httpOnly: true } : {}),
      ...(parsedCookie.attributes.secure ? { secure: true } : {}),
      ...(toSameSite(parsedCookie.attributes.samesite)
        ? { sameSite: toSameSite(parsedCookie.attributes.samesite) }
        : {}),
    });
    setAnyCookie = true;
  }

  return setAnyCookie;
}

function readTokenValue(
  payload: unknown,
  tokenKey: "accessToken" | "refreshToken"
): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const source = payload as Record<string, unknown>;

  const direct = source[tokenKey];
  if (typeof direct === "string" && direct.length > 0) return direct;

  const data = source.data;
  if (data && typeof data === "object") {
    const nested = (data as Record<string, unknown>)[tokenKey];
    if (typeof nested === "string" && nested.length > 0) return nested;
  }

  const tokens = source.tokens;
  if (tokens && typeof tokens === "object") {
    const nested = (tokens as Record<string, unknown>)[tokenKey];
    if (typeof nested === "string" && nested.length > 0) return nested;
  }

  return undefined;
}

export function setAuthCookiesFromPayload(
  cookieStore: CookieStoreLike,
  payload: unknown
): boolean {
  const accessToken = readTokenValue(payload, "accessToken");
  const refreshToken = readTokenValue(payload, "refreshToken");

  if (!accessToken && !refreshToken) return false;

  const baseOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  if (accessToken) {
    cookieStore.set("accessToken", accessToken, baseOptions);
  }
  if (refreshToken) {
    cookieStore.set("refreshToken", refreshToken, baseOptions);
  }

  return true;
}

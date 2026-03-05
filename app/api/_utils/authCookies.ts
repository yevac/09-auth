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

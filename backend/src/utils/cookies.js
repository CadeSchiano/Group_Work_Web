const COOKIE_NAME = "group_project_session";

const appendSetCookie = (res, cookieValue) => {
  const current = res.getHeader("Set-Cookie");

  if (!current) {
    res.setHeader("Set-Cookie", cookieValue);
    return;
  }

  const values = Array.isArray(current) ? current : [current];
  res.setHeader("Set-Cookie", [...values, cookieValue]);
};

const buildCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join("; ");
};

const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

export const getAuthToken = (req) => {
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    return header.replace("Bearer ", "");
  }

  return parseCookies(req.headers.cookie)[COOKIE_NAME] || null;
};

export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  appendSetCookie(
    res,
    buildCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }),
  );
};

export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  appendSetCookie(
    res,
    buildCookie(COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 0,
    }),
  );
};

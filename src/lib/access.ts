import { createHash, timingSafeEqual } from 'node:crypto';

function matches(actual: string, expected: string): boolean {
  return timingSafeEqual(createHash('sha256').update(actual).digest(), createHash('sha256').update(expected).digest());
}

// Shared temporary access gate. This does not assign employee/manager/HR roles.
export function checkAccess(request: Request): Response | null {
  const user = process.env.APP_ACCESS_USER;
  const password = process.env.APP_ACCESS_PASSWORD;
  const needsAccess = process.env.VERCEL || process.env.BACKEND_API_SECRET || user || password;
  if (!needsAccess) return null; // Existing local/MySQL development stays available.
  if (!user || !password || password.length < 16 || user.includes(':')) {
    return new Response('Konfigurasikan APP_ACCESS_USER dan APP_ACCESS_PASSWORD (minimal 16 karakter).', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  const authorization = request.headers.get('authorization') || '';
  let supplied = '';
  if (authorization.startsWith('Basic ')) {
    supplied = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
  }
  if (!matches(supplied, `${user}:${password}`)) {
    return new Response('Silakan masuk untuk mengakses portal.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="GLink Portal", charset="UTF-8"', 'Cache-Control': 'no-store' },
    });
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get('host')) return new Response('Origin tidak diizinkan.', { status: 403 });
      } catch {
        return new Response('Origin tidak valid.', { status: 403 });
      }
    }
  }
  return null;
}

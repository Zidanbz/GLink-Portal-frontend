import { checkAccess } from './access';

export async function forwardBackend(request: Request): Promise<Response> {
  const denied = checkAccess(request);
  if (denied) return denied;
  const secret = process.env.BACKEND_API_SECRET;
  const backend = process.env.BACKEND_URL;
  if (process.env.VERCEL && (!backend || !secret || secret.length < 32)) {
    return Response.json({ success: false, message: 'Konfigurasi backend belum lengkap.' }, { status: 503 });
  }
  const incoming = new URL(request.url);
  const target = new URL(backend || 'http://127.0.0.1:5101');
  if (!['http:', 'https:'].includes(target.protocol) || (process.env.VERCEL && target.protocol !== 'https:')) {
    return Response.json({ success: false, message: 'BACKEND_URL harus menggunakan HTTPS di Vercel.' }, { status: 503 });
  }
  // Origin is configured by the operator, never taken from a client URL/header.
  target.pathname = target.pathname.replace(/\/$/, '') + incoming.pathname;
  target.search = incoming.search;
  const headers = new Headers();
  for (const name of ['content-type', 'accept']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (secret) headers.set('x-glink-secret', secret);
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(58_000),
    });
    const responseHeaders = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    for (const name of ['content-type', 'content-disposition', 'x-nomor-surat', 'x-nomor-nota', 'x-submission-id']) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ success: false, message: 'Backend belum dapat dihubungi. Coba lagi beberapa saat.' }, { status: 502 });
  }
}

// Public form operations only. Historical records, saved attachments, approval
// mutations and deletion must not be exposed through the server's shared secret.
const publicOperations = new Set([
  'GET /api/health',
  'GET /api/pengajuan-dinas/nomor-terbaru',
  'POST /api/pengajuan',
  'POST /api/generate-pdf',
  'POST /api/pengajuan-dinas',
  'POST /api/pengajuan-dinas/preview-pdf',
  'POST /api/pengajuan-dinas/generate-pdf',
  'POST /api/pengajuan-cuti',
  'POST /api/pengajuan-cuti/preview-pdf',
  'POST /api/pengajuan-cuti/generate-pdf',
]);

export function checkAccess(request: Request): Response | null {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '');
  if (!publicOperations.has(`${request.method} ${pathname}`)) {
    return Response.json({ success: false, message: 'Operasi ini tidak tersedia pada formulir publik.' }, {
      status: 403, headers: { 'Cache-Control': 'no-store' },
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

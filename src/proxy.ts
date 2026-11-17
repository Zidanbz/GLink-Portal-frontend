import { NextRequest, NextResponse } from 'next/server';
import { checkAccess } from './lib/access';

export function proxy(request: NextRequest) {
  return checkAccess(request) || NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };

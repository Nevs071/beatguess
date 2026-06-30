import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function GET() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ scores: [] }, { status: 200 });
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!internalSecret) {
    return NextResponse.json(
      { error: 'INTERNAL_API_SECRET is missing.' },
      { status: 500 },
    );
  }

  const auth0Sub = encodeURIComponent(session.user.sub);

  const response = await fetch(`${API_BASE_URL}/scores/me?auth0Sub=${auth0Sub}`, {
    headers: {
      'x-internal-api-secret': internalSecret,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
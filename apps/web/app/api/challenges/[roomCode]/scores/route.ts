import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RouteContext = {
  params: Promise<{
    roomCode: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { roomCode } = await context.params;

  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'You must be logged in to submit a challenge score.' },
      { status: 401 },
    );
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!internalSecret) {
    return NextResponse.json(
      { error: 'INTERNAL_API_SECRET is missing.' },
      { status: 500 },
    );
  }

  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/challenges/${roomCode}/scores`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-api-secret': internalSecret,
    },
    body: JSON.stringify({
      ...body,
      auth0Sub: session.user.sub,
      playerName: session.user.name,
      playerEmail: session.user.email,
      playerPicture: session.user.picture,
    }),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
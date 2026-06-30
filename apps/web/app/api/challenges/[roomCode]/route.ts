import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type RouteContext = {
  params: Promise<{
    roomCode: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { roomCode } = await context.params;

  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!internalSecret) {
    return NextResponse.json(
      { error: 'INTERNAL_API_SECRET is missing.' },
      { status: 500 },
    );
  }

  const response = await fetch(`${API_BASE_URL}/challenges/${roomCode}`, {
    headers: {
      'x-internal-api-secret': internalSecret,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
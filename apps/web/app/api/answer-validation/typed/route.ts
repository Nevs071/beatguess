import { NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(request: Request) {
  const internalSecret = process.env.INTERNAL_API_SECRET;

  if (!internalSecret) {
    return NextResponse.json(
      { error: 'INTERNAL_API_SECRET is missing.' },
      { status: 500 },
    );
  }

  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/answer-validation/typed`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-api-secret': internalSecret,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();

  let data: unknown = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    data = { error: responseText || 'Answer validation failed.' };
  }

  return NextResponse.json(data, { status: response.status });
}
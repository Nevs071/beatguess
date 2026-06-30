import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a challenge.' },
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

    console.log('Creating challenge with backend:', API_BASE_URL);
    console.log('Challenge body has quizPayload:', body.quizPayload != null);

    const response = await fetch(`${API_BASE_URL}/challenges`, {
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
      }),
    });

    const responseText = await response.text();

    let data: unknown = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {
        error: responseText || 'Backend returned non-JSON response.',
      };
    }

    if (!response.ok) {
      console.error('Challenge backend error:', data);

      return NextResponse.json(
        {
          error:
            typeof data === 'object' &&
            data !== null &&
            'message' in data &&
            typeof data.message === 'string'
              ? data.message
              : typeof data === 'object' &&
                  data !== null &&
                  'error' in data &&
                  typeof data.error === 'string'
                ? data.error
                : 'Challenge creation failed',
          details: data,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Challenge API route crashed:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Challenge API route crashed.',
      },
      { status: 500 },
    );
  }
}
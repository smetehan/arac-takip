import { NextResponse } from 'next/server';

export async function GET() {
  const result = {
    env: {
      DATABASE_URL_var: !!process.env.DATABASE_URL,
      DATABASE_URL_starts: process.env.DATABASE_URL?.slice(0, 15) || null,
      DATABASE_AUTH_TOKEN_var: !!process.env.DATABASE_AUTH_TOKEN,
      DATABASE_AUTH_TOKEN_length: process.env.DATABASE_AUTH_TOKEN?.length || 0,
      JWT_SECRET_var: !!process.env.JWT_SECRET,
    },
    test: null,
    error: null,
  };

  try {
    const { prisma } = await import('@/lib/prisma');
    const count = await prisma.user.count();
    result.test = { connected: true, userCount: count };
  } catch (e) {
    result.error = {
      message: e.message,
      name: e.name,
      stack: e.stack?.slice(0, 800),
    };
  }

  return NextResponse.json(result, { status: 200 });
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route untuk menginisiasi OAuth connection dengan Composio
 * User akan diarahkan ke halaman OAuth untuk connect akun mereka
 */
export async function POST(request: NextRequest) {
  try {
    const { platform, userId } = await request.json();

    if (!platform || !userId) {
      return NextResponse.json(
        { error: 'Platform and userId are required' },
        { status: 400 }
      );
    }

    const composioApiKey = process.env.COMPOSIO_API_KEY;
    if (!composioApiKey) {
      return NextResponse.json(
        { error: 'Composio API key not configured' },
        { status: 500 }
      );
    }

    // Get auth config ID based on platform
    const authConfigMap: Record<string, string | undefined> = {
      twitter: process.env.TWITTER_AUTH_CONFIG_ID,
      facebook: process.env.FACEBOOK_AUTH_CONFIG_ID,
      instagram: process.env.INSTAGRAM_AUTH_CONFIG_ID,
      tiktok: process.env.TIKTOK_AUTH_CONFIG_ID,
      youtube: process.env.YOUTUBE_AUTH_CONFIG_ID,
    };

    const authConfigId = authConfigMap[platform.toLowerCase()];
    if (!authConfigId) {
      return NextResponse.json(
        { error: `Auth config not found for platform: ${platform}` },
        { status: 400 }
      );
    }

    // Initiate connection with Composio
    const response = await fetch('https://api.composio.dev/api/v1/connectedAccounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': composioApiKey,
      },
      body: JSON.stringify({
        integrationId: authConfigId,
        entityId: userId,
        redirectUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/composio/callback`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to initiate connection' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      redirectUrl: data.redirectUrl,
      connectionId: data.connectionRequest?.id,
    });
  } catch (error) {
    console.error('Composio connect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

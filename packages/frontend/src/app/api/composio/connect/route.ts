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
        { error: 'Composio API key not configured. Please add COMPOSIO_API_KEY to .env.local and restart the server.' },
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
    
    if (!authConfigId || authConfigId.startsWith('your_')) {
      return NextResponse.json(
        { 
          error: `Auth config not configured for platform: ${platform}. Please add ${platform.toUpperCase()}_AUTH_CONFIG_ID to your .env.local file.` 
        },
        { status: 400 }
      );
    }

    // Initiate connection with Composio using v3 API
    const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/composio/callback`;
    
    const requestBody = {
      auth_config: {
        id: authConfigId,
      },
      connection: {
        user_id: userId,
      },
      redirect_url: callbackUrl,
    };
    
    const response = await fetch('https://backend.composio.dev/api/v3/connected_accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': composioApiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || errorData.message || 'Failed to initiate connection' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      redirectUrl: data.redirect_url || data.redirectUrl,
      connectionId: data.id,
      status: data.status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

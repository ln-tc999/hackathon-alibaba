import { NextRequest, NextResponse } from 'next/server';

/**
 * Check connection status untuk user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');

    if (!userId || !platform) {
      return NextResponse.json(
        { error: 'userId and platform are required' },
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

    // Get connected accounts for this user
    const response = await fetch(
      `https://api.composio.dev/api/v1/connectedAccounts?entityId=${userId}`,
      {
        headers: {
          'X-API-Key': composioApiKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch connection status' },
        { status: response.status }
      );
    }

    const accounts = await response.json();
    
    // Find account for the requested platform
    const platformAccount = accounts.find(
      (acc: any) => acc.appName?.toLowerCase() === platform.toLowerCase()
    );

    return NextResponse.json({
      connected: !!platformAccount,
      account: platformAccount || null,
    });
  } catch (error) {
    console.error('Composio status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

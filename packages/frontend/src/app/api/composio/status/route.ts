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

    // Get connected accounts for this user using v3 API
    const response = await fetch(
      `https://backend.composio.dev/api/v3/connected_accounts?user_id=${userId}`,
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

    const data = await response.json();
    const accounts = data.items || data;
    
    // Find account for the requested platform
    const platformAccount = accounts.find(
      (acc: any) => {
        const appName = acc.toolkit?.slug || acc.appName || '';
        return appName.toLowerCase() === platform.toLowerCase();
      }
    );

    const isConnected = !!platformAccount && platformAccount.status === 'ACTIVE';

    return NextResponse.json({
      connected: isConnected,
      account: platformAccount || null,
      accountHandle: platformAccount?.state?.val?.username || 
                     platformAccount?.state?.val?.name ||
                     platformAccount?.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

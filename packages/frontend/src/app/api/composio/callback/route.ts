import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth Callback handler
 * User akan diarahkan ke sini setelah authorize di platform (Twitter, Facebook, dll)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const connectedAccountId = searchParams.get('connected_account_id');
  const error = searchParams.get('error');

  // Redirect ke frontend dengan status
  const redirectUrl = new URL('/', request.url);
  
  if (status === 'success' && connectedAccountId) {
    redirectUrl.searchParams.set('connection', 'success');
    redirectUrl.searchParams.set('accountId', connectedAccountId);
  } else {
    redirectUrl.searchParams.set('connection', 'failed');
    if (error) {
      redirectUrl.searchParams.set('error', error);
    }
  }

  return NextResponse.redirect(redirectUrl);
}

import type { APIRoute } from 'astro';

/**
 * OAuth Callback handler
 * User akan diarahkan ke sini setelah authorize di platform (Twitter, Facebook, dll)
 */
export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const connectedAccountId = url.searchParams.get('connected_account_id');
    const error = url.searchParams.get('error');

    // Redirect ke frontend dengan status
    const redirectUrl = new URL('/', url.origin);

    if (status === 'success' && connectedAccountId) {
        redirectUrl.searchParams.set('connection', 'success');
        redirectUrl.searchParams.set('accountId', connectedAccountId);
        redirectUrl.searchParams.set('platform', url.searchParams.get('app') || 'unknown');
    } else {
        redirectUrl.searchParams.set('connection', 'failed');
        if (error) {
            redirectUrl.searchParams.set('error', error);
        }
    }

    return Response.redirect(redirectUrl.toString(), 302);
};

export const prerender = false;

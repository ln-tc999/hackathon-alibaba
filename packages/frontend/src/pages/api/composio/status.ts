import type { APIRoute } from 'astro';

/**
 * Check connection status untuk user
 */
export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const platform = url.searchParams.get('platform');

        if (!userId || !platform) {
            return new Response(
                JSON.stringify({ error: 'userId and platform are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const composioApiKey = process.env.COMPOSIO_API_KEY || import.meta.env.COMPOSIO_API_KEY;
        if (!composioApiKey) {
            return new Response(
                JSON.stringify({ error: 'Composio API key not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
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
            return new Response(
                JSON.stringify({ error: 'Failed to fetch connection status' }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
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

        return new Response(
            JSON.stringify({
                connected: isConnected,
                account: platformAccount || null,
                accountHandle: platformAccount?.state?.val?.username ||
                    platformAccount?.state?.val?.name ||
                    platformAccount?.id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const prerender = false;

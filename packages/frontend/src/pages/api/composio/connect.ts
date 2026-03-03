import type { APIRoute } from 'astro';

/**
 * API Route untuk menginisiasi OAuth connection dengan Composio
 * User akan diarahkan ke halaman OAuth untuk connect akun mereka
 */
export const POST: APIRoute = async ({ request }) => {
    try {
        const { platform, userId } = await request.json();

        if (!platform || !userId) {
            return new Response(
                JSON.stringify({ error: 'Platform and userId are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const composioApiKey = process.env.COMPOSIO_API_KEY || import.meta.env.COMPOSIO_API_KEY;

        if (!composioApiKey) {
            return new Response(
                JSON.stringify({ error: 'Composio API key not configured. Please add COMPOSIO_API_KEY to .env.local and restart the server.' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get auth config ID based on platform
        const authConfigMap: Record<string, string | undefined> = {
            twitter: process.env.TWITTER_AUTH_CONFIG_ID || import.meta.env.TWITTER_AUTH_CONFIG_ID,
            facebook: process.env.FACEBOOK_AUTH_CONFIG_ID || import.meta.env.FACEBOOK_AUTH_CONFIG_ID,
            instagram: process.env.INSTAGRAM_AUTH_CONFIG_ID || import.meta.env.INSTAGRAM_AUTH_CONFIG_ID,
            tiktok: process.env.TIKTOK_AUTH_CONFIG_ID || import.meta.env.TIKTOK_AUTH_CONFIG_ID,
            youtube: process.env.YOUTUBE_AUTH_CONFIG_ID || import.meta.env.YOUTUBE_AUTH_CONFIG_ID,
        };

        const authConfigId = authConfigMap[platform.toLowerCase()];

        if (!authConfigId || authConfigId.startsWith('your_')) {
            return new Response(
                JSON.stringify({
                    error: `Auth config not configured for platform: ${platform}. Please add ${platform.toUpperCase()}_AUTH_CONFIG_ID to your .env.local file.`
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initiate connection with Composio using v3 API
        const callbackUrl = `${process.env.PUBLIC_API_URL || import.meta.env.PUBLIC_API_URL || 'http://localhost:4321'}/api/composio/callback`;

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

            return new Response(
                JSON.stringify({ error: errorData.error?.message || errorData.message || 'Failed to initiate connection' }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();

        return new Response(
            JSON.stringify({
                redirectUrl: data.redirect_url || data.redirectUrl,
                connectionId: data.id,
                status: data.status,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const prerender = false;

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone',
    }),
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false,
        }),
    ],
    vite: {
        resolve: {
            alias: {
                '@/': new URL('./src/', import.meta.url).pathname,
                '@vlowgen/shared': new URL('../shared/src/index.ts', import.meta.url).pathname,
            },
        },
        ssr: {
            noExternal: ['@vlowgen/shared'],
        },
    },
});

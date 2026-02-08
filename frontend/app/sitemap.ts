import { MetadataRoute } from 'next';

import { API_BASE_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = API_BASE_URL;

    // Add more dynamic routes here if needed (e.g., from database)
    const routes = [
        '',
        '/clients',
        '/campaigns',
        '/results/retail',
        '/reports',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}

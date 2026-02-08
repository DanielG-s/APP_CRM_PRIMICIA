import { MetadataRoute } from 'next';

import { API_BASE_URL } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = API_BASE_URL;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}

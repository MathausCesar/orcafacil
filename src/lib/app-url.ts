const PRODUCTION_APP_URL = 'https://app.zacly.com.br';

export function getAppBaseUrl() {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

    if (!configuredUrl) {
        return PRODUCTION_APP_URL;
    }

    try {
        const url = new URL(configuredUrl);

        if (url.hostname === 'app.zacly.com.br') {
            url.protocol = 'https:';
        }

        return url.origin;
    } catch {
        return PRODUCTION_APP_URL;
    }
}

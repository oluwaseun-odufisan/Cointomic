export async function fetchAPI(path: string, options: RequestInit = {}) {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}${path}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch API error:', error);
        throw error;
    }
}
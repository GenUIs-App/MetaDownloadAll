import { config } from '../config';

export interface UrlListResponse {
    success: boolean;
    data: string[];
    error?: string;
}

export const fetchUrlList = async (): Promise<UrlListResponse> => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: config.clientId,
                apiname: 'get_url_list',
                apiparams: {}
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch URL list');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching URL list:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

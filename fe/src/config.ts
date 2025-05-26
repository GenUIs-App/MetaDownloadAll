export const config = {
    clientId: import.meta.env.VITE_CLIENT_ID || 'client_default',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    features: {
        facebook: import.meta.env.VITE_ENABLE_FACEBOOK === 'true',
        instagram: import.meta.env.VITE_ENABLE_INSTAGRAM === 'true',
        twitter: import.meta.env.VITE_ENABLE_TWITTER === 'true'
    }
};

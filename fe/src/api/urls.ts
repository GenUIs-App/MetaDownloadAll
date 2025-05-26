import { config } from '../config';

export interface UrlListResponse {
    success: boolean;
    data: string[];
    error?: string;
}

export interface Account {
    id: string;
    name: string;
    facebook: string;
    instagram: string;
    threads: string;
    tiktok: string;
    createdAt: string;
    updatedAt: string;
}

export interface AccountResponse {
    success: boolean;
    data: Account | Account[];
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
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export const fetchAccounts = async (): Promise<AccountResponse> => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: config.clientId,
                apiname: 'get_accounts',
                apiparams: {}
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccountResponse> => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: config.clientId,
                apiname: 'add_account',
                apiparams: account
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add account');
        }

        return response.json();
    } catch (error) {
        console.error('Error adding account:', error);
        return {
            success: false,
            data: {} as Account,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export const updateAccount = async (account: Account): Promise<AccountResponse> => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: config.clientId,
                apiname: 'update_account',
                apiparams: account
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update account');
        }

        return response.json();
    } catch (error) {
        console.error('Error updating account:', error);
        return {
            success: false,
            data: {} as Account,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

export const deleteAccount = async (accountId: string): Promise<AccountResponse> => {
    try {
        const response = await fetch(`${config.apiBaseUrl}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: config.clientId,
                apiname: 'delete_account',
                apiparams: { id: accountId }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete account');
        }

        return response.json();
    } catch (error) {
        console.error('Error deleting account:', error);
        return {
            success: false,
            data: {} as Account,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

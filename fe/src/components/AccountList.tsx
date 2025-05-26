import { useState, useEffect } from 'react';
import { fetchUrlList } from '../api/urls';

export const AccountList = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchUrlList();
        if (result.success) {
          setAccounts(result.data);
        } else {
          setError(result.error || 'Failed to load accounts');
        }
      } catch (err) {
        setError('Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Accounts</h2>
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="text-gray-500 p-4">
          No accounts found
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="space-y-2">
          {accounts.map((account, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">{account}</span>
              <button 
                className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                onClick={() => {
                  // TODO: Implement account selection
                  console.log('Selected:', account);
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

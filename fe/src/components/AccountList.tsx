import { useState, useEffect } from 'react';
import { fetchAccounts, addAccount, updateAccount, deleteAccount } from '../api/urls';
import type { Account } from '../api/urls';

export const AccountList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  
  // New account form state
  const [newAccount, setNewAccount] = useState({
    name: '',
    facebook: '',
    instagram: '',
    threads: '',
    tiktok: ''
    // Note: createdAt and updatedAt are handled by the server
  });
  
  // Edit account form state
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  
  // Loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAccounts();
      if (result.success) {
        setAccounts(result.data as Account[]);
      } else {
        setError(result.error || 'Failed to load accounts');
      }
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };
  
  // Extract username from URL
  const extractUsernameFromUrl = (url: string): string => {
    if (!url) return '';
    try {
      // Remove trailing slash if present
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      // Get the last part of the URL path
      const urlObj = new URL(cleanUrl);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || '';
    } catch (e) {
      return '';
    }
  };
  
  // Auto-update name when any URL changes
  const updateNameFromUrl = (account: typeof newAccount) => {
    // Only auto-extract if name is empty or matches a previous extraction
    if (!account.name || 
        account.name === extractUsernameFromUrl(account.facebook) ||
        account.name === extractUsernameFromUrl(account.instagram) ||
        account.name === extractUsernameFromUrl(account.threads) ||
        account.name === extractUsernameFromUrl(account.tiktok)) {
      
      // Try to extract from any available URL
      const fbName = extractUsernameFromUrl(account.facebook);
      const igName = extractUsernameFromUrl(account.instagram);
      const threadsName = extractUsernameFromUrl(account.threads);
      const tiktokName = extractUsernameFromUrl(account.tiktok);
      
      // For TikTok, remove @ if present
      const cleanTiktokName = tiktokName && tiktokName.startsWith('@') ? 
        tiktokName.substring(1) : tiktokName;
      
      return fbName || igName || threadsName || cleanTiktokName;
    }
    return account.name;
  };
  
  // Handle URL input changes with auto name extraction
  const handleUrlChange = (field: 'facebook' | 'instagram' | 'threads' | 'tiktok', value: string) => {
    const updatedAccount = { ...newAccount, [field]: value };
    const extractedName = updateNameFromUrl(updatedAccount);
    setNewAccount({ ...updatedAccount, name: extractedName || updatedAccount.name });
  };
  
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) {
      setError('Account name is required');
      return;
    }
    
    // Need at least one URL
    if (!newAccount.facebook && !newAccount.instagram && !newAccount.threads && !newAccount.tiktok) {
      setError('At least one social media URL is required');
      return;
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      const result = await addAccount(newAccount);
      if (result.success) {
        setAccounts([...accounts, result.data as Account]);
        // Reset form
        setNewAccount({ name: '', facebook: '', instagram: '', threads: '', tiktok: '' });
        // Show success message
        alert(`Account "${newAccount.name}" added successfully!`);
      } else {
        setError(result.error || 'Failed to add account');
      }
    } catch (err) {
      setError('Failed to add account');
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount || !editAccount.name || !editAccount.facebook) {
      setError('Name and Facebook URL are required');
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const result = await updateAccount(editAccount);
      if (result.success) {
        setAccounts(accounts.map(acc => acc.id === editAccount.id ? (result.data as Account) : acc));
        // Show success message
        alert(`Account "${editAccount.name}" updated successfully!`);
        // Reset form and close expanded view
        setEditAccount(null);
        setExpandedAccountId(null);
      } else {
        setError(result.error || 'Failed to update account');
      }
    } catch (err) {
      setError('Failed to update account');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const result = await deleteAccount(id);
      if (result.success) {
        setAccounts(accounts.filter(acc => acc.id !== id));
        if (expandedAccountId === id) {
          setExpandedAccountId(null);
          setEditAccount(null);
        }
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const toggleAccountExpand = (account: Account) => {
    if (expandedAccountId === account.id) {
      setExpandedAccountId(null);
      setEditAccount(null);
    } else {
      setExpandedAccountId(account.id);
      setEditAccount({ ...account });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">Accounts</h2>
      
      {/* Add new account form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Add New Account</h3>
        <form onSubmit={handleAddAccount} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              placeholder="Account name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <div className="flex">
              <input
                type="url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAccount.facebook}
                onChange={(e) => handleUrlChange('facebook', e.target.value)}
                placeholder="https://www.facebook.com/username"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                onClick={() => newAccount.facebook && window.open(newAccount.facebook, '_blank')}
                disabled={!newAccount.facebook}
              >
                View
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <div className="flex">
              <input
                type="url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAccount.instagram}
                onChange={(e) => handleUrlChange('instagram', e.target.value)}
                placeholder="https://www.instagram.com/username"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                onClick={() => newAccount.instagram && window.open(newAccount.instagram, '_blank')}
                disabled={!newAccount.instagram}
              >
                View
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threads URL</label>
            <div className="flex">
              <input
                type="url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAccount.threads}
                onChange={(e) => handleUrlChange('threads', e.target.value)}
                placeholder="https://www.threads.net/username"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                onClick={() => newAccount.threads && window.open(newAccount.threads, '_blank')}
                disabled={!newAccount.threads}
              >
                View
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
            <div className="flex">
              <input
                type="url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newAccount.tiktok}
                onChange={(e) => handleUrlChange('tiktok', e.target.value)}
                placeholder="https://www.tiktok.com/@username"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                onClick={() => newAccount.tiktok && window.open(newAccount.tiktok, '_blank')}
                disabled={!newAccount.tiktok}
              >
                View
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isAdding}
            >
              {isAdding ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && accounts.length === 0 && (
        <div className="text-gray-500 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          No accounts found. Add your first account above.
        </div>
      )}

      {/* Account list */}
      {!loading && !error && accounts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Your Accounts</h3>
          <div className="max-h-96 overflow-y-auto pr-1 space-y-3">
            {/* Sort accounts by createdAt timestamp (newest first) */}
            {[...accounts]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Account header - always visible */}
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleAccountExpand(account)}>
                <div className="flex-1">
                  <h4 className="font-medium">{account.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {account.facebook && (
                      <a href={account.facebook} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Facebook</a>
                    )}
                    {account.instagram && (
                      <a href={account.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline">Instagram</a>
                    )}
                    {account.threads && (
                      <a href={account.threads} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:underline">Threads</a>
                    )}
                    {account.tiktok && (
                      <a href={account.tiktok} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-500 hover:underline">TikTok</a>
                    )}
                    <button className="text-xs text-green-500 hover:underline">Like</button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAccountExpand(account);
                    }}
                  >
                    {expandedAccountId === account.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button 
                    className="px-2 py-1 text-xs text-red-500 hover:text-red-700 focus:outline-none border border-red-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                    disabled={isDeleting}
                  >
                    del
                  </button>
                </div>
              </div>
              
              {/* Expanded section - only visible when expanded */}
              {expandedAccountId === account.id && editAccount && (
                <div className="border-t border-gray-200 p-4">
                  <form onSubmit={handleUpdateAccount} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editAccount.name}
                        onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                      <div className="flex">
                        <input
                          type="url"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editAccount.facebook}
                          onChange={(e) => setEditAccount({ ...editAccount, facebook: e.target.value })}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                          onClick={() => editAccount.facebook && window.open(editAccount.facebook, '_blank')}
                          disabled={!editAccount.facebook}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                      <div className="flex">
                        <input
                          type="url"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editAccount.instagram}
                          onChange={(e) => setEditAccount({ ...editAccount, instagram: e.target.value })}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                          onClick={() => editAccount.instagram && window.open(editAccount.instagram, '_blank')}
                          disabled={!editAccount.instagram}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Threads URL</label>
                      <div className="flex">
                        <input
                          type="url"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editAccount.threads}
                          onChange={(e) => setEditAccount({ ...editAccount, threads: e.target.value })}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                          onClick={() => editAccount.threads && window.open(editAccount.threads, '_blank')}
                          disabled={!editAccount.threads}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
                      <div className="flex">
                        <input
                          type="url"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editAccount.tiktok}
                          onChange={(e) => setEditAccount({ ...editAccount, tiktok: e.target.value })}
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                          onClick={() => editAccount.tiktok && window.open(editAccount.tiktok, '_blank')}
                          disabled={!editAccount.tiktok}
                        >
                          View
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-4 pt-4">
                      <div className="text-xs text-gray-500 mb-4">
                        <div><strong>Created:</strong> {new Date(editAccount.createdAt).toLocaleString()}</div>
                        <div><strong>Last Updated:</strong> {new Date(editAccount.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end">
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
                        onClick={() => {
                          setExpandedAccountId(null);
                          setEditAccount(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

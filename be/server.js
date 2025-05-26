const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const ACCOUNTS_FILE_PATH = path.join(__dirname, 'data', 'accounts.json');

const clients = new Map();
const pendingRequests = new Map();
const clientHeartbeats = new Map();

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const REQUEST_TIMEOUT = 60000; // 1 minute
const MAX_RECONNECT_ATTEMPTS = 5;

app.use(cors({ origin: '*' }));
app.use(express.json());

function generateRequestId() {
    return Math.random().toString(36).substr(2, 9);
}

// Heartbeat check
setInterval(() => {
    const now = Date.now();
    for (const [id, lastHeartbeat] of clientHeartbeats.entries()) {
        if (now - lastHeartbeat > HEARTBEAT_INTERVAL * 2) {
            const ws = clients.get(id);
            if (ws) {
                ws.terminate();
                clients.delete(id);
                clientHeartbeats.delete(id);
                console.log('🔌 Client ' + id + ' disconnected due to heartbeat timeout');
            }
        }
    }
}, HEARTBEAT_INTERVAL);

app.post('/call', async (req, res) => {
    const { id, apiname, apiparams } = req.body;

    console.log(req.headers, req.body);

    if (!id || !apiname) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Handle URL list API call
    if (apiname === 'get_url_list') {
        try {
            // For backward compatibility
            const urls = await fs.promises.readFile(path.join(__dirname, 'data', 'urls.txt'), 'utf8');
            const urlList = urls.split('\n').filter(url => url.trim() !== '');
            
            res.json({
                success: true,
                data: urlList
            });
            return;
        } catch (error) {
            console.error('Error reading URL list:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to read URL list'
            });
        }
    }
    
    // Get all accounts
    if (apiname === 'get_accounts') {
        try {
            // Check if accounts file exists, if not create it
            if (!fs.existsSync(ACCOUNTS_FILE_PATH)) {
                await fs.promises.writeFile(ACCOUNTS_FILE_PATH, '[]', 'utf8');
            }
            
            const accountsData = await fs.promises.readFile(ACCOUNTS_FILE_PATH, 'utf8');
            const accounts = JSON.parse(accountsData);
            
            res.json({
                success: true,
                data: accounts
            });
            return;
        } catch (error) {
            console.error('Error reading accounts:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to read accounts'
            });
        }
    }
    
    // Add a new account
    if (apiname === 'add_account') {
        try {
            const { name, facebook, instagram, threads, tiktok } = apiparams;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Account name is required'
                });
            }
            
            // Need at least one social media URL
            if (!facebook && !instagram && !threads) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one social media URL is required'
                });
            }
            
            // Read existing accounts
            let accounts = [];
            if (fs.existsSync(ACCOUNTS_FILE_PATH)) {
                const accountsData = await fs.promises.readFile(ACCOUNTS_FILE_PATH, 'utf8');
                accounts = JSON.parse(accountsData);
            }
            
            // Generate a new ID
            const newId = accounts.length > 0 
                ? (Math.max(...accounts.map(a => parseInt(a.id))) + 1).toString()
                : "1";
            
            // Get current timestamp
            const currentTime = new Date().toISOString();
            
            // Create new account
            const newAccount = {
                id: newId,
                name,
                facebook,
                instagram: instagram || '',
                threads: threads || '',
                tiktok: tiktok || '',
                createdAt: currentTime,
                updatedAt: currentTime
            };
            
            // Add to accounts list
            accounts.push(newAccount);
            
            // Save to file
            await fs.promises.writeFile(ACCOUNTS_FILE_PATH, JSON.stringify(accounts, null, 2), 'utf8');
            
            // Update urls.txt for backward compatibility
            const urlList = accounts.map(a => a.facebook).filter(url => url.trim() !== '');
            await fs.promises.writeFile(path.join(__dirname, 'data', 'urls.txt'), urlList.join('\n'), 'utf8');
            
            res.json({
                success: true,
                data: newAccount
            });
            return;
        } catch (error) {
            console.error('Error adding account:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to add account'
            });
        }
    }
    
    // Update an existing account
    if (apiname === 'update_account') {
        try {
            const { id, name, facebook, instagram, threads, tiktok } = apiparams;
            
            if (!id || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'ID and name are required'
                });
            }
            
            // Need at least one social media URL
            if (!facebook && !instagram && !threads) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one social media URL is required'
                });
            }
            
            // Read existing accounts
            if (!fs.existsSync(ACCOUNTS_FILE_PATH)) {
                return res.status(404).json({
                    success: false,
                    error: 'Accounts file not found'
                });
            }
            
            const accountsData = await fs.promises.readFile(ACCOUNTS_FILE_PATH, 'utf8');
            let accounts = JSON.parse(accountsData);
            
            // Find account by ID
            const accountIndex = accounts.findIndex(a => a.id === id);
            if (accountIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Account not found'
                });
            }
            
            // Get current timestamp
            const currentTime = new Date().toISOString();
            
            // Update account
            accounts[accountIndex] = {
                ...accounts[accountIndex],
                name,
                facebook,
                instagram: instagram || '',
                threads: threads || '',
                tiktok: tiktok || '',
                updatedAt: currentTime
            };
            
            // Save to file
            await fs.promises.writeFile(ACCOUNTS_FILE_PATH, JSON.stringify(accounts, null, 2), 'utf8');
            
            // Update urls.txt for backward compatibility
            const urlList = accounts.map(a => a.facebook).filter(url => url.trim() !== '');
            await fs.promises.writeFile(path.join(__dirname, 'data', 'urls.txt'), urlList.join('\n'), 'utf8');
            
            res.json({
                success: true,
                data: accounts[accountIndex]
            });
            return;
        } catch (error) {
            console.error('Error updating account:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update account'
            });
        }
    }
    
    // Delete an account
    if (apiname === 'delete_account') {
        try {
            const { id } = apiparams;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Account ID is required'
                });
            }
            
            // Read existing accounts
            if (!fs.existsSync(ACCOUNTS_FILE_PATH)) {
                return res.status(404).json({
                    success: false,
                    error: 'Accounts file not found'
                });
            }
            
            const accountsData = await fs.promises.readFile(ACCOUNTS_FILE_PATH, 'utf8');
            let accounts = JSON.parse(accountsData);
            
            // Find account by ID
            const accountIndex = accounts.findIndex(a => a.id === id);
            if (accountIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Account not found'
                });
            }
            
            // Remove account
            const deletedAccount = accounts[accountIndex];
            accounts.splice(accountIndex, 1);
            
            // Save to file
            await fs.promises.writeFile(ACCOUNTS_FILE_PATH, JSON.stringify(accounts, null, 2), 'utf8');
            
            // Update urls.txt for backward compatibility
            const urlList = accounts.map(a => a.facebook).filter(url => url.trim() !== '');
            await fs.promises.writeFile(path.join(__dirname, 'data', 'urls.txt'), urlList.join('\n'), 'utf8');
            
            res.json({
                success: true,
                data: deletedAccount
            });
            return;
        } catch (error) {
            console.error('Error deleting account:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete account'
            });
        }
    }

    // Handle Facebook reels API call
    if (apiname === 'get_list_fb_user_reels') {
        try {
            const url = apiparams.url;
            const cursor = apiparams.cursor || '';

            // TODO: Implement actual Facebook API call
            // This is a placeholder response
            const response = {
                success: true,
                data: {
                    items: [],
                    cursor: cursor,
                    has_more: false
                }
            };

            res.json(response);
            return;
        } catch (error) {
            console.error('Error in get_list_fb_user_reels:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch Facebook user reels'
            });
        }
    }

    const ws = clients.get(id);
    if (!ws) {
        return res.status(404).json({ error: 'Client not connected' });
    }

    const requestId = generateRequestId();
    pendingRequests.set(requestId, res);

    try {
        ws.send(
            JSON.stringify({
                type: 'api_call',
                requestId,
                apiname,
                apiparams
            })
        );
    } catch (err) {
        pendingRequests.delete(requestId);
        return res.status(500).json({ error: 'Failed to send request to client' });
    }

    setTimeout(() => {
        if (pendingRequests.has(requestId)) {
            res.status(504).json({ error: 'Timeout waiting for response' });
            pendingRequests.delete(requestId);
        }
    }, REQUEST_TIMEOUT);
});

const server = app.listen(port, () => {
    console.log('🌐 Server running on port ' + port);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('⚡ WebSocket connected');

    let clientId = null;
    let reconnectAttempts = 0;

    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);

            if (data.type === 'register') {
                if (clientId) {
                    console.log(
                        '⚠️ Client ' + data.id + ' already registered, updating connection'
                    );
                }
                clientId = data.id;
                clients.set(clientId, ws);
                clientHeartbeats.set(clientId, Date.now());
                console.log('✅ Registered client: ' + clientId + ' (total: ' + clients.size + ')');
                reconnectAttempts = 0;
            } else if (data.type === 'response') {
                const res = pendingRequests.get(data.requestId);
                console.log('response', data);
                if (res) {
                    res.json({ result: data.result, error: data.error });
                    pendingRequests.delete(data.requestId);
                }
            } else if (data.type === 'heartbeat') {
                if (clientId) {
                    clientHeartbeats.set(clientId, Date.now());
                }
            } else if (data.type === 'reconnect') {
                if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    ws.send(
                        JSON.stringify({
                            type: 'error',
                            error: 'Maximum reconnection attempts reached'
                        })
                    );
                    ws.close();
                    return;
                }
                reconnectAttempts++;
                console.log(
                    '🔄 Reconnection attempt ' + reconnectAttempts + ' for client ' + clientId
                );
            }
        } catch (err) {
            console.error('❌ Invalid message', err);
        }
    });

    ws.on('close', () => {
        if (clientId) {
            clients.delete(clientId);
            clientHeartbeats.delete(clientId);
            console.log(
                '🔌 WebSocket disconnected: ' + clientId + ' (total: ' + clients.size + ')'
            );
        }
    });

    ws.on('error', error => {
        console.error('❌ WebSocket error for client ' + clientId + ':', error);
    });

    // Send initial heartbeat request
    ws.send(JSON.stringify({ type: 'heartbeat_request' }));
});

// Error handling for the server
server.on('error', error => {
    console.error('❌ Server error:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

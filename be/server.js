const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;

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

app.post('/call', (req, res) => {
    const { id, apiname, apiparams } = req.body;

    console.log(req.headers, req.body);

    if (!id || !apiname) {
        return res.status(400).json({ error: 'Missing required parameters' });
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

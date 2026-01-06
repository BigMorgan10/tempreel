require('dotenv').config();
const { WebSocketServer } = require('ws');
const { v4: uuid } = require('uuid');

const PORT   = process.env.PORT || 8080;
const SECRET = process.env.WAR_ROOM_SECRET;

const wss = new WebSocketServer({ port: PORT });
const roles = { visitor: new Map(), war: null };

function auth(role, key) {
  if (role === 'visitor') return true;
  if (role === 'war') return key === SECRET;
  return false;
}

function broadcastToWar(msg) {
  if (roles.war?.readyState === 1) roles.war.send(JSON.stringify(msg));
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const role = url.searchParams.get('role');
  const key  = url.searchParams.get('key');

  if (!auth(role, key)) return ws.close(1008, 'Unauthorized');

  if (role === 'war') {
    roles.war = ws;
    console.log('🔥 War-room connected');
    ws.on('close', () => (roles.war = null));
    return;
  }

  const id = uuid();
  roles.visitor.set(id, ws);
  console.log(`👤 Visitor ${id} connected – ${wss.clients.size} total`);

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      msg.visitorId = id;
      broadcastToWar(msg);
    } catch {}
  });

  ws.on('close', () => roles.visitor.delete(id));
});

console.log(`✅ WebSocket listening on ws://0.0.0.0:${PORT}`);

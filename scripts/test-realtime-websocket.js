const http = require('http');
const net = require('net');
const crypto = require('crypto');

const host = process.env.SOP_TEST_HOST || '127.0.0.1';
const port = Number(process.env.SOP_TEST_PORT || process.env.PORT || 3010);
const username = process.env.SOP_TEST_USER || process.env.ADMIN_USER || 'admin';
const password = process.env.SOP_TEST_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

function httpJson(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? '' : JSON.stringify(body);
    const headers = { Accept: 'application/json' };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (cookie) {
      headers.Cookie = cookie;
    }

    const req = http.request({ host, port, method, path, headers }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = { raw };
        }
        resolve({ status: res.statusCode, headers: res.headers, data, raw });
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function decodeFrames(buffer) {
  const frames = [];
  let offset = 0;

  while (buffer.length - offset >= 2) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    let length = second & 0x7f;
    let headerLength = 2;

    if (length === 126) {
      if (buffer.length - offset < 4) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (buffer.length - offset < 10) break;
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }

    const masked = Boolean(second & 0x80);
    const frameLength = headerLength + (masked ? 4 : 0) + length;
    if (buffer.length - offset < frameLength) break;

    let payload = buffer.subarray(offset + headerLength + (masked ? 4 : 0), offset + frameLength);
    if (masked) {
      const mask = buffer.subarray(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
    }

    frames.push({ opcode: first & 0x0f, text: payload.toString('utf8') });
    offset += frameLength;
  }

  return { frames, rest: buffer.subarray(offset) };
}

async function waitFor(messages, predicate, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const found = messages.find(predicate);
    if (found) {
      return found;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout aguardando WebSocket. Mensagens: ${JSON.stringify(messages)}`);
}

async function main() {
  let socket;

  try {
    const login = await httpJson('POST', '/api/login', { username, password });
    if (login.status !== 200) {
      throw new Error(`Login falhou: ${login.status} ${login.raw}`);
    }

    const setCookie = login.headers['set-cookie'];
    const cookie = (Array.isArray(setCookie) ? setCookie[0] : String(setCookie || '')).split(';')[0];
    if (!cookie) {
      throw new Error('Cookie de sessao nao retornado.');
    }

    const messages = [];
    let buffer = Buffer.alloc(0);
    let handshake = '';
    let handshakeDone = false;

    socket = net.createConnection({ host, port });
    socket.on('data', (chunk) => {
      if (!handshakeDone) {
        handshake += chunk.toString('binary');
        const splitAt = handshake.indexOf('\r\n\r\n');
        if (splitAt < 0) return;

        const header = handshake.slice(0, splitAt);
        if (!/^HTTP\/1\.1 101/.test(header)) {
          throw new Error(`Handshake WebSocket falhou: ${header}`);
        }

        buffer = Buffer.concat([buffer, Buffer.from(handshake.slice(splitAt + 4), 'binary')]);
        handshakeDone = true;
      } else {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const decoded = decodeFrames(buffer);
      buffer = decoded.rest;
      for (const frame of decoded.frames) {
        if (frame.opcode === 1 && frame.text) {
          messages.push(JSON.parse(frame.text));
        }
      }
    });

    await new Promise((resolve, reject) => {
      socket.once('connect', resolve);
      socket.once('error', reject);
    });

    const key = crypto.randomBytes(16).toString('base64');
    socket.write([
      'GET /api/realtime HTTP/1.1',
      `Host: localhost:${port}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
      `Cookie: ${cookie}`,
      '',
      ''
    ].join('\r\n'));

    const connected = await waitFor(messages, (message) => message.type === 'connected');

    const customerName = `HOMOLOG_WS_TEST_${Date.now()}`;
    const created = await httpJson('POST', '/api/admin/customers', { name: customerName }, cookie);
    if (created.status !== 201) {
      throw new Error(`Criacao de cliente teste falhou: ${created.status} ${created.raw}`);
    }

    const change = await waitFor(
      messages,
      (message) => message.type === 'data-change' && Array.isArray(message.scopes) && message.scopes.includes('admin')
    );

    const customerId = created.data.customer && created.data.customer.id;
    let cleanupDeleteStatus = null;
    if (customerId) {
      const deleted = await httpJson('DELETE', `/api/admin/customers/${encodeURIComponent(customerId)}`, undefined, cookie);
      cleanupDeleteStatus = deleted.status;
    }

    console.log(JSON.stringify({
      ok: true,
      target: `ws://${host}:${port}/api/realtime`,
      user: login.data.user && login.data.user.username,
      connected,
      receivedChange: change,
      cleanupDeleteStatus,
      messageCount: messages.length
    }, null, 2));

    socket.destroy();
  } catch (error) {
    if (socket) {
      socket.destroy();
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});

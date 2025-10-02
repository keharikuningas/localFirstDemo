import http from 'http'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils.js'

const PORT = process.env.PORT || 1234

const server = http.createServer()
const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
  // Room name is the 2nd argument on client; no extra path needed
  setupWSConnection(conn, req, { gc: true, pingTimeout: 30000 })
})

server.listen(PORT, () => {
  console.log(`✅ Yjs WebSocket relay listening on ${PORT}`)
})

// src/sync.js — Local-first state with Yjs (CRDT) + P2P transport (y-webrtc)
//
// What this file does:
//
// 1) Creates a Yjs document (the CRDT), which holds our shared state.
// 2) Connects browsers to each other via WebRTC using a small *signaling* server.
//    - No app server is required for data. Each client stores & syncs data locally.
//    - Edits are merged automatically and deterministically by the CRDT.
// 3) Exposes a Yjs Array (`colors`) that represents the 8×8 board (64 cells).
//    Each cell stores a single string (a hex color like '#ffffff').
// 4) Seeds the board exactly once per “room” using a tiny leader-election
//    so two tabs opened at the same time don’t double-seed.
// 5) Exports mutation helpers:
//    - toggleSquare(i): switch a cell between BLACK/WHITE (legacy behavior)
//    - setSquareColor(i, hex): set an explicit color (used by the palette)

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// ---- Room & transport configuration ----------------------------------------

// All peers who use the same ROOM id will sync the same CRDT document.
const ROOM = 'crdt-chessboard-demo-v1'

// On LAN demos we run a local signaling server so peers can discover each other.
// (This server does *not* store your data; it only helps peers connect.)
// Start it with: node node_modules/y-webrtc/bin/server.js --port 4444

// Base colors we use to seed the board and to support the old toggle.
const WHITE = '#ffffff'
const BLACK = '#222222'

// ---- Create the CRDT & connect peers ---------------------------------------

// A Y.Doc is your local CRDT instance. Every browser tab has its own copy.
export const ydoc = new Y.Doc()

// WebRTC provider wires tabs together. The `signaling` URL is only used to
// coordinate the initial peer connection; after that data flows P2P.
export const provider = new WebsocketProvider(
  'wss://<your-yws-service>.onrender.com', // your Render websocket service
  ROOM,
  ydoc,
  { connect: true }
)

// ---- Shared state: a grow-only ordered container of 64 color strings --------
//
// We store the board as a Y.Array named 'colors' with 64 items.
// Index = cell id (0..63). Value = '#rrggbb' string.
export const colors = ydoc.getArray('colors')

// ---- Initial state: seed exactly once --------------------------------------
//
// When a brand-new room is opened (first peer), we need an initial 8×8 board.
// When multiple peers open simultaneously, both might try to seed.
// To avoid a “double board”, we elect the peer with the *lowest awareness id*
// to be the leader; only that peer seeds *if the array is still empty*.

function seedBoard() {
  // A Yjs transaction groups multiple operations into a single change.
  ydoc.transact(() => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Alternate BLACK/WHITE for a chess pattern.
        colors.push([ (r + c) % 2 ? BLACK : WHITE ])
      }
    }
  })
}

// Debounced leader election: wait a beat so peers can announce themselves.
// Then, if the array is still empty, the peer with the lowest clientID seeds.
let seeded = false
let electionTimer = null

function electAndSeed() {
  // If someone already seeded or the doc already has data, do nothing.
  if (seeded || colors.length !== 0) return

  // Awareness holds a small ephemeral presence map (one entry per peer).
  // Keys are numeric clientIDs assigned by the provider.
  const ids = [...provider.awareness.getStates().keys()]
  if (ids.length === 0) ids.push(provider.awareness.clientID) // solo startup case

  const leader = Math.min(...ids)
  if (provider.awareness.clientID === leader) {
    seedBoard()
    seeded = true
  }
}

// Schedule the election a short time after any sync/awareness change.
// The 800ms delay gives other peers time to appear so we don't double-seed.
function scheduleElection() {
  clearTimeout(electionTimer)
  electionTimer = setTimeout(electAndSeed, 800)
}

// When the transport connects or peers change, (re)run the election.
provider.on('synced', scheduleElection)
provider.awareness.on('change', scheduleElection)
provider.on('status', scheduleElection)

// Also try once shortly after startup so a single client seeds when alone.
setTimeout(scheduleElection, 300)

// ---- Mutations: the only way the UI should change state --------------------
//
// IMPORTANT CRDT TIP:
// Always mutate via Yjs operations (delete/insert/set in a transaction).
// Never mutate plain JS arrays; React state in your app should *mirror* Yjs,
// not replace it.

export function toggleSquare(index) {
  // Legacy behavior: flip a cell between BLACK and WHITE.
  const cur = colors.get(index)
  ydoc.transact(() => {
    colors.delete(index, 1)
    colors.insert(index, [cur === BLACK ? WHITE : BLACK])
  })
}

export function setSquareColor(index, hex) {
  // Explicitly set a cell color (used by the palette).
  ydoc.transact(() => {
    colors.delete(index, 1)
    colors.insert(index, [hex])
  })
}

// (Optional) small helpers you might find handy later:
//
// export function resetBoard() {
//   ydoc.transact(() => {
//     colors.delete(0, colors.length)
//     seedBoard()
//   })
// }
//
// export function fillBoard(hex) {
//   ydoc.transact(() => {
//     colors.delete(0, colors.length)
//     for (let i = 0; i < 64; i++) colors.push([hex])
//   })
// }

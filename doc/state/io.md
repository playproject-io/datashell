# Using the `io` Module

## Overview

The `io` module provides a simple in-memory peer-to-peer communication interface for modules within the same process. It enables message passing between module instances using unique IDs, simulating network-like connections for local stateful modules.

---

## Initializing `io`

```js
const io = require('io')
const peer = io(seed, alias)
```

1. Import the `io` module and initialize it with a unique `seed` (string) and an optional `alias`.
2. The returned `peer` object exposes two main methods: `at` (to connect to another peer) and `on` (to handle incoming connections).

---

## API Reference

### `io(seed, alias)`

- **Parameters:**
  - `seed` (string): Unique identifier for the peer. Must not collide with other peers.
  - `alias` (string, optional): Human-readable alias for the peer.
- **Returns:** An object with methods:
  - `at(id, signal)`: Initiates a connection to another peer by `id`.
  - `on(handler)`: Registers a handler for incoming connections.

#### Example

```js
const peerA = io('peerA')
const peerB = io('peerB')

peerB.on(port => {
  port.onmessage = event => {
    console.log('Received:', event.data)
  }
})

peerA.at('peerB').then(() => {
  // Send a message after connection
  peerA.peer['peerB'].postMessage({ type: 'greet', args: 'Hello!' })
})
```

---

## Method Details

### `at(id, signal)`

- **Purpose:** Connects to another peer by their `id`.
- **Parameters:**
  - `id` (string): The target peer's unique ID.
  - `signal` (AbortSignal, optional): Timeout or cancellation signal (default: 1000ms).
- **Behavior:**
  - Throws if attempting to connect to self.
  - Waits if the target peer is offline, or connects immediately if online.
  - Establishes a `MessageChannel` between peers for bidirectional communication.

### `on(handler)`

- **Purpose:** Registers a callback to handle incoming connections.
- **Parameters:**
  - `handler` (function): Receives a `port` object representing the connection.
- **Behavior:**
  - The handler is called when another peer connects.
  - The `port` object supports `onmessage` and `postMessage` for message exchange.

---

## Usage Patterns

### Peer-to-Peer Messaging

- Each peer must have a unique `seed`.
- Use `at` to initiate connections and `on` to handle them.
- Message passing is done via the `port` object, which mimics the Web `MessagePort` API.

### Error Handling

- Attempting to reuse a `seed` throws an error.
- Connecting to self is not allowed.
- If the target peer is offline, the connection waits until the peer comes online or the signal times out.

---

## Best Practices

1. **Unique Seeds:** Always use unique `seed` values for each peer to avoid conflicts.
2. **Connection Management:** Handle connection timeouts and errors gracefully.
3. **Message Structure:** Use consistent message formats (e.g., `{ type, args }`) for clarity.
4. **Cleanup:** Remove or close unused peers to free resources.

---

## Example Integration

The `io` module is typically used in conjunction with stateful modules (see `STATE` documentation) to enable inter-module communication. For example, UI components can use `io` to send events or synchronize state across isolated instances.

---

This documentation provides a comprehensive guide to using the `io` module for local peer-to-peer communication in your applications. For advanced usage, refer to example modules and integration patterns in the codebase.

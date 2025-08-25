# DataShell Framework API Reference

Complete API documentation for the DataShell framework, covering all modules, methods, and interfaces.

## Core APIs

### STATE Module

The STATE module is the foundation of DataShell's reactive data management system.

#### Initialization

```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get, io } = statedb(fallback_module)
```

**Parameters:**
- `__filename` (string): Built-in Node.js variable containing current file path
- `fallback_module` (function): Function returning default data structure

**Returns:**
- `sdb` (object): State database interface (module-level)
- `get` (function): Instance state getter
- `io` (object): Network I/O interface

#### get(sid)

Retrieves state database interface for a specific instance.

```js
const { id, sdb } = await get(opts.sid)
```

**Parameters:**
- `opts.sid` (symbol): Unique instance identifier

**Returns:**
- `id` (string): Instance identifier
- `sdb` (object): Instance-specific state database

---

## State Database Interface (sdb)

### sdb.watch(onbatch)

Registers a callback for state changes and returns submodule instance IDs.

```js
const subs = await sdb.watch(onbatch)
```

**Parameters:**
- `onbatch` (function): Callback for handling state changes
  ```js
  async function onbatch(batch) {
    for (const { type, paths } of batch) {
      const data = await Promise.all(
        paths.map(path => sdb.drive.get(path).then(file => file.raw))
      )
      on[type] && on[type](data)
    }
  }
  ```

**onbatch Parameters:**
- `batch` (array): Array of change objects
  - `type` (string): Dataset type (matches fallback drive keys)
  - `paths` (array): Array of changed file paths

**Returns:**
- `subs` (array): Array of submodule instance objects
  ```js
  [
    { sid: Symbol('instance_0'), type: 'module_name' },
    { sid: Symbol('instance_1'), type: 'module_name' }
  ]
  ```

### sdb.drive

File system interface for data persistence.

#### sdb.drive.list(path?)

Lists datasets or files within a dataset.

```js
const datasets = sdb.drive.list()           // ['style/', 'data/', 'icons/']
const files = sdb.drive.list('data/')       // ['user.json', 'settings.json']
```

**Parameters:**
- `path` (string, optional): Dataset path to list files from

**Returns:**
- `array`: Dataset names (with trailing '/') or filenames

#### sdb.drive.get(path)

Retrieves file object from the drive.

```js
const file = sdb.drive.get('data/user.json')
```

**Parameters:**
- `path` (string): Full file path in format `'dataset/filename.ext'`

**Returns:**
- `object | null`: File object or null if not found
  ```js
  {
    id: 'unique_file_id',
    name: 'user.json',
    type: 'json',
    raw: { /* file content */ }
  }
  ```

#### sdb.drive.put(path, buffer)

Stores data in the drive.

```js
const file = sdb.drive.put('data/user.json', { name: 'John', age: 30 })
```

**Parameters:**
- `path` (string): Full file path in format `'dataset/filename.ext'`
- `buffer` (any): Content to store (object, string, etc.)

**Returns:**
- `object`: Created file object
  ```js
  {
    id: 'unique_file_id',
    name: 'user.json', 
    type: 'json',
    raw: { name: 'John', age: 30 }
  }
  ```

**Note:** Triggers `onbatch()` callback with the updated dataset type.

#### sdb.drive.has(path)

Checks if a file exists in the drive.

```js
if (sdb.drive.has('data/config.json')) {
  // File exists
}
```

**Parameters:**
- `path` (string): Full file path to check

**Returns:**
- `boolean`: True if file exists, false otherwise

### sdb.get(sid)

Returns read-only drive interface for a submodule instance.

```js
const sub_drive = sdb.get(subs[0].sid)
const file = sub_drive.get('data/child_data.json')
```

**Parameters:**
- `sid` (symbol): Submodule instance ID

**Returns:**
- `object`: Read-only drive interface (no `put` method)

---

## Fallback System

### fallback_module()

Defines default module data and API structure.

```js
function fallback_module() {
  return {
    api: fallback_instance,
    _: { /* submodule definitions */ },
    drive: { /* default data */ },
    net: { /* network configuration */ }
  }
}
```

**Return Object Properties:**

#### api (function)
Reference to `fallback_instance` function for user customization.

#### _ (object)
Submodule definitions. Each key is a module path/name:

```js
_: {
  './child_module': {
    $: '',                    // Required module marker (string | function)
    0: override_function,     // Instance overrides (optional)
    1: another_override,      // Additional instances (optional)
    mapping: {               // Required dataset mapping
      style: 'style',
      data: 'data'
    }
  }
}
```

**Submodule Properties:**
- `$` (string | function): Module creation marker (required)
- `[number]` (string | function): Instance overrides (optional)
- `mapping` (object): Maps submodule datasets to parent datasets (required)

#### drive (object)
Default data organized by dataset type:

```js
drive: {
  'style/': {
    'theme.css': {
      raw: '/* CSS content */',     // Inline content
      // OR
      '$ref': 'external.css'        // External file reference
    }
  },
  'data/': {
    'defaults.json': {
      raw: { setting: 'value' }
    }
  }
}
```

**Dataset Structure:**
- Key: Dataset name with trailing '/' (e.g., `'style/'`, `'data/'`)
- Value: Object with filename keys
  - `raw` (any): Inline file content
  - `$ref` (string): Path to external file (relative to module)

#### net (array, optional)
Network configuration for P2P communication:

```js
net: [
  { node_id: 'target_node', event: 'message_type', data: payload }
]
```

### fallback_instance()

Defines user-customizable data and instance-level submodules.

```js
function fallback_instance() {
  return {
    _: { /* instance submodules */ },
    drive: { /* user data */ },
    net: { /* network config */ }
  }
}
```

**Structure is similar to `fallback_module()` but for instance-level customization.**

---

## Module Patterns

### Standard Module Structure

```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(fallback_module)

// Import submodules
const child_module = require('./child')

module.exports = my_module

async function my_module(opts, protocol) {
  const { id, sdb } = await get(opts.sid)
  
  // Communication setup
  let send = null
  if (protocol) {
    send = protocol(handle_parent_message)
  }
  
  // State change handlers
  const on = {
    style: inject_styles,
    data: handle_data_change,
    config: handle_config_change
  }
  
  // DOM setup
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `<!-- HTML template -->`
  
  // State watching
  const subs = await sdb.watch(onbatch)
  
  // Submodule mounting
  child_module(subs[0], child_protocol).then(child_el => {
    shadow.querySelector('.child-container').appendChild(child_el)
  })
  
  // Event handlers
  setup_event_handlers()
  
  return el
  
  // Function definitions
  async function onbatch(batch) { /* ... */ }
  function inject_styles(data) { /* ... */ }
  function handle_data_change(data) { /* ... */ }
  function child_protocol(send) { /* ... */ }
  function handle_parent_message({ type, data }) { /* ... */ }
  function setup_event_handlers() { /* ... */ }
}

function fallback_module() {
  return { /* ... */ }
}
```

### Protocol Communication

#### Parent Side

```js
function child_protocol(send) {
  // Store child's send function
  _.child_send = send
  
  // Return parent's message handler
  return handle_child_message
  
  function handle_child_message({ type, data }) {
    switch (type) {
      case 'event_type':
        handle_event(data)
        break
      case 'request':
        send_response(data.id, process_request(data))
        break
      default:
        console.warn('Unknown message type:', type)
    }
  }
}

function send_to_child(type, data) {
  if (_.child_send) {
    _.child_send({ type, data })
  }
}
```

#### Child Side

```js
async function child_module(opts, protocol) {
  // ... setup ...
  
  let send_to_parent = null
  
  if (protocol) {
    send_to_parent = protocol(handle_parent_message)
  }
  
  function notify_parent(type, data) {
    if (send_to_parent) {
      send_to_parent({ type, data })
    }
  }
  
  function handle_parent_message({ type, data }) {
    // Handle messages from parent
  }
  
  return el
}
```

---

## Event System

### DOM Event Handling

DataShell uses direct event assignment instead of `addEventListener`:

```js
// ✅ Correct
button.onclick = handle_click
input.onchange = handle_input_change
form.onsubmit = handle_form_submit

// ❌ Avoid
button.addEventListener('click', handle_click)
```

### Custom Events

For complex event handling within shadow DOM:

```js
function emit_custom_event(element, type, detail) {
  const event = new CustomEvent(type, { 
    detail,
    bubbles: false,  // Keep within shadow DOM
    cancelable: true 
  })
  element.dispatchEvent(event)
}

// Usage
emit_custom_event(shadow.querySelector('.item'), 'item-selected', { id: 123 })
```

---

## File System Integration

### External File References

Use `$ref` to include files from the module directory:

```js
drive: {
  'style/': {
    'main.css': {
      '$ref': 'styles.css'        // File in same directory
    },
    'theme.css': {
      '$ref': '../shared/theme.css'  // Relative path
    }
  },
  'icons/': {
    'sprites.svg': {
      '$ref': 'assets/icons.svg'   // Subdirectory
    }
  }
}
```

**Reference Resolution:**
- Paths are relative to the module file location
- Files are loaded at module initialization
- Content is cached and treated as `raw` data

### File Type Detection

File types are automatically detected from extensions:

```js
// Detected types
'data.json'     → type: 'json'
'styles.css'    → type: 'css'
'icon.svg'      → type: 'svg'
'doc.txt'       → type: 'txt'
'config.xml'    → type: 'xml'
'data.bin'      → type: 'binary'
```

---

## Network & P2P APIs

### Network Configuration

Configure P2P communication in fallbacks:

```js
function fallback_instance() {
  return {
    net: {
      'peer_node_id': {
        'user_joined': { type: 'notification', message: 'User joined' },
        'data_sync': { type: 'sync', timestamp: Date.now() }
      }
    }
  }
}
```

### P2P Events

Network events automatically trigger data synchronization:

```js
function onbatch(batch) {
  for (const { type, paths } of batch) {
    if (type === 'net') {
      handle_network_events(paths)
    }
  }
}

function handle_network_events(event_paths) {
  event_paths.forEach(path => {
    const [node_id, event_type] = path.split('/')
    console.log(`Network event from ${node_id}: ${event_type}`)
  })
}
```

---

## Development Tools

### CLI Interface

```bash
# Show help
ds

# Create new project (future)
ds create my-app

# Build project (future) 
ds build

# Development server (future)
ds serve --port 3000
```

### Debugging

#### State Inspection

```js
// Log current state
console.log('Current drive state:', sdb.drive.list())

// Inspect specific files
const user_data = sdb.drive.get('data/user.json')
console.log('User data:', user_data?.raw)

// Watch all state changes
function debug_onbatch(batch) {
  console.log('State changes:', batch)
  // Call original handler
  onbatch(batch)
}

const subs = await sdb.watch(debug_onbatch)
```

#### Protocol Debugging

```js
function debug_protocol(send) {
  return (message) => {
    console.log('Received from child:', message)
    return handle_message(message)
  }
}

function debug_send(type, data) {
  console.log('Sending to parent:', { type, data })
  if (send_to_parent) {
    send_to_parent({ type, data })
  }
}
```

### Error Handling

#### State Access Errors

```js
function safe_get(path) {
  try {
    return sdb.drive.get(path)?.raw
  } catch (error) {
    console.warn(`Failed to get ${path}:`, error)
    return null
  }
}

function safe_put(path, data) {
  try {
    sdb.drive.put(path, data)
    return true
  } catch (error) {
    console.error(`Failed to put ${path}:`, error)
    return false
  }
}
```

#### Module Loading Errors

```js
async function safe_load_submodule(module_path, sid) {
  try {
    const module = require(module_path)
    return await module(sid)
  } catch (error) {
    console.error(`Failed to load ${module_path}:`, error)
    
    // Return fallback element
    const fallback_el = document.createElement('div')
    fallback_el.textContent = `Failed to load ${module_path}`
    fallback_el.style.color = 'red'
    return fallback_el
  }
}
```

---

## Performance APIs

### Batch Operations

Process multiple state changes efficiently:

```js
function batch_updates(updates) {
  // Group updates by dataset type
  const groups = updates.reduce((acc, { path, data }) => {
    const type = path.split('/')[0] + '/'
    if (!acc[type]) acc[type] = []
    acc[type].push({ path, data })
    return acc
  }, {})
  
  // Apply all updates (triggers single onbatch per type)
  Object.values(groups).forEach(group => {
    group.forEach(({ path, data }) => {
      sdb.drive.put(path, data)
    })
  })
}
```

### Memory Management

```js
function create_disposable_module(opts) {
  let cleanup_functions = []
  
  // ... module setup ...
  
  // Track resources for cleanup
  const interval = setInterval(update_data, 1000)
  cleanup_functions.push(() => clearInterval(interval))
  
  const observer = new MutationObserver(handle_mutations)
  observer.observe(shadow, { childList: true })
  cleanup_functions.push(() => observer.disconnect())
  
  // Return element with cleanup capability
  el._dispose = () => {
    cleanup_functions.forEach(fn => fn())
    cleanup_functions = []
  }
  
  return el
}
```

### Performance Monitoring

```js
function performance_monitor(module_name) {
  const metrics = {
    init_time: 0,
    batch_count: 0,
    avg_batch_time: 0,
    total_batch_time: 0
  }
  
  const start_time = performance.now()
  
  return {
    onbatch: function(batch) {
      const batch_start = performance.now()
      
      // Process batch
      original_onbatch(batch)
      
      // Update metrics
      const batch_time = performance.now() - batch_start
      metrics.batch_count++
      metrics.total_batch_time += batch_time
      metrics.avg_batch_time = metrics.total_batch_time / metrics.batch_count
      
      if (batch_time > 16) {
        console.warn(`${module_name}: Slow batch (${batch_time.toFixed(2)}ms)`)
      }
    },
    
    complete_init: function() {
      metrics.init_time = performance.now() - start_time
      console.log(`${module_name} metrics:`, metrics)
    }
  }
}
```

---

## Build System APIs

### Browserify Integration

```bash
# Basic build
npx browserify -i STATE my-app.js -o bundle.js

# With transforms
npx browserify -i STATE -t babelify my-app.js -o bundle.js

# Development build with source maps
npx browserify -i STATE -d my-app.js -o bundle.js
```

### Boot Configuration

```js
// boot.js - Advanced configuration
const env = {
  version: 'latest',          // Framework version
  debug: true,                // Enable debug mode
  p2p: true,                 // Enable P2P networking
  storage: 'indexeddb'       // Storage backend
}

const arg = {
  x: 321,                    // App-specific config
  y: 543,
  theme: 'dark'
}

const url = 'https://playproject.io/datashell/shim.js'
const src = `${url}?${new URLSearchParams(env)}#${new URLSearchParams(arg)}`

// Load framework
if (this.open) {
  document.body.append(Object.assign(document.createElement('script'), { src }))
} else {
  importScripts(src)
}
```

### Version Management

Check available versions:

```js
fetch('http://playproject.io/datashell/drive.json')
  .then(res => res.json())
  .then(versions => {
    console.log('Available versions:', versions)
    // Use specific version
    load_version(versions.stable)
  })
```

---

## Testing APIs

### Mock STATE

For unit testing modules:

```js
function create_mock_state() {
  const mock_drive = new Map()
  
  return {
    drive: {
      get: (path) => mock_drive.get(path) || null,
      put: (path, data) => {
        const file = { id: 'test', name: path.split('/').pop(), type: 'test', raw: data }
        mock_drive.set(path, file)
        return file
      },
      has: (path) => mock_drive.has(path),
      list: (path) => {
        if (!path) return ['test/']
        return Array.from(mock_drive.keys())
          .filter(key => key.startsWith(path))
          .map(key => key.split('/').pop())
      }
    },
    watch: (callback) => {
      // Return empty subs array for tests
      return Promise.resolve([])
    }
  }
}
```

### Test Utilities

```js
// Test module in isolation
async function test_module(module_fn, initial_data = {}) {
  const mock_sdb = create_mock_state()
  
  // Populate test data
  Object.entries(initial_data).forEach(([path, data]) => {
    mock_sdb.drive.put(path, data)
  })
  
  // Mock get function
  const mock_get = async (sid) => ({
    id: 'test-id',
    sdb: mock_sdb
  })
  
  // Test module
  const result = await module_fn({ sid: Symbol('test') })
  return { element: result, state: mock_sdb }
}

// Usage
const { element, state } = await test_module(my_module, {
  'data/user.json': { name: 'Test User' }
})
```

---

## Migration & Compatibility

### Version Compatibility

Check framework compatibility:

```js
function check_compatibility(required_version) {
  const current = get_framework_version()
  
  if (!is_compatible(current, required_version)) {
    throw new Error(`Framework version ${current} incompatible with required ${required_version}`)
  }
}

function get_framework_version() {
  // Framework provides version info
  return window.DataShell?.version || 'unknown'
}
```

### State Migration

Handle data format changes:

```js
function migrate_data(data, from_version, to_version) {
  const migrations = {
    '1.0.0->1.1.0': migrate_1_0_to_1_1,
    '1.1.0->2.0.0': migrate_1_1_to_2_0
  }
  
  const migration_key = `${from_version}->${to_version}`
  const migrate_fn = migrations[migration_key]
  
  return migrate_fn ? migrate_fn(data) : data
}

function migrate_1_0_to_1_1(data) {
  // Example: rename field
  if (data.userName) {
    data.user_name = data.userName
    delete data.userName
  }
  return data
}
```

---

## Error Codes & Messages

### Common Error Patterns

| Error Code | Description | Solution |
|------------|-------------|----------|
| `STATE_INIT_FAILED` | STATE module initialization failed | Check fallback_module function |
| `DRIVE_ACCESS_ERROR` | Cannot access drive data | Verify path format and permissions |
| `SUBMODULE_LOAD_ERROR` | Submodule failed to load | Check module path and exports |
| `PROTOCOL_ERROR` | Communication protocol error | Verify message format and handlers |
| `SHADOW_DOM_ERROR` | Shadow DOM creation failed | Check DOM structure and CSS |

### Error Handling Patterns

```js
function handle_framework_error(error, context) {
  const error_info = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    context,
    timestamp: Date.now(),
    stack: error.stack
  }
  
  // Log for debugging
  console.error('DataShell Error:', error_info)
  
  // Store for later analysis
  if (sdb?.drive) {
    sdb.drive.put('errors/latest.json', error_info)
  }
  
  // Show user-friendly message
  show_error_message(get_user_message(error.code))
}
```

---

## Advanced Configuration

### Framework Options

```js
// Advanced boot.js configuration
const framework_config = {
  version: 'latest',
  features: {
    p2p_networking: true,
    offline_storage: true,
    debug_tools: process.env.NODE_ENV === 'development',
    performance_monitoring: true
  },
  storage: {
    backend: 'indexeddb',
    encryption: true,
    compression: false
  },
  network: {
    discovery: 'mdns',
    transport: 'webrtc',
    fallback: 'websocket'
  }
}
```

### Custom Storage Backends

```js
function create_custom_storage(config) {
  return {
    async get(key) {
      // Custom storage implementation
    },
    async put(key, value) {
      // Custom storage implementation  
    },
    async delete(key) {
      // Custom storage implementation
    },
    async list(prefix) {
      // Custom storage implementation
    }
  }
}
```

---

This comprehensive API reference covers all aspects of the DataShell framework. For practical examples and tutorials, see the [guide](./guide.md), and for deeper philosophical understanding, check the [concepts](./concepts.md).
# DataShell Framework: Complete Developer Guide

This comprehensive guide walks you through building peer-to-peer applications with DataShell's state management framework. From basic concepts to advanced patterns, you'll learn everything needed to create decentralized apps where users own their data.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding STATE](#understanding-state)
3. [Building Your First Component](#building-your-first-component)
4. [Working with Submodules](#working-with-submodules)
5. [State Management Patterns](#state-management-patterns)
6. [Communication Between Modules](#communication-between-modules)
7. [Data Persistence & Sync](#data-persistence--sync)
8. [Advanced Patterns](#advanced-patterns)
9. [Performance Optimization](#performance-optimization)
10. [Common Patterns](#common-patterns)

## Getting Started

### The DataShell Philosophy

DataShell addresses a fundamental problem: users have lost control over their data. While cloud storage solved backup issues, it created a new problem where Big Tech companies own and control our personal information.

DataShell's solution:
- **User-owned data vaults**: Users control their own encrypted data
- **P2P infrastructure**: No central servers or single points of failure
- **Open standards**: Interoperable data formats and protocols
- **GDPR compliance**: Privacy by design

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │    │   DataShell     │    │   P2P Network   │
│                 │    │   Framework     │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │◄┼────┤ │   STATE     │◄┼────┤ │ Data Vaults │ │
│ │             │ │    │ │   Module    │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Shadow DOM  │ │    │ │ Drive API   │◄┼────┤ │ Sync Layer  │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Setup

Every DataShell project follows this structure:

```
my-app/
├── index.html      # Minimal HTML loader
├── boot.js         # Framework bootstrapper  
├── bundle.js       # Compiled application (generated)
├── my-app.js       # Main application entry
├── components/     # Reusable components
│   ├── header.js
│   ├── sidebar.js
│   └── content.js
└── assets/         # Static assets (referenced via $ref)
    ├── styles.css
    └── icons.svg
```

## Understanding STATE

The STATE module is DataShell's reactive data management system. It provides:
- **Persistent storage** in user-owned vaults
- **Real-time synchronization** across P2P networks  
- **Reactive updates** when data changes
- **Modular isolation** between components

### Basic STATE Usage

Every module starts with this pattern:

```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(fallback_module)
```

**What each part does:**
- `STATE(__filename)`: Creates a state database factory for this module
- `statedb(fallback_module)`: Registers default data and returns APIs
- `{ sdb, get }`: Destructures the state database and instance getter

### Fallback System Deep Dive

Fallbacks define your module's data structure and API:

```js
function fallback_module() {
  return {
    api: fallback_instance,        // User customization API
    _: {                          // Submodule definitions  
      'child_module': {
        $: '',                    // Module creation key (required)
        0: custom_override,       // Instance overrides
        1: another_override,
        mapping: {               // Dataset mapping (required)
          style: 'style'
        }
      }
    },
    drive: {                     // Default data storage
      'style/': {
        'theme.css': {
          raw: `/* CSS content */`
        }
      }
    }
  }
  
  function fallback_instance() {
    return {
      _: {                       // Instance-level submodules
        'child_module': {
          0: '',
          mapping: { style: 'style' }
        }
      },
      drive: {                   // User-customizable data
        'style/': {
          'custom.css': {
            raw: `/* User styles */`
          }
        }
      }
    }
  }
}
```

### Drive API Reference

The drive stores files organized in datasets:

```js
// List datasets
const datasets = sdb.drive.list()  // ['style/', 'icons/', 'data/']

// List files in dataset  
const files = sdb.drive.list('data/')  // ['user.json', 'settings.json']

// Get file content
const file = sdb.drive.get('data/user.json')
// Returns: { id, name, type, raw }

// Store new file
sdb.drive.put('data/profile.json', { name: 'John', age: 30 })

// Check if file exists
if (sdb.drive.has('data/config.json')) {
  // File exists
}
```

## Building Your First Component

Let's build a user profile component step by step:

### Step 1: Define the Module Structure

```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(fallback_module)

module.exports = user_profile

async function user_profile(opts) {
  // Component implementation goes here
}

function fallback_module() {
  // Fallback data goes here
}
```

### Step 2: Set Up State and DOM

```js
async function user_profile(opts) {
  const { id, sdb } = await get(opts.sid)
  
  // Define what functions handle data changes
  const on = {
    style: inject_styles,
    data: handle_data_update
  }
  
  // Create shadow DOM
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="profile-container">
      <div class="avatar"></div>
      <div class="info">
        <h2 class="name">Loading...</h2>
        <p class="email">Loading...</p>
        <button class="edit-btn">Edit Profile</button>
      </div>
    </div>
  `
  
  // Start watching for state changes
  const subs = await sdb.watch(onbatch)
  
  // Set up event handlers
  const edit_btn = shadow.querySelector('.edit-btn')
  edit_btn.onclick = handle_edit_click
  
  return el
  
  // Function definitions below...
}
```

### Step 3: Handle State Changes

```js
function onbatch(batch) {
  for (const { type, paths } of batch) {
    // Get data for all changed files
    const data = await Promise.all(
      paths.map(path => sdb.drive.get(path).then(file => file.raw))
    )
    
    // Call appropriate handler
    on[type] && on[type](data)
  }
}

function inject_styles(data) {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(data[0])  // First file in style dataset
  shadow.adoptedStyleSheets = [sheet]
}

function handle_data_update(data) {
  const user_data = data.find(d => d.name)  // Find user data
  if (user_data) {
    shadow.querySelector('.name').textContent = user_data.name
    shadow.querySelector('.email').textContent = user_data.email
  }
}

function handle_edit_click() {
  // Update user data
  const new_data = { name: 'Updated Name', email: 'new@example.com' }
  sdb.drive.put('data/user.json', new_data)
}
```

### Step 4: Define Fallback Data

```js
function fallback_module() {
  return {
    api: fallback_instance,
    drive: {
      'style/': {
        'profile.css': {
          raw: `
            .profile-container {
              display: flex;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .avatar {
              width: 60px;
              height: 60px;
              background: #ddd;
              border-radius: 50%;
              margin-right: 16px;
            }
            .info h2 {
              margin: 0 0 8px 0;
              color: #333;
            }
            .edit-btn {
              background: #007acc;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
            }
          `
        }
      },
      'data/': {
        'user.json': {
          raw: {
            name: 'Default User',
            email: 'user@example.com'
          }
        }
      }
    }
  }
  
  function fallback_instance() {
    return {
      _: {},
      drive: {
        'data/': {
          'user.json': {
            raw: {
              name: 'John Doe',
              email: 'john@example.com'
            }
          }
        }
      }
    }
  }
}
```

## Working with Submodules

Submodules let you compose complex interfaces from smaller components:

### Parent Module Setup

```js
const header_component = require('./header')
const sidebar_component = require('./sidebar')  
const content_component = require('./content')

async function main_app(opts) {
  const { id, sdb } = await get(opts.sid)
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="app-layout">
      <header class="app-header"></header>
      <aside class="app-sidebar"></aside>  
      <main class="app-content"></main>
    </div>
  `
  
  const subs = await sdb.watch(onbatch)
  
  // Mount submodules
  header_component(subs[0]).then(header_el => {
    shadow.querySelector('.app-header').appendChild(header_el)
  })
  
  sidebar_component(subs[1]).then(sidebar_el => {
    shadow.querySelector('.app-sidebar').appendChild(sidebar_el)
  })
  
  content_component(subs[2]).then(content_el => {
    shadow.querySelector('.app-content').appendChild(content_el)
  })
  
  return el
  
  function onbatch(batch) {
    // Handle state changes
  }
}
```

### Fallback Configuration

```js
function fallback_module() {
  return {
    api: fallback_instance,
    _: {
      './header': {
        $: '',  // Required module marker
        mapping: { style: 'style' }
      },
      './sidebar': {
        $: '', 
        mapping: { style: 'style' }
      },
      './content': {
        $: '',
        mapping: { 
          style: 'style',
          data: 'data' 
        }
      }
    }
  }
  
  function fallback_instance() {
    return {
      _: {
        './header': {
          0: '',  // First instance
          mapping: { style: 'style' }
        },
        './sidebar': {
          0: custom_sidebar_override,
          mapping: { style: 'style' }
        },
        './content': {
          0: '',
          mapping: { 
            style: 'style',
            data: 'data'
          }
        }
      }
    }
  }
}
```

### Instance Overrides

You can customize submodule behavior with override functions:

```js
function custom_sidebar_override() {
  return {
    drive: {
      'style/': {
        'sidebar.css': {
          raw: `
            .sidebar {
              background: #f5f5f5;
              width: 300px;
              padding: 20px;
            }
          `
        }
      },
      'data/': {
        'menu.json': {
          raw: {
            items: [
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Settings', href: '/settings' }
            ]
          }
        }
      }
    }
  }
}
```

## State Management Patterns

### Reactive Data Flow

DataShell follows a unidirectional data flow pattern:

```
User Action → State Update → onbatch() → UI Update
```

### Pattern 1: Simple State Updates

```js
function update_counter() {
  const current = sdb.drive.get('data/counter.json')?.raw || { count: 0 }
  const updated = { count: current.count + 1 }
  sdb.drive.put('data/counter.json', updated)
  // onbatch() will be called automatically
}
```

### Pattern 2: Batch Updates

```js
function save_user_profile(name, email, bio) {
  // Multiple related updates
  sdb.drive.put('data/profile.json', { name, email, bio })
  sdb.drive.put('data/last_updated.json', { timestamp: Date.now() })
  // Both updates will be batched in a single onbatch() call
}
```

### Pattern 3: Conditional Updates

```js
function onbatch(batch) {
  let needs_ui_update = false
  
  for (const { type, paths } of batch) {
    switch (type) {
      case 'data':
        needs_ui_update = true
        break
      case 'style':
        inject_styles()
        break
      case 'config':
        reconfigure_component()
        break
    }
  }
  
  if (needs_ui_update) {
    update_ui()
  }
}
```

### Working with External References

Use `$ref` to include external files:

```js
drive: {
  'style/': {
    'main.css': {
      '$ref': 'styles.css'  // File in same directory as module
    }
  },
  'icons/': {
    'sprites.svg': {
      '$ref': '../assets/icons.svg'  // Relative path
    }
  }
}
```

## Communication Between Modules

For complex interactions, modules need to communicate. DataShell uses a protocol-based message system:

### Setting Up Parent-Child Communication

**Parent Module:**
```js
const child_module = require('./child')

async function parent_component(opts) {
  const { id, sdb } = await get(opts.sid)
  
  let _ = { child: null }  // Store child communication functions
  
  const subs = await sdb.watch(onbatch)
  
  // Pass protocol to child
  child_module(subs[0], child_protocol).then(child_el => {
    shadow.appendChild(child_el)
  })
  
  return el
  
  function child_protocol(send) {
    _.child = send  // Store child's send function
    return on_child_message
    
    function on_child_message({ type, data }) {
      switch (type) {
        case 'button_clicked':
          handle_child_button_click(data)
          break
        case 'data_updated':
          propagate_data_change(data)
          break
        default:
          console.warn('Unknown message from child:', type)
      }
    }
  }
  
  function send_to_child(type, data) {
    if (_.child) {
      _.child({ type, data })
    }
  }
}
```

**Child Module:**
```js
async function child_component(opts, protocol) {
  const { id, sdb } = await get(opts.sid)
  
  let send_to_parent = null
  
  if (protocol) {
    send_to_parent = protocol(handle_parent_message)
  }
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="child-component">
      <button class="action-btn">Click Me</button>
      <div class="status"></div>
    </div>
  `
  
  const btn = shadow.querySelector('.action-btn')
  btn.onclick = () => {
    // Send message to parent
    send_to_parent && send_to_parent({
      type: 'button_clicked',
      data: { timestamp: Date.now() }
    })
  }
  
  return el
  
  function handle_parent_message({ type, data }) {
    switch (type) {
      case 'update_status':
        shadow.querySelector('.status').textContent = data.message
        break
      case 'disable':
        shadow.querySelector('.action-btn').disabled = true
        break
    }
  }
}
```

### Multi-Level Communication

For complex hierarchies, messages can be routed through multiple levels:

```js
function middle_component(opts, protocol) {
  // ... setup code ...
  
  let _ = { up: null, child: null }
  
  if (protocol) {
    _.up = protocol(handle_parent_message)
  }
  
  function child_protocol(send) {
    _.child = send
    return on_child_message
    
    function on_child_message({ type, data }) {
      // Route some messages to parent, handle others locally
      if (['critical_error', 'user_logout'].includes(type)) {
        _.up && _.up({ type, data })  // Pass to parent
      } else {
        handle_local_message({ type, data })
      }
    }
  }
  
  function handle_parent_message({ type, data }) {
    // Handle parent messages or route to child
    if (type === 'broadcast_to_all') {
      _.child && _.child({ type, data })
    }
  }
}
```

## Data Persistence & Sync

DataShell automatically handles data persistence and P2P synchronization:

### Local Persistence

All drive data is automatically persisted to browser storage:

```js
// This data persists across browser sessions
sdb.drive.put('data/user_preferences.json', {
  theme: 'dark',
  notifications: true,
  language: 'en'
})

// Data is available immediately on next load
const prefs = sdb.drive.get('data/user_preferences.json')?.raw
```

### P2P Synchronization

When connected to the P2P network, data automatically syncs:

```js
// On Device A:
sdb.drive.put('data/shared_document.json', {
  content: 'Hello from Device A',
  modified: Date.now()
})

// Device B automatically receives the update via onbatch()
function onbatch(batch) {
  for (const { type, paths } of batch) {
    if (type === 'data' && paths.includes('data/shared_document.json')) {
      console.log('Document updated from another device!')
    }
  }
}
```

### Conflict Resolution

DataShell uses last-writer-wins for simple conflict resolution:

```js
// Handle potential conflicts
function onbatch(batch) {
  for (const { type, paths } of batch) {
    if (type === 'data') {
      paths.forEach(path => {
        const file = sdb.drive.get(path)
        if (file?.raw.conflicted) {
          resolve_conflict(path, file.raw)
        }
      })
    }
  }
}

function resolve_conflict(path, data) {
  // Custom conflict resolution logic
  const resolved = merge_data(data.local, data.remote)
  sdb.drive.put(path, resolved)
}
```

## Advanced Patterns

### Dynamic Module Loading

Load modules conditionally based on state or user actions:

```js
async function dynamic_loader(opts) {
  const { id, sdb } = await get(opts.sid)
  
  let current_module = null
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="module-container">
      <nav class="module-nav">
        <button data-module="dashboard">Dashboard</button>
        <button data-module="settings">Settings</button>
        <button data-module="profile">Profile</button>
      </nav>
      <div class="module-content"></div>
    </div>
  `
  
  const nav = shadow.querySelector('.module-nav')
  const content = shadow.querySelector('.module-content')
  
  nav.onclick = async (e) => {
    const module_name = e.target.dataset.module
    if (module_name) {
      await load_module(module_name)
    }
  }
  
  async function load_module(name) {
    // Clear current module
    content.innerHTML = ''
    
    try {
      // Dynamic import
      const module = require(`./${name}`)
      const module_el = await module({ sid: generate_sid() })
      content.appendChild(module_el)
      current_module = name
    } catch (error) {
      console.error(`Failed to load module ${name}:`, error)
      content.innerHTML = `<div class="error">Failed to load ${name}</div>`
    }
  }
  
  return el
}
```

### State Validation

Validate data before storing:

```js
function validate_and_store(path, data) {
  if (!validate_data(data)) {
    console.warn('Invalid data, not storing:', data)
    return false
  }
  
  sdb.drive.put(path, data)
  return true
}

function validate_data(data) {
  // Custom validation logic
  if (typeof data !== 'object') return false
  if (!data.id || !data.timestamp) return false
  if (data.email && !is_valid_email(data.email)) return false
  return true
}
```

### Performance Monitoring

Track component performance:

```js
async function performance_aware_component(opts) {
  const start_time = performance.now()
  
  const { id, sdb } = await get(opts.sid)
  
  // Track state update performance
  function onbatch(batch) {
    const batch_start = performance.now()
    
    for (const { type, paths } of batch) {
      on[type] && on[type](data)
    }
    
    const batch_time = performance.now() - batch_start
    if (batch_time > 16) {  // Longer than 1 frame
      console.warn(`Slow batch processing: ${batch_time}ms`)
    }
  }
  
  // Track initialization time
  const init_time = performance.now() - start_time
  console.log(`Component initialized in ${init_time}ms`)
  
  return el
}
```

## Performance Optimization

### Efficient State Updates

**Bad - Frequent Small Updates:**
```js
// Creates many onbatch() calls
for (let i = 0; i < items.length; i++) {
  sdb.drive.put(`data/item_${i}.json`, items[i])
}
```

**Good - Batch Updates:**
```js
// Single onbatch() call
const batch_data = { items }
sdb.drive.put('data/all_items.json', batch_data)
```

### Selective UI Updates

Only update what changed:

```js
function onbatch(batch) {
  let update_flags = {
    user_info: false,
    theme: false,
    notifications: false
  }
  
  for (const { type, paths } of batch) {
    paths.forEach(path => {
      if (path.includes('user')) update_flags.user_info = true
      if (path.includes('theme')) update_flags.theme = true  
      if (path.includes('notification')) update_flags.notifications = true
    })
  }
  
  // Only update changed sections
  if (update_flags.user_info) update_user_display()
  if (update_flags.theme) apply_theme_changes()
  if (update_flags.notifications) refresh_notifications()
}
```

### Memory Management

Clean up resources when components unmount:

```js
function create_component(opts) {
  let cleanup_functions = []
  let is_mounted = true
  
  // ... component setup ...
  
  // Add cleanup function
  const timer = setInterval(update_data, 1000)
  cleanup_functions.push(() => clearInterval(timer))
  
  // Cleanup on unmount
  const cleanup = () => {
    is_mounted = false
    cleanup_functions.forEach(fn => fn())
  }
  
  // Return element with cleanup method
  const el = document.createElement('div')
  el._cleanup = cleanup
  return el
}
```

## Common Patterns

### Form Handling

```js
async function form_component(opts) {
  const { id, sdb } = await get(opts.sid)
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <form class="user-form">
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <button type="submit">Save</button>
    </form>
  `
  
  const form = shadow.querySelector('.user-form')
  
  form.onsubmit = (e) => {
    e.preventDefault()
    
    const formData = new FormData(form)
    const data = Object.fromEntries(formData)
    
    // Validate and save
    if (validate_form_data(data)) {
      sdb.drive.put('data/user.json', data)
      show_success_message()
    }
  }
  
  // Load existing data
  const subs = await sdb.watch(onbatch)
  
  function onbatch(batch) {
    for (const { type, paths } of batch) {
      if (type === 'data' && paths.includes('data/user.json')) {
        load_form_data()
      }
    }
  }
  
  function load_form_data() {
    const userData = sdb.drive.get('data/user.json')?.raw
    if (userData) {
      form.name.value = userData.name || ''
      form.email.value = userData.email || ''
    }
  }
  
  return el
}
```

### List Management

```js
async function list_component(opts) {
  const { id, sdb } = await get(opts.sid)
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="list-container">
      <div class="list-header">
        <input class="new-item" placeholder="Add new item..." />
        <button class="add-btn">Add</button>
      </div>
      <ul class="item-list"></ul>
    </div>
  `
  
  const input = shadow.querySelector('.new-item')
  const add_btn = shadow.querySelector('.add-btn')
  const list = shadow.querySelector('.item-list')
  
  add_btn.onclick = () => add_item()
  input.onkeypress = (e) => {
    if (e.key === 'Enter') add_item()
  }
  
  function add_item() {
    const text = input.value.trim()
    if (!text) return
    
    const current_items = sdb.drive.get('data/items.json')?.raw || []
    const new_item = {
      id: crypto.randomUUID(),
      text,
      created: Date.now()
    }
    
    sdb.drive.put('data/items.json', [...current_items, new_item])
    input.value = ''
  }
  
  function remove_item(item_id) {
    const current_items = sdb.drive.get('data/items.json')?.raw || []
    const filtered_items = current_items.filter(item => item.id !== item_id)
    sdb.drive.put('data/items.json', filtered_items)
  }
  
  function render_items(items) {
    list.innerHTML = items.map(item => `
      <li class="list-item" data-id="${item.id}">
        <span class="item-text">${item.text}</span>
        <button class="remove-btn" onclick="remove_item('${item.id}')">×</button>
      </li>
    `).join('')
  }
  
  const subs = await sdb.watch(onbatch)
  
  function onbatch(batch) {
    for (const { type, paths } of batch) {
      if (type === 'data' && paths.includes('data/items.json')) {
        const items = sdb.drive.get('data/items.json')?.raw || []
        render_items(items)
      }
    }
  }
  
  return el
}
```

### Modal Dialog Pattern

```js
async function modal_component(opts) {
  const { id, sdb } = await get(opts.sid)
  
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Modal Title</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <!-- Dynamic content -->
        </div>
        <div class="modal-footer">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn">Confirm</button>
        </div>
      </div>
    </div>
  `
  
  const overlay = shadow.querySelector('.modal-overlay')
  const close_btn = shadow.querySelector('.close-btn')
  const cancel_btn = shadow.querySelector('.cancel-btn')
  const confirm_btn = shadow.querySelector('.confirm-btn')
  
  // Close modal handlers
  close_btn.onclick = () => hide_modal()
  cancel_btn.onclick = () => hide_modal()
  overlay.onclick = (e) => {
    if (e.target === overlay) hide_modal()
  }
  
  function show_modal(title, content, on_confirm) {
    shadow.querySelector('.modal-title').textContent = title
    shadow.querySelector('.modal-body').innerHTML = content
    overlay.style.display = 'flex'
    
    confirm_btn.onclick = () => {
      on_confirm && on_confirm()
      hide_modal()
    }
  }
  
  function hide_modal() {
    overlay.style.display = 'none'
  }
  
  // Expose public API
  el.show_modal = show_modal
  el.hide_modal = hide_modal
  
  return el
}
```

## Next Steps

Now that you understand DataShell's core concepts and patterns:

1. **Practice**: Build the examples in this guide
2. **Explore**: Check out the [API reference](../api.md) for complete details
3. **Understand**: Read [concepts](../concepts.md) for deeper philosophical insights
4. **Contribute**: Follow our [conventions](../conventions.md) to contribute back

### Additional Resources

- [Example Applications](./examples/) - Complete working examples
- [Common Recipes](./recipes.md) - Snippets for common use cases  
- [Troubleshooting](./troubleshooting.md) - Solutions to common issues
- [Migration Guide](./migration.md) - Upgrading from earlier versions

---

*Happy building! You're now equipped to create powerful P2P applications where users own their data.*
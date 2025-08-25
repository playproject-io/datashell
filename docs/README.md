# DataShell Framework

**A Peer-to-Peer Prototyping Environment for Web Apps with User-Owned Data Vaults**

<div align="center">

![DataShell Logo](../logo/datashell-logo.png)

*Building the decentralized web, one vault at a time*

[📖 Documentation](#documentation) • [🚀 Quick Start](#quick-start) • [💡 Examples](#examples) • [🤝 Contributing](#contributing)

</div>

## Overview

DataShell empowers developers to build peer-to-peer web applications where users maintain complete control over their data. By combining a sophisticated state management system with P2P networking, DataShell creates an open standard for user-owned, GDPR-compliant data vaults.

**Key Features:**
- 🔐 **User-Owned Data**: Complete data sovereignty with encrypted P2P storage
- ⚡ **Reactive State Management**: Powerful STATE module for real-time data synchronization  
- 🌐 **In-Browser Prototyping**: No backend required - prototype directly in the browser
- 🔧 **Modular Architecture**: Composable components with shadow DOM isolation
- 🚀 **Zero Configuration**: Get started with minimal setup

## Quick Start

### Installation

```bash
npm install -g datashell
```

### Create Your First App

1. **Initialize your project structure:**
   ```bash
   mkdir my-datashell-app
   cd my-datashell-app
   ```

2. **Create `index.html`:**
   ```html
   <!DOCTYPE html>
   <html>
     <head><meta charset="utf-8"><link rel="icon" href="data:,"></head>
     <body><script src="boot.js"></script></body>
   </html>
   ```

3. **Create `boot.js`:**
   ```js
   const env = { version: 'latest' }
   const arg = { x: 321, y: 543 }
   const url = 'https://playproject.io/datashell/shim.js'
   const src = `${url}?${new URLSearchParams(env)}#${new URLSearchParams(arg)}`
   this.open ? document.body.append(Object.assign(document.createElement('script'), { src })) : importScripts(src)
   ```

4. **Create your app (`my-app.js`):**
   ```js
   const STATE = require('STATE')
   const statedb = STATE(__filename)
   const { sdb, get } = statedb(fallback_module)

   module.exports = my_app

   async function my_app(opts) {
     const { id, sdb } = await get(opts.sid)
     
     const el = document.createElement('div')
     const shadow = el.attachShadow({ mode: 'closed' })
     shadow.innerHTML = `
       <div style="padding: 20px; font-family: sans-serif;">
         <h1>Hello DataShell!</h1>
         <button class="hello-btn">Click me</button>
         <div class="output"></div>
       </div>
     `
     
     const subs = await sdb.watch(onbatch)
     const btn = shadow.querySelector('.hello-btn')
     const output = shadow.querySelector('.output')
     
     btn.onclick = () => {
       output.textContent = 'Hello from your DataShell app!'
     }
     
     return el
     
     function onbatch(batch) {
       // Handle state changes here
     }
   }

   function fallback_module() {
     return {
       api: fallback_instance,
       drive: {
         'style/': {
           'theme.css': {
             raw: `
               .hello-btn {
                 background: #007acc;
                 color: white;
                 border: none;
                 padding: 10px 20px;
                 border-radius: 5px;
                 cursor: pointer;
               }
             `
           }
         }
       }
     }
     
     function fallback_instance() {
       return {
         _: {},
         drive: {}
       }
     }
   }
   ```

5. **Bundle and run:**
   ```bash
   npx browserify -i STATE my-app.js -o bundle.js
   ```

6. **Open `index.html` in your browser** and see your DataShell app in action!

## Core Concepts

### STATE Module
The heart of DataShell's reactivity system. Every component uses STATE to manage persistent data:

```js
const { id, sdb } = await get(opts.sid)  // Get state database
const subs = await sdb.watch(onbatch)    // Watch for changes
sdb.drive.put('data/user.json', userData) // Store data
```

### Fallback System
Define default data and component structure:

```js
function fallback_module() {
  return {
    api: fallback_instance,    // User customization API
    _: {                       // Submodule definitions
      'sub_module': { $: '' }
    },
    drive: {                   // Data storage
      'style/': { 'theme.css': { raw: '...' } }
    }
  }
}
```

### Shadow DOM Components
Every component is isolated with shadow DOM:

```js
const el = document.createElement('div')
const shadow = el.attachShadow({ mode: 'closed' })
shadow.innerHTML = `<div class="my-component">Content</div>`
```

## Examples

### Simple Counter
```js
async function counter_app(opts) {
  const { id, sdb } = await get(opts.sid)
  
  let count = 0
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div>
      <h2>Count: <span class="count">0</span></h2>
      <button class="inc">+</button>
      <button class="dec">-</button>
    </div>
  `
  
  const countEl = shadow.querySelector('.count')
  const incBtn = shadow.querySelector('.inc')
  const decBtn = shadow.querySelector('.dec')
  
  incBtn.onclick = () => update_count(count + 1)
  decBtn.onclick = () => update_count(count - 1)
  
  function update_count(new_count) {
    count = new_count
    countEl.textContent = count
    sdb.drive.put('data/count.json', { count })
  }
  
  return el
}
```

### With Submodules
```js
const sub_component = require('./sub')

async function submodule_app(opts) {
  // ... setup code ...
  
  const subs = await sdb.watch(onbatch)
  
  // Add sub component
  sub_component(subs[0]).then(sub_el => {
    shadow.querySelector('.sub-container').appendsub(sub_el)
  })
  
  return el
}
```

## Development Workflow

### 1. Design Your Component
- Define what data it manages
- Plan submodule relationships
- Sketch the UI structure

### 2. Set Up State Schema
- Create fallback data structure
- Define drive datasets
- Plan state update patterns

### 3. Implement Component Logic
- Create shadow DOM structure  
- Set up state watchers
- Handle user interactions

### 4. Test and Iterate
- Use browser dev tools
- Test state persistence
- Verify P2P data sync

## Documentation

| Document | Purpose |
|----------|---------|
| [📋 Conventions](./conventions.md) | Coding standards and architectural principles |
| [📚 Complete Guide](./guide.md) | In-depth tutorials and patterns |
| [⚡ API Reference](./api.md) | Complete API documentation |
| [💭 Concepts](./concepts.md) | Philosophy and deeper explanations |

## Available Versions

Check [drive.json](http://playproject.io/datashell/drive.json) for available version numbers and labels.

## CLI Commands

```bash
ds                    # Show help
ds create my-app      # Create new app (coming soon)  
ds build              # Build current project (coming soon)
ds serve              # Local development server (coming soon)
```

## Community & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/playproject-io/datashell/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/playproject-io/datashell/discussions)
- 📄 **Paper**: [Read the Research](https://github.com/playproject-io/datashell/blob/main/paper/paper.pdf)
- 🎮 **Demo**: [Try it Live](https://playproject-io.github.io/datashell)

## Contributing

We welcome contributions! Here's how to get started:

1. **Read our [conventions](./conventions.md)** to understand our coding standards
2. **Check the [guide](./guide.md)** for detailed development patterns  
3. **Browse existing modules** for examples
4. **Submit issues** for bugs or feature requests
5. **Create pull requests** for improvements

## License

DataShell is open source and available under the MIT License.

---

**Ready to build the decentralized web?** Start with the [complete guide](./guide.md) or dive into the [API reference](./api.md).
# DataShell Framework Conventions

This document outlines the coding standards, architectural principles, and development practices that guide DataShell framework development. Following these conventions ensures consistency, maintainability, and ease of collaboration across the framework ecosystem.

## Code Style & Standards

### JavaScript Standards
- **Standard JS**: All code must follow [StandardJS](https://standardjs.com/) formatting rules
- **Naming Convention**: Use `snake_case` for variables, functions, and file names
- **Variable Names**: Keep names concise but descriptive
  ```js
  // Good
  const user_data = {}
  const btn_click = () => {}
  
  // Avoid
  const userData = {}
  const buttonClickHandler = () => {}
  ```

### Module System
- **CommonJS**: Use `require()` for importing modules
- **No Classes**: Avoid JavaScript classes and the `this` keyword
- **Function-based**: Use functional programming patterns
  ```js
  // Good
  function create_component(opts) {
    // implementation
  }
  
  // Avoid  
  class Component {
    constructor(opts) {
      this.opts = opts
    }
  }
  ```

## Architecture Principles

### Module Structure
Every DataShell module follows a strict architectural pattern:

#### Required Module Header
```js
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(fallback_module)
```

#### Module Export Pattern
```js
module.exports = module_function

async function module_function(opts) {
  const { id, sdb } = await get(opts.sid)
  // Module implementation
  return el
}
```

### State Management
- **STATE Module**: All persistent data must use the STATE module
- **Immutable Updates**: State changes must be immutable
- **Watch Pattern**: Use `sdb.watch(onbatch)` for state reactivity
- **Drive Organization**: Structure data in logical datasets

### DOM Handling

#### Shadow DOM Requirements
- **Always Use Shadow DOM**: Every component must use shadow DOM with closed mode
- **No Direct DOM Manipulation**: Handle all element creation through JavaScript
- **Template Literals**: Maximize use of template literals for HTML generation
  ```js
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `
    <div class="container">
      <button class="action-btn">Click Me</button>
    </div>
  `
  ```

#### Event Handling
- **No addEventListener**: Use direct event assignment
  ```js
  // Good
  btn.onclick = handle_click
  
  // Avoid
  btn.addEventListener('click', handle_click)
  ```

### Modular Design

#### Function Organization
- **Functions Below Return**: Define all functions after the main return statement
- **Single Responsibility**: Each function should have one clear purpose
- **Internal Functions**: Helper functions should be defined within the main module function scope

#### Code Structure Template
```js
async function module_function(opts) {
  const { id, sdb } = await get(opts.sid)
  
  // Setup and initialization
  const on = { style: inject }
  
  // DOM creation
  const el = document.createElement('div')
  const shadow = el.attachShadow({ mode: 'closed' })
  
  // State watching
  const subs = await sdb.watch(onbatch)
  
  // Submodule integration
  // Event handlers
  
  return el
  
  // Function definitions below
  function onbatch(batch) { /* ... */ }
  function inject(data) { /* ... */ }
}
```

## State Management Patterns

### Fallback Structure
Every module must define fallback data following this hierarchy:

```js
function fallback_module() {
  return {
    api: fallback_instance,
    _: {
      submodule_name: {
        $: '',
        0: '', // instances
        mapping: { style: 'style' }
      }
    },
    drive: {
      'dataset_type/': {
        'filename.ext': {
          raw: `content` // or $ref: 'file.ext'
        }
      }
    }
  }
}
```

### Drive Organization
- **Dataset Types**: Group related files by purpose (style/, icons/, data/)
- **File Structure**: Use clear, descriptive filenames with proper extensions
- **Content Methods**: Use `raw:` for inline content, `$ref:` for external files

## Communication Patterns
@TODO

## Build & Packaging

### Bundle Requirements
- **Browserify**: Use browserify for module bundling
- **STATE Exclusion**: Always exclude STATE from bundles: `npx browserify -i STATE your-app.js -o bundle.js`
- **Boot Script**: Include versioned shim.js for runtime loading

### File Structure
`bundle.js` and `boot.js` files needs to be in the same folder. Everything else is customizable.
```
project/
├── index.html          # Minimal HTML loader
├── boot.js            # Shim loader with version
├── bundle.js          # Browserified app code
└── your-app.js        # Main application entry
```

## Performance Guidelines

### Optimization Strategies
- **Minimal State Updates**: Batch related state changes
- **Efficient Selectors**: Use specific CSS selectors in shadow DOM
- **Memory Management**: Clean up event listeners and watchers when components unmount
- **Lazy Loading**: Load submodules only when needed

### Watch Function Efficiency
```js
function onbatch(batch) {
  // Process batches efficiently
  for (const { type, data } of batch) {
    on[type] && on[type](data)
  }
  // Batch DOM updates at the end
  update_ui()
}
```

*These conventions ensure DataShell framework remains consistent, maintainable, and accessible to all contributors. When in doubt, prioritize clarity and simplicity over clever solutions.*
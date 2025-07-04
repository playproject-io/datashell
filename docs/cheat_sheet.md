# Cheat Sheet for UI Components Development

## Repository Structure

### General Structure
- **`src/<modulename>.js`**: Main component to be implemented and published.
- **`src/node_modules/<dependencies>`**: Internal dependencies developed within the same repository.
- **`web/page.js`**: Short presentation page converted into `bundle.js` and loaded by `index.html`.
- **`index.html`**: Entry point for the browser.
- **`package.json`**: Defines the project metadata and dependencies.

### Boilerplate Files

#### `index.html`
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="icon" href="data:,">
  </head>
  <body>
    <script src="bundle.js#1"></script>
  </body>
</html>
```

#### `package.json`
```json
{
  "name": "example",
  "version": "0.0.1",
  "description": "example for using STATE",
  "type": "commonjs",
  "main": "src/example.js",
  "scripts": {
    "start": "budo web/boot.js:bundle.js --dir . --open --live",
    "build": "browserify web/boot.js -o bundle.js"
  },
  "devDependencies": {
    "browserify": "^17.0.1",
    "budo": "^11.8.4"
  }
}
```

#### `web/boot.js`
```javascript
const hash = '895579bb57e5c57fc66e031377cba6c73a313703'
const prefix = 'https://raw.githubusercontent.com/alyhxn/playproject/' + hash + '/'
const init_url = 'https://raw.githubusercontent.com/alyhxn/playproject/' + hash + '/doc/state/example/init.js'
const args = arguments

fetch(init_url, { cache: 'no-store' }).then(res => res.text()).then(async source => {
  const module = { exports: {} }
  const f = new Function('module', 'require', source)
  f(module, require)
  const init = module.exports
  await init(args, prefix)
  require('./page')
})
```

#### `web/page.js`
```javascript
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb } = statedb(defaults)

const example = require('..')

const subs = sdb.watch(onbatch)
const [{ sid }] = subs
const element = example({ sid })
document.body.append(element)

function onbatch (batch) {
  // Handle updates
}

function defaults () {
  return {
    _: {
      '..': {
        $: '',
        0: override
      }
    }
  }

  function override ([example]) {
    const data = example()
    // Customize `data` if needed
    return data
  }
}
```

#### `src/example.js`
```javascript
const STATE = require('STATE')
const statedb = STATE(__filename)
const { sdb, get } = statedb(defaults)

module.exports = example

function example (opts) {
  const { sdb } = get(opts.sid)

  const drive = sdb.drive({ type: 'text' })
  const text = drive.get('title.json')
  const el = document.createElement('div')
  el.innerHTML = `<h1> ${text} </h1>`

  return el
}

function defaults () {
  return {
    drive: {},
    api,
    _: {}
  }

  function api () {
    const drive = {
      'text/': {
        'title.json': { raw: 'hello world' }
      }
    }
    return { drive, _: {} }
  }
}
```

## Development Workflow
1. **Initialization**:
   - Run `npm init -y` in the directory.

2. **Set up the repository**:
   - Create the boilerplate files (`index.html`, `package.json`, `web/boot.js`, `web/page.js`, `src/example.js`).

3. **Run the development server**:
   ```bash
   npm start
   ```

4. **Build the bundle**:
   ```bash
   npm run build
   ```

5. **Preview the component**:
   - Open address returned by `npm start` in a browser to see the component in action.

## Advanced Features

- Use the `STATE` module for state management and persistent storage.
- Define `drive` objects to store data in `localStorage`.
- Use `onbatch` to handle updates dynamically.
- Customize components using the `defaults` and `api` functions.

## Example Component: `action_bar.js`
## `@TODO`

# Module creation Explanation:
## `@TODO`
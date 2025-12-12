const STATE = require('STATE')
const localdb = require('localdb')
const statedb = STATE(__filename)
const admin_api = statedb.admin(localdb)
admin_api.on(event => {
  // console.log('%c' + 'Event', 'color: #ff4500; font-weight: bold', event)
})
const { sdb, io } = statedb(defaults)
document.title = 'demo1'
/******************************************************************************
  PAGE
******************************************************************************/
const app = require('app')
const sheet = new CSSStyleSheet()
config().then(() => boot())

async function config() {
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)
  const html = document.documentElement
  const meta = document.createElement('meta')
  const font = 'https://fonts.googleapis.com/css?family=Nunito:300,400,700,900|Slackey&display=swap'
  const loadFont = `<link href=${font} rel='stylesheet' type='text/css'>`
  html.setAttribute('lang', 'en')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  // @TODO: use font api and cache to avoid re-downloading the font data every time
  document.head.append(meta)
  document.head.innerHTML += loadFont
  document.adoptedStyleSheets = [sheet]
  await document.fonts.ready // @TODO: investigate why there is a FOUC
}
/******************************************************************************
  PAGE BOOT
******************************************************************************/
async function boot () {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const on = {
    theme: inject,
    ...sdb.admin
  }
  const { drive } = sdb

  const subs = await sdb.watch(onbatch, on)

  io.on(port => {
    port.onmessage = event => {
      console.log(event.data)
      const data = event.data
      on[data.type] && on[data.type](data.args)
    }
  })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.body
  const shopts = { mode: 'closed' }
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  ;{ // desktop
    debugger
    shadow.append(await app(subs[0]))
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  async function onbatch(batch) {
    for (const {type, paths} of batch) {
      const data = await Promise.all(paths.map(path => drive.get(path).then(file => file.raw)))
      on[type] && on[type](data)
    }
  }
}
async function inject(data) {
  sheet.replaceSync(data.join('\n'))
}

/******************************************************************************
  DEFAULTS
******************************************************************************/
function defaults (args, { listify, tree }) {
  console.log('PAGE:DEFAULTS', listify(tree))
  const rainbow_theme = {
    type: 'theme',
    name: 'rainbow',
    dataset: {
      page: {
        'style.css': {
          raw: 'body { font-family: cursive; }'
        }
      },
      'page>app>head>foo>nav:0': {
        'style.css': {
          raw: `
                  nav{
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                    background: #4b2d6d;
                    color: white;
                    box-shadow: 0px 1px 6px 1px gray;
                    margin: 5px;
                  }
                  .title{
                    background: linear-gradient(currentColor 0 0) 0 100% / var(--underline-width, 0) .1em no-repeat;
                    transition: color .5s ease, background-size .5s;
                    cursor: pointer;
                  }
                  .box{
                    display: flex;
                    gap: 20px;
                  }
                  .title:hover{
                    --underline-width: 100%
                  }
                `
        }
      }

    }
  }
  return {
    _: {
      app: { $: { x: 0, y: 1 }, 0: app0, mapping: { theme: 'theme', lang: 'lang', io: 'io' } }
    },
    drive: {
      'theme/style.css': { raw: "body { font-family: 'system-ui'; }" },
      'theme/': { 'style.css': { raw: "body { font-family: 'system-ui'; }" }},
      'lang/': {},
      'io/': {}
    }
  }
  function app0 (args, tools, [app]) {
    const data = app()
    const foonav_ = data._.head.$._['foo>nav'].$._
    foonav_.menu[0] = menu0
    foonav_.btn[0] = btn0
    foonav_.btn[1] = btn1

    function menu0 (args, tools, [menu, nav$menu]) {
      const data = menu()
      // console.log(nav$menu([menu]))
      data.drive['lang/']['en-us.json'].raw = {
        links: ['custom', 'menu'],
        title: 'Custom'
      }
      return data
    }
    function btn0 (args, tools, [btn, btn1]) {
      const data = btn()
      // console.log(nav$menu([menu]))
      data.drive['lang/']['en-us.json'].raw = {
        title: 'Register'
      }
      data.net.page = { click: { type: 'register', args: rainbow_theme } }
      return data
    }
    function btn1 (args, tools, [btn, btn1]) {
      const data = btn()
      // console.log(nav$menu([menu]))
      data.drive['lang/']['en-us.json'].raw = {
        title: 'Switch'
      }
      data.net.page = {
        click: {
          type: 'swtch',
          args: [
            { type: 'theme', name: 'default' },
            { type: 'theme', name: 'rainbow' }
          ]
        }
      }
      return data
    }
    return data
  }
}

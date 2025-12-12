const STATE = require('STATE')
const statedb = STATE(__filename)
// @INFO: CHANGE
const { on } = statedb.admin()
/*
// on((...args) => console.log('admin.on', args))
// on(event => console.log('%c' + 'Event', 'color: #ff4500; font-weight: bold', event)
const { sdb } = statedb(defaults)
const { admin } = sdb
// console.log('ADMIN', { admin }, admin.register)
*/

const { sdb, io } = statedb(defaults)
document.title = 'demo2'
/******************************************************************************
  PAGE
******************************************************************************/
const app = require('app')
const sheet = new CSSStyleSheet()
config().then(boot)

async function config () {
  const path = path => new URL(`../src/node_modules/${path}`, `file://${__dirname}`).href.slice(8)
  const html = document.documentElement
  const meta = document.createElement('meta')
  // const appleTouch = '<link rel="apple-touch-icon" sizes="180x180" href="./src/node_modules/assets/images/favicon/apple-touch-icon.png">'
  // const icon32 = '<link rel="icon" type="image/png" sizes="32x32" href="./src/node_modules/assets/images/favicon/favicon-32x32.png">'
  // const icon16 = '<link rel="icon" type="image/png" sizes="16x16" href="./src/node_modules/assets/images/favicon/favicon-16x16.png">'
  // const webmanifest = '<link rel="manifest" href="./src/node_modules/assets/images/favicon/site.webmanifest"></link>'
  const font = 'https://fonts.googleapis.com/css?family=Nunito:300,400,700,900|Slackey&display=swap'
  const loadFont = `<link href=${font} rel='stylesheet' type='text/css'>`
  html.setAttribute('lang', 'en')
  meta.setAttribute('name', 'viewport')
  meta.setAttribute('content', 'width=device-width,initial-scale=1.0')
  // @TODO: use font api and cache to avoid re-downloading the font data every time
  document.head.append(meta)
  // document.head.innerHTML += appleTouch + icon16 + icon32 + webmanifest + loadFont
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
    ...sdb.admin,  // @INFO: CHANGE
  }
  const { drive } = sdb
  const subs = await sdb.watch(onbatch) // @TODO: sdb.watch(onbatch, on)
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
    shadow.append(await app(subs[0]))
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------

  async function onbatch (batch) {
    for (const {type, paths} of batch) {
      const data = await Promise.all(paths.map(path => drive.get(path).then(file => file.raw)))
      on[type] && on[type](data)
    }
  }
}
async function inject (data) {
  console.log('inject', data)
  sheet.replaceSync(data.join('\n'))
}
/******************************************************************************
  DEFAULTS
******************************************************************************/
function defaults () { // -> set database defaults or load from database
  return {
    _: {
      app: {
        $: '',
        0: '',
        mapping: { theme: 'theme', lang: 'lang' }
      }
    },
    drive: {
      'theme/': {
        'style.css': {
          raw: 'body { font-family: \'system-ui\'; }'
        }
      },
      'lang/': {}
    }
  }
  function override_app ([app]) {
    const data = app()
    console.log(JSON.parse(JSON.stringify(data._.head)))
    data._.head[0] = page$head_override
    return data
  }
  function page$head_override ([head]) {
    const data = head()
    data._['foo.nav'] = {
      0: page$nav_override
    }
    return data
  }
  function page$foo_override ([foo]) {
    const data = foo()
    data._.nav[0] = page$nav_override
    return data
  }
  function page$nav_override ([nav]) {
    const data = nav()
    data._.menu[0] = page$menu_override
    return data
  }
  function page$menu_override ([menu]) {
    const data = menu()
    console.log(data)
    data.drive['lang/']['en-us.json'].raw = {
      links: ['custom', 'menu'],
      title: 'Custom'
    }
    return data
  }
}
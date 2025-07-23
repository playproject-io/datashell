
/******************************************************************************
  LOAD_CONFIG
******************************************************************************/
function deepfreeze (o, cryo = true) {
  const keys = Object.keys(o) // Object.getOwnPropertyNames(obj)
  for (const key of keys) {
    const val = o[key]
    if (typeof val == 'object' && val !== null) deepfreeze(val, cryo)
  }
  if (cryo) {
    const p = o.__proto__
    if (typeof p == 'object' && p !== null) deepfreeze(p, cryo)
  }
  return Object.freeze(o)
}
async function load_config (document, api) {
  const { user_href, page_href, shim_href } = await extract(document, api)
  const delimiter = `this.open ? document.body.append(Object.assign(document.createElement('script'), { src })) : importScripts(src)`
  const source = await (await fetch(page_href)).text()
  const lines = source.split(delimiter)
  if (lines.length < 2) throw new Error(`invalid "${page_href}"
  The following line of code is missing, but expected to load the shim:


${delimiter}


  copy & paste code line above to ensure correctness.
  \`src\` can be defined before that line and any custom system code after it.
  `)
  const system = lines[1].trim()
  if (system) {}
  const user_url = url(user_href)
  const user_env = parse(user_url.search)
  const user_arg = parse(user_url.hash.slice(1))
  const page_url = url(page_href)
  const page_env = parse(page_url.search)
  const page_arg = parse(page_url.hash.slice(1))
  const shim_url = url(shim_href)
  const shim_env = parse(shim_url.search)
  const shim_arg = parse(shim_url.hash.slice(1))
  const config = {
    user: { url: user_url, env: user_env, arg: user_arg },
    page: { url: page_url, env: page_env, arg: page_arg },
    shim: { url: shim_url, env: shim_env, arg: shim_arg },
  }
  return config
  function parse (querystring) {
    const entries = new URLSearchParams(querystring).entries()
    return Object.fromEntries(entries)
  }
  function url (url) {
    const {
      ancestorOrigins, hash, host, hostname, href,
      origin, pathname, port, protocol, search
    } = new URL(url)
    return {
      toString: () => href,
      ancestorOrigins, hash, host, hostname, href,
      origin, pathname, port, protocol, search
    }
  }
  async function extract (document, run) {
    const { currentScript: { src: shim_href }, location } = document
    const user_href = location.href
    const srcdoc = (await (await fetch(user_href, { cache: 'no-store' }))
      .text()).replaceAll('<script', '<script_')
      .replaceAll('script>', '_script>')
    const iframe = Object.assign(document.createElement('iframe'), {
      sandbox: 'allow-same-origin', srcdoc
    })
    const ready = new Promise(ok => iframe.onload = ok)
    run('load', iframe)
    const idoc = (await ready).currentTarget.contentWindow.document
    const [meta, link] = idoc.head.children
    const [charset, ...headattribs] = [...meta.attributes]
    const [rel, href, ...linkattribs] = [...link.attributes]
    const [script] = idoc.body.children
    const [src, ...scriptattribs] = [...script.attributes]
    const invalid = [
      idoc.doctype.name !== 'html',
      idoc.doctype.nodeType !== 10,
      idoc.documentElement.children.length !== 2,
      [...idoc.documentElement.attributes].length !== 0,
      [...idoc.head.attributes].length !== 0,
      idoc.head.children.length !== 2,
      headattribs.length !== 0,
      linkattribs.length !== 0,
      charset.name !== 'charset',
      charset.value !== 'utf-8',
      rel.name !== 'rel',
      rel.value !== 'icon',
      href.name !== 'href',
      href.value !== 'data:,',
      [...idoc.body.attributes].length !== 0,
      idoc.body.children.length !== 1,
      scriptattribs.length !== 0,
      src.name !== 'src',
    ].some(Boolean)
    if (invalid) return run('fail', new Error(`invalid "index.html" shim, make sure it looks like:


<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><link rel="icon" href="data:,"></head>
  <body><script src="index.js?...#..."></script></body>
</html>


    copy & paste html above to ensure correctness.
    \`?...#...\` can be used for configuratoin.
    `))
    const page_href = new URL(src.value, user_href).href
    return { user_href, page_href, shim_href }
  }
}
/*****************************************************************************/
globalThis.top ? globalThis === globalThis.top ? renderer() : iframe() : sewo()
/******************************************************************************
  IFRAME
******************************************************************************/
function iframe () {
  onmessage = e => eval(e.data)
  console.log('[iwin]')
}
/******************************************************************************
  SEWO
******************************************************************************/
function sewo () {
  console.log('[sewo]', '@TODO: support service worker for offline first')
}
/******************************************************************************
  BOOTLOAD
******************************************************************************/
async function renderer () {
  const { body, defaultView: { navigator } } = document

  const title = '⬡js'
  const style = `background-color:black; color:mediumseagreen; font-family:mono;`
  document.title = title
  body.style = style


  const on = { load, fail }
  function load (dom) { body.append(dom) }
  function fail (error) { // @TODO: use proper reporter!
    console.error(error.message)
    body.innerHTML = `<pre>${error.message}</pre>`
    throw error
  }
  function api (type, data) {
    console.log(`{${type}}`)
    const cmd = on[type]
    if (cmd) cmd(data)
    else fail(new Error('unknown command', { cause: m }))
  }


  const config = await load_config(document, api)
  console.log('[renderer]', config)

  // @TODO: a flag to show boot menu and/or enter bios
  // @TODO: a hotkey to enter bios at any time - maybe password protected

  // const sewo = await navigator.serviceWorker.register(config.page.url)

  // system version
  const system_version = config.user.version || config.shim.version // vs. default system
  // system params



  // 1. define system in url
  // 2. define system at end of file
  // 3. use default datashell system



  // 1. enduser: user config (location.href)
  // 2. dev ops: html+boot url config -> default boot app and devops config

  // can only validate kernel config if i have kernel versions and params?
  // can only validate system cobfug uf u gave ststen versions and params?

  const kernel_url = new URL('./', config.shim.url).href
  const system_url = new URL('bundle.js', config.page.url).href

  const [code, drive_json] = await Promise.all([
    load_system(system_url),
    load_kernel_versions(kernel_url, api),
  ])

  // 3. coredev: shim code + shim html & versions json
  // 4. enduser: localStorage

  LESEZEICHEN: `what is needed to validate conf?`

  const versions = JSON.parse(drive_json)

  const conf = validate_conf(config, versions)

  const v = conf.user.arg.version

  const pack = versions[''][v]
  // const pack = shim.versions[user_arg.version] || get_pack()




  const old_conf = {
    pack,
    shim_env: config.shim.env,
    shim_arg: config.shim.arg,
    page_env: config.page.env,
    page_arg: config.page.arg,
    user_env: config.user.env,
    user_arg: config.user.arg,
  }

  const script = document.createElement('script')
  // @TODO: maybe create blobURL instead!
  script.textContent = wrap(code, JSON.stringify(old_conf), drive_json)
  body.replaceChildren(script) //@TODO: removes iframe though...
  /***************************************************************************/
  return
  /****************************************************************************
    LOAD_KERNEL_VERSIONS
  ****************************************************************************/
  async function load_kernel_versions (src, run) {
    const iframe = Object.assign(document.createElement('iframe'), { src })
    const ready = new Promise(ok => iframe.onload = ok)
    run('load', iframe)
    await ready
    const iwin = iframe.contentWindow
    const { port1, port2 } = new MessageChannel()
    const promise = new Promise(ok => port1.onmessage = e => port1.onmessage = ok(e.data))
    // @TODO: think about etags
    // @TODO: think about timeout reject
    // @TODO:
    // if (status === 404) return body.innerHTML = `GET ${drive_json} 404 (Not Found)`
    iwin.postMessage(`
      {
        onmessage = void 0
        document.body.style = "background-color:fuchsia;"
        const [port] = e.ports
        const url = new URL('./drive.json', location)
        fetch(url, { cache: 'no-store' }).then(async response => {
          const json = await response.text()
          port.postMessage(json)
        })
      }
    `, src, [port2])
    return promise
  }
  /****************************************************************************
    LOAD_SYSTEM
  ****************************************************************************/
  async function load_system (code_href) {
    const req = async res => ({ status: res.status, text: await res.text() })
    const { status, text } = await fetch(code_href, { cache: 'no-store' }).then(req)
    if (status === 404) return body.innerHTML = `GET ${code_href} 404 (Not Found)`
    // @TODO handle etag as well
    // @TODO: handle fetch timeout and reject on 404
    return text
  }
  /****************************************************************************
    PROMPT_UI
  ****************************************************************************/
  function prompt_ui (v, wmax = 57, hmax = 17) {
    const aliases = Object.keys(v).filter(Boolean)
    const resolve = Object.fromEntries(aliases.map(k => [v[k], k]))
    const numbers = Object.keys(v[''])
    const version_list = numbers.sort().reverse().map(n => resolve[n] ? `${n} (${resolve[n]})` : n)
    const current = localStorage['/conf/user/arg/version']
    const ending = `(current version: ${current || ''})`
    const choose = format_line(['➤ choose version:', '', ending])
    // const show = { ask:[choose, box].join('\n') }
    // const status = {
    //   invalid: version => `⛔ invalid version: ${version}`,
    //   release: version => `📦 new version available: ${version}`
    // }
    const all = v['']
    return bui
    function bui (version = v.stable, type = '', txt = '', pack = all[version]) { // get_pack

      const lines = view(issue.length ? `⛔ ${issue}:` : '', txt, choose, version_list.join(', '))

      if (lines.length > 11) console.warn(`⛔ overlay view has more than 17 lines`, lines.length, '\n', lines.join('\n'))
      if (lines.length > 24) console.error(`⛔ overlay view has more than 24 lines`, lines.length, '\n', lines.join('\n'))
      const prompt_text = lines.join('\n')
      // const name = 'invalid'
      // status[name](version) || ''
      while (!pack) {
        version = prompt(prompt_text, v.stable)

        if (version === null) break
        version = Number.isInteger(Number(version)) ? version : v[version]
        pack = all[version]
      }
      return version
    }
    function view (issue, description, prompt, options) {
      return [issue, ...format_box(description), '', prompt, ...format_box(options) ]
    }
    function format_line (PARTS, max = wmax, len = 0, line = []) {
      const LINES = []
      for (let part of PARTS) {
        const plen = part.length
        if (len + plen > max) {
          if (len) LINES.push(line)
          if (plen > max) LINES.push(...split(part, max).map(p => [p]))
          ;[len, line] = plen > max ? [0, []] : [plen, [part]]
        } else {
          len += plen
          line.push(part)
        }
      }
      if (len) LINES.push(line)
      return LINES.map(line => {
        const sizes = line.map(s => Number(s.length || 0))
        const width = sizes.reduce((s, n) => s + n, 0)
        const pad = (max - width) / sizes.filter(c => !c).length
        return line.map(s => s || ' '.repeat(pad)).join('')
      })
    }
    function split (str, max = 54, lines = [], split, c) {
      while (str.length > max) {
        split = str.lastIndexOf(' ', max)
        ;[split, c] = split === -1 ? [max, 0] : [split, 1]
        lines.push(str.slice(0, split).padEnd(max, ' '))
        str = str.slice(split + c)
      }
      return str.length ? lines.concat(str.padEnd(max, ' ')) : lines
    }
    function format_box (txt) {
      txt = split(txt)
      const width = Math.max(...txt.map(s => s.length))
      const line = '─'.repeat(width)
      const paddedLines = txt.map(line => `│ ${line}${' '.repeat(width - line.length)} │`)
      const header = `┌─${line}─┐`
      const footer = `└─${line}─┘`
      return [header, ...paddedLines, footer]
    }
  }
  /****************************************************************************
    GET_PACK
  ****************************************************************************/
  function validate_version (version, v, fix) {
    do {
      const defined = Number.isInteger(Number(version)) ? version : v[version]
      const isvalid = v[''][defined]
      if (isvalid) return defined
      if (!fix) throw new Error(`invalid version: "${version}"`)
      try {
        version = fix(version)
      } catch (error) {
        // @TODO: use proper reporter!
        console.error(error.message)
        document.body.innerHTML = `<pre>${error.message}</pre>`
        throw error
      }
    } while(true)
  }
  function validate_shim_versions (versions) {
    console.warn('@TODO: validate versions')
    // assume valid v (=shim versions) // @TODO: fix
    // @TODO: make sure config is valid to avoid infinite prompt loop
    // e.g. no valid option in conf problem for version!!!!
    const keys = Object.keys(versions)
    // @TODO: validate
    const invalid = false
    if (invalid) throw new Error('`drive.json` is invalid')
    return versions
  }
  function validate_conf (conf, versions, decided) {
    const v =  validate_shim_versions(versions)

    const USER = {
      ask_version: prompt_ui(v)
    }

    const userver = conf.user.arg.version && validate_version(conf.user.arg.version, v, function fix (version) {
      const type = 'user'
      const txt = `invalid ${type} set version "${version}", If version param is provided it must be valid`
      version = USER.ask_version(version, `Error`, txt)
      if (version === null) throw new Error(txt, { cause: new Error('abort') })
      return version
    })
    // valid userver or userver === undefined (if not aborted)

    const loadver = localStorage['/conf/user/arg/version'] && validate_version(localStorage['/conf/user/arg/version'] || 6, v, function fix (version) {
      const txt = `corrupted cached version "${version}". Try to repair by choosing valid shim version`
      if (userver) return (console.warn(txt), userver)
      version = USER.ask_version(version, 'Error', txt)
      if (version === null) throw new Error(txt, { cause: new Error('abort') })
      return version
    })
    // valid loadver or loadver === undefined (if not aborted)

    const shimver = validate_version(conf.shim.env.version || v.stable, v, function fix (version) {
      if (userver || loadver) return (console.warn(txt), userver || loadver)
      const type = 'shim'
      const txt = `invalid ${type} set version "${version}"`
      version = USER.ask_version(version, 'Error', txt) // more prompt: adapt prompt to share previous wrong selection
      if (version === null) throw new Error(txt, { cause: new Error('abort') })
      return version
    })
    // valid shimver (if not aborted)

    const version = userver || loadver || shimver // @NOTE: here a version WILL exist, otherwise it exited with error already!
    console.log(version, { userver, shimver, loadver })

    // uservar > loadver > shimver
    ;{ // UPDATE CONF:
      // @TODO: switch updates to enable using `conf`
      // conf.user.arg.version = localStorage['/conf/user/arg/version'] = version
      // location.hash = new URLSearchParams(conf.user.arg)
      config.user.arg.version = localStorage['/conf/user/arg/version'] = version
      // @TODO: maybe always remove url param set version to use user specified instead only when set!
      // @NOTE: security issue - what if user clicks a url somebody shared to update or prompt user for version?
      location.hash = new URLSearchParams(config.user.arg)
    }
    // @TODO: what if (re) load an an update is available????
    // if (latest_cached_number_or_label < latest_number_or_label) {} // @TODO: update avaliable??

    return deepfreeze(config)
  }
  /****************************************************************************
    WRAP
  ****************************************************************************/
  function wrap (code, config, versions_json, map) {
    const mark = 'return o}return r})()'
    const smap = '//# sourceMappingURL=data:'
    const mime = 'application/json;charset=utf-8;base64,'
    const parts = code.slice(0, -1).split(smap)
    if (parts.length > 1) map = parts.pop()
    if (map && !map.startsWith(mime)) parts.push(map)
    code = parts.join(smap).slice(0, -1)
    code = `void (async F => {${code.replace(mark, `${mark}(...await (F.bind(${config}, ${versions_json})`)}))})(${init})`
    if (map) code = code + `\n${smap}${mime}${map}`
    return code
    async function init (versions, ...args) {
      // const usopen = '00af49'
      // const color1 = '41b557'
      // const color2 = '63bd58'
      // const color3 = 'a8cf80'
      // const color4 = '2b9d48'
      // const color5 = '2ca449'
      const color6 = '53bc67'
      const link = document.createElement('link')
      link.setAttribute('rel', 'icon')
      link.setAttribute('href', `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90" fill="%23${color6}">⬢</text></svg>`)
      document.head.append(link)
      document.title = '⬢js'
      const {
        pack,
        shim_env, shim_arg, page_env, page_arg, user_env, user_arg
      } = this
      console.log(`%c⬢js:v${user_arg.version}`, `color: #${color6}`, {
        versions,
        pack,
        shim_env, shim_arg, page_env, page_arg, user_env, user_arg
      })
      const USE_LOCAL = 'dev' in user_arg
      const HELPER_MODULES = ['io', 'STATE']
      clear_db_on_file_change()
      const [source_cache, module_cache] = args
      await patch_cache_in_browser(source_cache, module_cache)
      document.onvisibilitychange = _ => document.hidden && sessionStorage.setItem('last_item', Date.now())
      return args
      function clear_db_on_file_change () {
        const last_item = sessionStorage.getItem('last_item')
        const now = Date.now()
        const is_reload = performance.getEntriesByType("navigation")[0]?.type === "reload"
        if (is_reload && !(last_item && (now - last_item) < 200)) localStorage.clear()
        sessionStorage.removeItem('last_item')
      }
      async function patch_cache_in_browser (source_cache, module_cache) {
        let STATE_JS
        const prefix = 'https://raw.githubusercontent.com/playproject-io/datashell/'
        const state_url = USE_LOCAL ? user_arg.dev + 'STATE.js' : prefix + pack['STATE']
        const localdb_url = USE_LOCAL ? user_arg.dev + 'localdb.js' : prefix + pack['localdb']
        const io_url = USE_LOCAL ? user_arg.dev + 'io.js' : prefix + pack['io']
        STATE_JS = await Promise.all([
          fetch(state_url, { cache: 'no-store' }).then(res => res.text()),
          fetch(localdb_url, { cache: 'no-store' }).then(res => res.text()),
          fetch(io_url, { cache: 'no-store' }).then(res => res.text())
        ]).then(([state_source, localdb_source, io_source]) => {
          const dependencies = {
            localdb: load(localdb_source),
            io: load(io_source)
          }
          const STATE_JS = load(state_source, (dependency) => dependencies[dependency])
          return STATE_JS
          function load (source, require) {
            const module = { exports: {} }
            const f = new Function('module', 'require', source)
            f(module, require)
            return module.exports
          }
        })
        const meta = { modulepath: ['page'], paths: {} }
        for (const key of Object.keys(source_cache)) {
          const [module, names] = source_cache[key]
          const dependencies = names || {}
          source_cache[key][0] = patch(module, dependencies, meta)
        }
        function patch (module, dependencies, meta) {
          const MAP = {}
          for (const [name, number] of Object.entries(dependencies)) MAP[name] = number
          return (...args) => {
            const original = args[0]
            require.cache = module_cache
            require.resolve = resolve
            args[0] = require
            return module(...args)
            function require (name) {
              const identifier = resolve(name)
              if (HELPER_MODULES.some(suffix => name.endsWith(suffix))) {
                const modulepath = meta.modulepath.join('>')
                let original_export
                if (name.endsWith('STATE')) { original_export = STATE_JS } else { original_export = require.cache[identifier] || (require.cache[identifier] = original(name)) }
                const exports = (...args) => original_export(...args, modulepath, Object.keys(dependencies))
                return exports
              } else {
                // Clear cache for non-STATE and non-io modules
                delete require.cache[identifier]
                const counter = meta.modulepath.concat(name).join('>')
                if (!meta.paths[counter]) meta.paths[counter] = 0
                const localid = `${name}${meta.paths[counter] ? '#' + meta.paths[counter] : ''}`
                meta.paths[counter]++
                meta.modulepath.push(localid.replace(/^\.\+/, '').replace('>', ','))
                const exports = original(name)
                meta.modulepath.pop(name)
                return exports
              }
            }
          }
          function resolve (name) { return MAP[name] }
        }
      }
    }
  }
}

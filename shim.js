globalThis.boot = async (conf_href, system_path = 'bundle.js') => {
  document.title = '⬡js'
  const { body } = document
  body.style = `background-color: black; color: mediumseagreen; font-family: mono;`
  conf_href = conf_href + '?foo=bar#asdf'

  const req = async res => ({ status: res.status, text: await res.text() })
  const get = s => Object.fromEntries(new URLSearchParams(s).entries())
  const shim_url = new URL(import.meta.url)
  const conf_url = new URL(conf_href)
  const shim_json = new URL('shim.json', shim_url).href
  const code_href = new URL(system_path, conf_url).href
  const [code, { status, text }] = await Promise.all([
    fetch(code_href, { cache: 'no-store' }).then(req),
    fetch(shim_json, { cache: 'no-store' }).then(req),
  ])
  if (code.status === 404) return body.innerHTML = `GET ${code_href} 404 (Not Found)`
  if (status === 404) return body.innerHTML = `GET ${shim_json} 404 (Not Found)`
  const shim = JSON.parse(text)
  const shim_env = get(shim_url.search)
  const shim_arg = get(shim_url.hash.slice(1))
  const conf_env = get(conf_url.search)
  const conf_arg = get(conf_url.hash.slice(1))
  const user_env = get(location.search)
  const user_arg = get(location.hash.slice(1))
  const pack = shim.versions[user_arg.version] || get_pack()
  const json = JSON.stringify({
    pack,
    shim_env, shim_arg, conf_env, conf_arg, user_env, user_arg
  })
  const script = document.createElement('script')
  script.textContent = wrap(code.text)
  body.replaceChildren(script)
  function get_pack (pack, decided) {
    const { version = 'stable' } = shim_env
    const defined = Number.isInteger(Number(version)) ? version : shim[version]
    const current = Number(localStorage.version || 0)
    while (!pack) {
      decided = current ? current < defined ? prompt(`
        ⬢js version: ${localStorage.version}

        choose available:
        - config: ${defined}
        - stable: ${shim.stable}
        - latest: ${shim.latest}
      `, defined) || current : current : defined
      decided = Number.isInteger(Number(decided)) ? decided : shim[decided]
      pack = shim.versions[decided]
    }
    user_arg.version = localStorage.version = decided
    location.hash = new URLSearchParams(user_arg)
    return pack
  }
  function wrap (code, map) {
    const mark = 'return o}return r})()'
    const smap = '//# sourceMappingURL=data:'
    const mime = 'application/json;charset=utf-8;base64,'
    const parts = code.slice(0, -1).split(smap)
    if (parts.length > 1) map = parts.pop()
    if (map && !map.startsWith(mime)) parts.push(map)
    code = parts.join(smap).slice(0, -1)
    code = `void (async F => {${code.replace(mark, `${mark}(...await (F.bind(${json}, ${text})`)}))})(${init})`
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
        shim_env, shim_arg, conf_env, conf_arg, user_env, user_arg
      } = this
      console.log()
      console.log(`%c⬢js:v${user_arg.version}`, `color: #${color6}`, {
        versions,
        pack,
        shim_env, shim_arg, conf_env, conf_arg, user_env, user_arg
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
        const prefix = 'https://raw.githubusercontent.com/playproject-io/datashell/refs/heads/main/'
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

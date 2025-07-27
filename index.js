const env = { version: 'latest' }
const arg = { x: 321, y: 543 }
const url = 'shim.js'
const src = `${url}?${new URLSearchParams(env)}#${new URLSearchParams(arg)}`
this.open ? document.body.append(Object.assign(document.createElement('script'), { src })) : importScripts(src)
const taken = {}

module.exports = io
function io(seed, alias, callback) {
  if (taken[seed]) throw new Error(`seed "${seed}" already taken`)
  // const pk = seed.slice(0, seed.length / 2)
  // const sk = seed.slice(seed.length / 2, seed.length)
  const self = taken[seed] = { id: seed, alias, peer: {} }
  const io = { at, on }
  return io

  async function at (id, signal = AbortSignal.timeout(1000)) {
    callback && callback('Connect', alias)
    if (id === seed) throw new Error('cannot connect to loopback address')
    if (!self.online) throw new Error('network must be online')
    const peer = taken[id] || {}
    // if (self.peer[id] && peer.peer[pk]) {
    //   self.peer[id].close() || delete self.peer[id]
    //   peer.peer[pk].close() || delete peer.peer[pk]
    //   return console.log('disconnect')
    // }
    // self.peer[id] = peer
    if (!peer.online) return wait() // peer with id is offline or doesnt exist
    return connect()
    function wait () {
      const { resolve, reject, promise } = Promise.withResolvers()
      signal.onabort = () => reject(`timeout connecting to "${id}"`)
      peer.online = { resolve }
      return promise.then(connect)
    }
    function connect () {
      signal.onabort = null
      const { port1, port2 } = new MessageChannel()
      port2.by = port1.to = id
      port2.to = port1.by = seed
      self.online(self.peer[id] = port1)
      peer.online(peer.peer[seed] = port2)
      return port1
    }
  }
  function on (online) { 
    if (!online) return self.online = null
    const resolve = self.online?.resolve
    self.online = online
    if (resolve) resolve(online)
  }
}

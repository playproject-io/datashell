/******************************************************************************
  LOCALDB COMPONENT
******************************************************************************/
module.exports = localdb

function localdb () {
  const prefix = '153/'
  return { add, read_all, read, drop, push, length, append, find, wash, gen_id }

  function length (keys) {
    const address = prefix + keys.join('/')
    return Object.keys(localStorage).filter(key => key.includes(address)).length
  }
  /**
   * Assigns value to the key of an object already present in the DB
   * 
   * @param {String[]} keys 
   * @param {any} value 
   */
  function add (keys, value, precheck) {
    localStorage[(precheck ? '' : prefix) + keys.join('/')] = JSON.stringify(value)
  }
  /**
   * Appends values into an object already present in the DB
   * 
   * @param {String[]} keys 
   * @param {any} value 
   */
  function append (keys, data) {
    const pre = keys.join('/')
    Object.entries(data).forEach(([key, value]) => {
      localStorage[prefix + pre+'/'+key] = JSON.stringify(value)
    })
  }
  /**
   * Pushes value to an array already present in the DB
   * 
   * @param {String[]} keys
   * @param {any} value 
   */
  function push (keys, value) {
    const independent_key = keys.slice(0, -1)
    const data = JSON.parse(localStorage[prefix + independent_key.join('/')])
    data[keys.at(-1)].push(value)
    localStorage[prefix + independent_key.join('/')] = JSON.stringify(data)
  }
  function read (keys) {
    const result = localStorage[prefix + keys.join('/')]
    return result && JSON.parse(result)
  }
  function read_all (addresses) {
    let result = localStorage
    addresses.forEach(address => {
      const temp = {}
      Object.entries(result).forEach(([key, value]) => {
        if(key.includes(address))
          temp[key] = value
      })
      result = temp
    })
    const temp = {}
    Object.entries(result).forEach(([key, value]) => {
      temp[key.replace(/^([^/]+\/){2}/, '')] = JSON.parse(value)
    })
    return temp
  }
  function drop (keys) {
    if(keys.length > 1){
      const data = JSON.parse(localStorage[keys[0]])
      let temp = data
      keys.slice(1, -1).forEach(key => {
        temp = temp[key]
      })
      if(Array.isArray(temp))
        temp.splice(keys[keys.length - 1], 1)
      else
        delete(temp[keys[keys.length - 1]])
      localStorage[keys[0]] = JSON.stringify(data)
    }
    else
      delete(localStorage[keys[0]])
  }
  function find (keys, filters, index = 0) {
    let index_count = 0
    const address = prefix + keys.join('/')
    const target_key = Object.keys(localStorage).find(key => {
      if(key.includes(address)){
        const entry = JSON.parse(localStorage[key])
        let count = 0
        Object.entries(filters).some(([search_key, value]) => {
          if(entry[search_key] !== value)
            return
          count++
        })
        if(count === Object.keys(filters).length){
          if(index_count === index)
            return key
          index_count++
        }
      }
    }, undefined)
    return target_key && JSON.parse(localStorage[target_key])
  } 
  function wash () {
    localStorage.clear()
  }
  function gen_id (raw_id) {
    const seed = raw_id.replace(/:0$/, "")
    const copies = Object.keys(read_all(['state', seed]))
    if (copies.length) {
      const id = copies.sort().at(-1).split(':')[1]
      raw_id = seed + ':' + (Number(id || 0) + 1)
    }
    return raw_id
  }
}
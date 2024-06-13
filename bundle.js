(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process,__filename){(function (){
// ----------------------------------------
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const shopts = { mode: 'closed' }
//  ----------------------------------------
module.exports = chat_input
//  ----------------------------------------
async function chat_input (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  state.shift_status = true
  state.textmode = "msg"
  state.username = opts.host

  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = {
    activate_input
  }
  const channel_up = use_protocol('up')({ protocol, state, on })
  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <div class="crud">
      <div class="btn_wrapper">
        <div class="popup" tabindex='0'>
          <div class="noblur">📥 Input </div>
          <div class="noblur">📤 Output </div>
          <div class="noblur">📭 Task </div>
        </div>
        <button class="add noblur">
          +
        </button>
      </div>
      <button class="join noblur">
        join
      </button>
      <button class="export noblur">
        export
      </button>
      <div class="box">
        <div class="overlay">
          <div>/🗃list <span>📌</span></div>
          <div>/📩text <span>📌</span></div>
          <div>/🆕🔳task <span>📌</span></div>
          <div>/🔳subtask <span>📌</span></div>
          <div>/📨invite <span>📌</span></div>
          <div>/📥input <span>📌</span></div>
          <div>/📤output <span>📌</span></div>
          <div>/😀emoji <span>📌</span></div>
          <div>/📎attach file <span>📌</span></div>
        </div>
        <textarea class="noblur" placeholder="Enter a command"></textarea>
      </div>
      <div class="send">></div>
    </div>`
  // ----------------------------------------
  const btn_add = shadow.querySelector('.add')
  const btn_join = shadow.querySelector('.join')
  const btn_export = shadow.querySelector('.export')
  const btn_send = shadow.querySelector('.send')
  const textarea = shadow.querySelector('textarea')
  const popup = shadow.querySelector('.popup')
  const overlay = shadow.querySelector('.overlay')
  // ----------------------------------------
  btn_add.onclick = () => popup.focus()
  btn_join.onclick = handle_join
  btn_export.onclick = handle_export
  btn_send.onclick = handle_send
  textarea.onkeyup = handle_keyup
  textarea.onkeydown = handle_keydown
  for (const child of popup.children){
    child.onclick = handle_add
  }
  
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  return el

  /******************************************
   Event handlers
  ******************************************/
  async function handle_export () {
    const channel = state.net[state.aka.task_explorer]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'handle_export',
    })
  }
  async function handle_send () {
    if(textarea.disabled)
      return
    if(state.textmode === "msg")
      on_tx()
    else
      join()
  }
  async function handle_keydown (e) {
    if(state.shift_status)
      switch (e.key){
        case 'Enter':
          e.preventDefault()
          if(state.textmode === "msg")
            on_tx()
          else
            join()
          break
        case 'Shift':
          state.shift_status = false
      }
  }
  async function handle_add (e) {
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['task_explorer'], type: 'handle_add', data: e.target.innerHTML}
    })
  }
  async function handle_keyup (e) {
    e.target.style.height = "1px";
    e.target.style.height = (2+e.target.scrollHeight)+"px";
    if(e.key === 'Shift')
      state.shift_status = true
    if(textarea.value === '/'){
      overlay.classList.add('show')
      textarea.addEventListener('blur', handle_blur)
      textarea.addEventListener('focus', handle_blur)
    }
    else{
      overlay.classList.remove('show')
      textarea.removeEventListener('blur', handle_blur)
      textarea.removeEventListener('focus', handle_blur)
    }
  }
  async function handle_blur () {
    overlay.classList.toggle('show')
  }
  async function handle_join () {
    textarea.disabled = false
    textarea.placeholder = "Enter a invite code"
    state.textmode = 'join'
  }
  /******************************************
   Communication
  ******************************************/
  async function on_tx () {
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'on_tx',
      data: {content: textarea.value.replaceAll('\n', '<br>'), username: state.username}
    })
    textarea.value = ''
  }
  async function join () {
    const [user, task_id] = textarea.value.split('-')
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['task_explorer'], users: [user], type: 'handle_invite', data: {sender: opts.host, task_id}}
    })
  }
  async function activate_input ({ data }) {
    textarea.disabled = false
    data ? textarea.placeholder = data : ''
  }
}
function get_theme () {
  return `
  *{
    box-sizing: border-box;
  }
  .crud{
    display: flex;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid gray;
  }
  .box{
    position: relative;
    margin: 40px 20px;
  }
  .box > textarea{
    height: 40px;
    min-height: 40px;
    padding: 10px;
    width: 100%;
  }
  .box > .overlay{
    display: none;
    position: absolute;
    background-color: #222;
    box-shadow: 0 0 2px 1px rgb(255, 255, 255);
    width: 100%;
    bottom: 50px;
  }
  .box > .overlay.show{
    display: block;
  }
  .box > .overlay > div{
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 4px 10px;
  }
  .box > .overlay > div:hover{
    background-color: #555;
  }
  textarea::-webkit-scrollbar{
    display: none;
  }
  .btn_wrapper{
    position: relative;
  }
  .btn_wrapper .popup{
    height: 0;
    position: absolute;
    bottom: 100%;
    background: black;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
  }
  .btn_wrapper .popup:focus{
    height: auto;
    padding: 5px;
    border: 1px solid gray;
  }
  .send{
    padding: 7px 10px;
    background-color: black;
    position: absolute;
    right: 40px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 4px;
  }
  `
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disjoin channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}

}).call(this)}).call(this,require('_process'),"/src/node_modules/chat_input/chat_input.js")
},{"_process":1}],3:[function(require,module,exports){
(function (process,__filename){(function (){
const taskdb = require('taskdb')
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
const sheet = new CSSStyleSheet()
sheet.replaceSync(get_theme())
const shopts = { mode: 'closed' }
//  ----------------------------------------
module.exports = task_explorer
//  ----------------------------------------
function task_explorer (opts, protocol) {
  // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const { host } = opts
  state.name = 'task_explorer'
  state.code_words = {inputs: 'io', outputs: 'io', tasks: 'task'}
  state.add_words = {tasks: 'sub'}
  // ----------------------------------------
  // PROTOCOL
  // ----------------------------------------
  const on = { 
    'on_add_node': on_add_node,
    'handle_add': handle_add,
    'send': send,
    'save_msg': save_msg,
    'handle_invite': handle_invite,
    'on_invite': on_invite,
    'handle_export': handle_export
  }
  const on_add = {
    'io': add_node_io,
    'link': add_node_link,
    'tasks': add_node_sub,
  }
  const channel_up = use_protocol('up')({ protocol, state, on })

  // ----------------------------------------
  // TEMPLATE
  // ----------------------------------------
  const el = document.createElement('div');
  const shadow = el.attachShadow(shopts)
  shadow.adoptedStyleSheets = [sheet]
  shadow.innerHTML = `
    <div class="box">
      <main>
      </main>
      <div class="popup" tabindex="0">
        <div>Edit</div>
        <div>Drop</div>
      </div>
    </div>
    `
  // ----------------------------------------
  const tree_el = shadow.querySelector('main')
  const popup = shadow.querySelector('.popup')
  // ----------------------------------------
  // ELEMENTS
  // ----------------------------------------
  {
    const on = { 
      'set': set
    }
    const protocol = use_protocol('taskdb')({ state, on })
    const opts = { host }
    taskdb(opts, protocol)
    async function set ({ data }) {
      state.query_result = data
    }
  }
  // ----------------------------------------
  // INIT
  // ----------------------------------------
  
  let json_data
  const channel = state.net[state.aka.taskdb]
  channel.send({
    head: [id, channel.send.id, channel.mid++],
    type: 'get',
    data: '/'
  })
  if(state.query_result){
    json_data = state.query_result
    fill_tree_el()
  }
  else
    fetch("./data_"+host+".json")
    .then(res => res.json())
    .then(data => {
        json_data = data
        fill_tree_el()
        channel.send({
          head: [id, channel.send.id, channel.mid++],
          type: 'set',
          data: json_data
        })
      }
    )
  
  return el

  async function fill_tree_el () {
    const root_nodes = json_data.filter(data => data.root)
    const length = root_nodes.length - 1
    tree_el.append(...root_nodes.map((data, i) => add_node_root({ data, last: i === length })))
  }
  function create_node (type, id) {
    const element = document.createElement('div')
    element.classList.add(type, 'node')
    element.tabIndex = '0'
    element.id = 'a'+id
    return element
  }
  function html_template (data, last, space, grand_last){
    const element = create_node(data.type, data.id)
    if(data.root)
      space = ''
    else
      space += grand_last ? '&emsp;&emsp;' : '│&emsp;&nbsp;'
    element.dataset.space = space
    element.dataset.grand_last = last ? 'a' : ''

    return [element, last, space]
  }
  /******************************************
   Addition Operation
  ******************************************/
  function add_node_el ({ data, parent, space, grand_last, type }){
    const is_single = parent.children.length ? false : true
    if(data.root){
      parent.prepend(add_node_root({ data, last: false}))
      return
    }
    //hub or sub node check
    if(type === 'inputs')
      parent.append(on_add[type]({ data, space, grand_last, first: is_single}))
    else
      parent.prepend(on_add[type]({ data, space, grand_last, last: is_single}))

  }
  function add_node_root ({ data, last }) {
    [ element, last, space ] = html_template(data, last)
    element.innerHTML = `
      <div class="details">
        ${last ? '└' : '├'}<span class="tas">📓─</span>${data.name}<span class="last">...</span>
      </div>
      <div class="tasks nodes">
      </div>
    `
    const sub_emo = element.querySelector('.details > .tas')
    const last_el = element.querySelector('.details > .last')
    const tasks = element.querySelector('.tasks')
    
    let is_on
    sub_emo.onclick = sub_click
    element.onfocus = handle_focus
    last_el.onclick = handle_popup
    return element
    function sub_click () {
      sub_emo.innerHTML = is_on ? '📓─' : '📖┬'  
      is_on = handle_click({ el: tasks, type: 'tasks', data: data.sub, space, is_on, grand_last: last, pos: false })
    }
  }
  function add_node_sub ({ data, last, grand_last, space }) {
    [ element, last, space ] = html_template(data, last, space, grand_last)
    element.innerHTML = `
      <div class="hub nodes">
      </div>
      <div class="inputs nodes">
      </div>
      <div class="details">
        ${space}${last ? '└' : '├'}<span class="hub_emo">📪</span><span class="tas">─📪</span><span class="inp">🗃</span><span class="out">─🗃</span><span class="name">${data.name}</span><span class="last">...</span>
      </div>
      <div class="outputs nodes">
      </div>
      <div class="tasks nodes">
      </div>
    `
    const details = element.querySelector('.details > .name')
    const hub_emo = element.querySelector('.details > .hub_emo')
    const sub_emo = element.querySelector('.details > .tas')
    const inp = element.querySelector('.details > .inp')
    const out = element.querySelector('.details > .out')
    const last_el = element.querySelector('.details > .last')
    // const after = element.querySelector('.details > .after')
    const hub = element.querySelector('.hub')
    const outputs = element.querySelector('.outputs')
    const inputs = element.querySelector('.inputs')
    const tasks = element.querySelector('.tasks')
    
    let hub_on, sub_on, inp_on, out_on
    hub_emo.onclick = hub_click
    sub_emo.onclick = sub_click
    inp.onclick = inp_click
    out.onclick = out_click
    element.onfocus = handle_focus
    details.onclick = open_chat
    last_el.onclick = handle_popup
    // after.onclick = () => {
    //   alert(host+'-'+data.id)
    //   try{
    //     navigator.clipboard.writeText(host+'-'+data.id) 
    //   }
    //   catch{

    //   }
    // }
    return element
    function hub_click () {
      if(hub_on){
        hub_emo.innerHTML = '📪'
        sub_on ? sub_emo.innerHTML = '┬'+sub_emo.innerHTML.slice(1) : sub_emo.innerHTML = '─'+sub_emo.innerHTML.slice(1)
      } else{
        hub_emo.innerHTML = '📭'
        sub_on ? sub_emo.innerHTML = '┼'+sub_emo.innerHTML.slice(1) : sub_emo.innerHTML = '┴'+sub_emo.innerHTML.slice(1)
      }
      hub_on = handle_click({ el: hub, type: 'link', data: data.hub, space, is_on: hub_on, pos: true })
    }
    function sub_click () {
      if(sub_on){
        hub_on ? sub_emo.innerHTML = '┴📪' : sub_emo.innerHTML = '─📪'
      } else{
        hub_on ? sub_emo.innerHTML = '┼📭' : sub_emo.innerHTML = '┬📭'
      }
      sub_on = handle_click({ el: tasks, type: 'tasks', data: data.sub, space, is_on: sub_on, grand_last: last, pos: false })
    }
    function inp_click () {
      if(inp_on){
        inp.innerHTML = '🗃'
        out_on ? out.innerHTML = '┬'+out.innerHTML.slice(1) : out.innerHTML = '─'+out.innerHTML.slice(1)
      } else{
        inp.innerHTML = '🗂'
        out_on ? out.innerHTML = '┼'+out.innerHTML.slice(1) : out.innerHTML = '┴'+out.innerHTML.slice(1)
      }
      inp_on = handle_click({ el: inputs, type: 'io', data: data.inputs, space, is_on: inp_on, pos: true })
    }
    function out_click () {
      if(out_on){
        inp_on ? out.innerHTML = '┴🗃' : out.innerHTML = '─🗃'
      } else{
        inp_on ? out.innerHTML = '┼🗂' : out.innerHTML = '┬🗂'
      }
      out_on = handle_click({ el: outputs, type: 'io', data: data.outputs, space, is_on: out_open, pos: false })
    }
  }
  function add_node_io ({ data, first, last, space }) {
    const element = create_node(data.type, data.id)
    const grand_space = space + '│&emsp;&nbsp;│&emsp;&emsp;&ensp;'
    space += '│&emsp;&emsp;&emsp;&emsp;&ensp;'
    element.innerHTML = `
    <div class="details">
      <span class="space">${space}</span><span class="grand_space">${grand_space}</span>${first ? '┌' : last ? '└' : '├'}</span><span class="btn">📥─</span>${data.name}<span class="after">🔗</span>
    </div>
    <div class="tasks nodes">
    </div>
    `
    const btn = element.querySelector('.details > .btn')
    const tasks = element.querySelector('.tasks')
    btn.onclick = () => handle_click({ el: tasks, type: 'link', data: data.sub, space, pos: false })
    return element
  }
  function add_node_link ({ data, first, last, space }) {
    const element = document.createElement('div')
    element.classList.add('next', 'node')
    element.dataset.id = data.id
    space += '│&emsp;&nbsp;'
    element.innerHTML = `
      <div class="details">
        ${space}${last ? '└' : first ? '┌' : '├'} ${data.name}
      </div>`
    element.onclick = jump
    
    return element
  }
  async function add_node_data (name, type, parent_id, users, author){
    const node_id = json_data.length
    json_data.push({ id: node_id, name, type: state.code_words[type], room: {}, users })
    if(parent_id){
      save_msg({
          head: [id],
          type: 'save_msg',
          data: {username: 'system', content: author + ' added ' + type.slice(0,-1)+': '+name, chat_id: parent_id}
        })
      //Add a message in the chat
      if(state.chat_task && parent_id === state.chat_task.id.slice(1))
        channel_up.send({
          head: [id, channel_up.send.id, channel_up.mid++],
          type: 'render_msg',
          data: {username: 'system', content: author+' added '+type.slice(0,-1)+': '+name}
        })
      const sub_nodes = json_data[parent_id][state.add_words[type]]
      sub_nodes ? sub_nodes.push(node_id) : json_data[parent_id][state.add_words[type]] = [node_id]
    }
    else{
      json_data[node_id].root = true
      json_data[node_id].users = [opts.host]
    }
    save_msg({
      head: [id],
      type: 'save_msg',
      data: {username: 'system', content: author + ' created ' + type.slice(0,-1)+': '+name, chat_id: node_id}
    })
    const channel = state.net[state.aka.taskdb]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
    
  }
  async function on_add_node (data) {
    const node = data.id ? shadow.querySelector('#a' + data.id + ' > .'+data.type) : tree_el
    node && node.children.length && add_node_el({ data: { name: data.name, id: json_data.length, type: state.code_words[data.type] }, parent: node, grand_last: data.grand_last, type: data.type, space: data.space })
    add_node_data(data.name, data.type, data.id, data.users, data.user)
  }
  /******************************************
   Event handlers
  ******************************************/
  function handle_focus (e) {
    state.xtask = e.target
    state.xtask.classList.add('focus')
    state.xtask.addEventListener('blur', e => {
      if(e.relatedTarget && e.relatedTarget.classList.contains('noblur'))
        return
      state.xtask.classList.remove('focus')
      state.xtask = undefined
    }, { once: true })
  }
  function handle_popup (e) {
    const el = e.target
    el.classList.add('show')
    popup.style.top = el.offsetTop - 20 + 'px'
    popup.style.left = el.offsetLeft - 56 + 'px'
    popup.focus()
    popup.addEventListener('blur', () => {
      el.classList.remove('show')
    }, { once: true })
  }
  function handle_click ({ el, type, data, space, is_on, grand_last, pos }) {
    el.classList.toggle('show')
    if(data && el.children.length < 1){
      length = data.length - 1
      data.forEach((value, i) => el.append(on_add[type]({ data: json_data[value], first: pos ? 0 === i : false, last: pos ? false : length === i, space, grand_last })))
    }
    return !is_on
  }
  async function handle_export () {
    const data = await traverse( state.xtask.id.slice(1) )
    const json_string = JSON.stringify(data, null, 2);
    const blob = new Blob([json_string], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.json';
    link.click();
  }
  async function handle_add (data) {
    data = data.slice(2).trim().toLowerCase() + 's'
    const input = document.createElement('input')
    let node, task_id, space = '', grand_last = true, root = true
    //expand other siblings
    if(state.xtask){
      node = state.xtask.querySelector('.' + data)
      task_id = state.xtask.id.slice(1)
      const before = state.xtask.querySelector('.' + data.slice(0,3))
      before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
      node.classList.add('show')
      grand_last = state.xtask.dataset.grand_last
      space = state.xtask.dataset.space
      state.xtask.classList.remove('focus')
      state.xtask = undefined
      root = false
    }
    else{
      node = tree_el
      task_id = ''
    }
    node.prepend(input)
    input.onkeydown = async (event) => {
      if (event.key === 'Enter') {
        input.blur()
        add_node_el({ data : { name: input.value, id: json_data.length, type: state.code_words[data], root }, space, grand_last, type: data, parent: node })
        const users = task_id ? json_data[task_id].users : [host]
        add_node_data(input.value, data, task_id, users, host)
        //sync with other users
        if(users.length > 1)
          channel_up.send({
            head: [id, channel_up.send.id, channel_up.mid++],
            type: 'send',
            data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: json_data[task_id].users.filter(user => user !== host), type: 'on_add_node', data: {name: input.value, id: task_id, type: data, users, grand_last, space, user: host} }
          })
      }
    }
    input.focus()
    input.onblur = () => input.remove()
  }
  /******************************************
   Tree traversal
  ******************************************/
  async function jump (e){
    let target_id = e.currentTarget.dataset.id
    const el = tree_el.querySelector('#a'+target_id)
    if(el)
      el.focus()
    else{
      const path = []
      for(let temp = json_data[target_id]; !temp.root; temp = json_data[temp.parent])
        path.push(temp.id)
      temp = tree_el.querySelector('#a'+temp.id)
      target_id = 'a'+target_id
      while(temp.id !== target_id){
        const before = temp.querySelector('.before')
        before.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable: true, view: window}))
        temp.classList.add('show')
        temp = temp.querySelector('#a'+path.pop())
      }
      temp.focus()
    }
      
  }
  async function traverse (id) {
    state.result = []
    state.track = []
    recurse(id)
    return state.result
  }
  function recurse (id){
    if(state.track.includes(id))
      return
    state.result.push(json_data[id])
    state.track.push(id)
    for(temp = 0; json_data[id].tasks && temp < json_data[id].tasks.length; temp++)
      recurse(json_data[id].tasks[temp])
    for(temp = 0; json_data[id].inputs && temp < json_data[id].inputs.length; temp++)
      recurse(json_data[id].inputs[temp])
    for(temp = 0; json_data[id].outputs && temp < json_data[id].outputs.length; temp++)
      recurse(json_data[id].outputs[temp])
  }
  /******************************************
   Communication
  ******************************************/
  async function open_chat () {
    const node = json_data[Number(state.xtask.id.slice(1))]
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'open_chat',
      data: node
    })
    
    if(state.chat_task)
      state.chat_task.classList.remove('chat_active')
    state.chat_task = state.xtask
    state.chat_task.classList.add('chat_active')
  }
  async function save_msg (msg) {
    const {data} = msg
    msg.data = data.content,
    msg.meta = {
        date: new Date().getTime()
      }
    msg.refs = ''
    const node = json_data[Number(data.chat_id)]
    const username = data.username === host ? '' : data.username
    node.room[username] ? node.room[username].push(msg) : node.room[username] = [msg]
    const channel = state.net[state.aka.taskdb]
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'set',
      data: json_data
    })
  }
  async function handle_invite ({ sender, task_id }) {
    const node = json_data[Number(task_id)]
    node.users.push(sender)
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'send',
      data: {to: 'task_explorer', route: ['up', 'task_explorer'], users: [sender], type: 'on_invite', data: node }
    })
  }
  async function on_invite (data) {
    const {name, id, type} = data
    tree_el.prepend(add_node_sub({ name, id, type }))
    json_data.push(data)
  }
  async function send ({ data }) {
    const {to, route} = data
    if(to === state.name){
      const {type, data: shuttle_data} = data
      on[type](shuttle_data)
      return
    }
    const channel = state.net[state.aka[route[0]]]
    data.route = data.route.slice(1)
    channel.send({
      head: [id, channel.send.id, channel.mid++],
      type: 'send',
      data
    })
  }
}

function get_theme () {
  return `
  .box{
    position: relative;
  }
  main{
    max-height: 300px;
    overflow: scroll;
    max-width: 5px;
    min-width: 100%;
  }
  main > .task{
    position: relative;
    min-width: fit-content;
  }
  .task{
    cursor: pointer;
    margin: 5px 0;
  }
  .node > .nodes{
    display: none;
    margin: 5px 0;
  }
  .nodes.show{
    display: block;
  }
  .node.focus > .details{
    background-color: #222;
  }
  .io > .details > .grand_space{
    display: none;
  }
  .hub.show + .inputs > .io > .details > .grand_space,
  .outputs:has(+ .tasks.show) > .io > .details > .grand_space{
    display: inline;
  }
  .hub.show + .inputs > .io > .details > .space,
  .outputs:has(+ .tasks.show) > .io > .details > .space{
    display: none;
  }
  .details{
    white-space: nowrap;
    width: 100%;
  }
  .details > .last{
    display: none;
    position: absolute;
    right: 3px;
    padding: 0 2px;
    background-color: black;
    color: white;
    box-shadow: 0 0 20px 1px rgba(255, 255, 255, 0.5);
  }
  .details:hover > .last,
  .details > .last.show{
    display: inline;
  }
  .task.chat_active > .details{
    color: green;
  }
  .popup{
    height: 0;
    position: absolute;
    background-color: #222;
    z-index: 1;
    overflow: hidden;
    cursor: pointer;
  }
  .popup:focus{
    height: auto;
    box-shadow: 0 0 2px 1px rgb(255, 255, 255);
  }
  .popup > div{
    padding: 5px 10px;
  }
  .popup > div:hover{
    background-color: #555;
  }
  `
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disconnect channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}

}).call(this)}).call(this,require('_process'),"/src/node_modules/task_explorer/task_explorer.js")
},{"_process":1,"taskdb":4}],4:[function(require,module,exports){
(function (process,__filename){(function (){
// MODULE STATE & ID
var count = 0
const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
const ID = dir.slice(cwd.length)
const STATE = { ids: {}, net: {} } // all state of component module
//  ----------------------------------------
module.exports = taskdb
//  ----------------------------------------
function taskdb (opts, protocol) {
    // ----------------------------------------
  // ID + JSON STATE
  // ----------------------------------------
  const id = `${ID}:${count++}` // assigns their own name
  const status = {}
  const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
  const on = { ls, add, get, set }
  const channel_up = use_protocol('up')({ protocol, state, on })
  const dbname = 'db_'+opts.host
  function ls (taskpath = '/') {}
  function add (taskpath, name) {}
  function get ({ data }) {
    const db = localStorage.getItem(dbname)
    channel_up.send({
      head: [id, channel_up.send.id, channel_up.mid++],
      type: 'set',
      data: JSON.parse(db)
    })
  }
  function set ({ data }) {
    localStorage.setItem(dbname, JSON.stringify(data))
  }
}
function use_protocol (petname) {
  return ({ protocol, state, on = { } }) => {
    if (petname in state.aka) throw new Error('petname already initialized')
    const { id } = state
    const invalid = on[''] || (message => console.error('invalid type', message))
    if (protocol) return handshake(protocol(Object.assign(listen, { id })))
    else return handshake
    // ----------------------------------------
    // @TODO: how to disjoin channel
    // ----------------------------------------
    function handshake (send) {
      state.aka[petname] = send.id
      const channel = state.net[send.id] = { petname, mid: 0, send, on }
      return protocol ? channel : Object.assign(listen, { id })
    }
    function listen (message) {
      const [from] = message.head
      const by = state.aka[petname]
      if (from !== by) return invalid(message) // @TODO: maybe forward
      console.log(`[${id}]:${petname}>`, message)
      const { on } = state.net[by]
      const action = on[message.type] || invalid
      action(message)
    }
  }
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/taskdb/index.js")
},{"_process":1}],5:[function(require,module,exports){
(function (process,__filename){(function (){
module.exports = [require, program]

async function program ({ require }) {
  console.log('@TODO: refactor!')
  document.body.innerHTML = `<h3>@TODO: show + refactor task messenger<h3>`
  return
  const task_explorer = require('task_explorer')
  const chat_input = require('chat_input')
  // ----------------------------------------
  // MODULE STATE & ID
  var count = 0
  const [cwd, dir] = [process.cwd(), __filename].map(x => new URL(x, 'file://').href)
  const ID = dir.slice(cwd.length)
  const STATE = { ids: {}, net: {} } // all state of component module
  //  ----------------------------------------
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(get_theme())
  const shopts = { mode: 'closed' }
  //  ----------------------------------------
  module.exports = task_messenger
  //  ----------------------------------------
  async function task_messenger (opts, protocol) {
    // ----------------------------------------
    // ID + JSON STATE
    // ----------------------------------------
    const id = `${ID}:${count++}` // assigns their own name
    const status = {}
    const state = STATE.ids[id] = { id, status, wait: {}, net: {}, aka: {} } // all state of component instance
    const name = 'task_messenger'
    state.users = opts.users.filter(username => username!==opts.username)
    state.username = opts.username
    state.pk = opts.username[0]+'123'
    state.id_map = {'a123':'ana', 'b123':'bob'}
    // ----------------------------------------
    // PROTOCOL
    // ----------------------------------------
    const on = {
      'on_rx': on_rx,
      'send': send,
    }
    const channel_up = use_protocol('up')({ protocol, state, on })
    // ----------------------------------------
    // TEMPLATE
    // ----------------------------------------
    const el = document.createElement('div');
    const shadow = el.attachShadow(shopts)
    shadow.adoptedStyleSheets = [sheet]
    shadow.innerHTML = `
      <div class="main">
        <header>
        ${opts.username}
        </header>
        <div class="container">
          <div class="chat">
            <div class="history">
            </div>
          </div>
          <div class="explorer_box">
          </div>
          <div class="input_box noblur">
          </div>
        </div>
        <div class="footer">
          <div class="title">
          </div>
          <div class="task">
          </div>
          <div class="input">
          </div>
          <div class="output">
          </div>
        </div>
      </div>
    `
    // ----------------------------------------
    const explorer_box = shadow.querySelector('.explorer_box').attachShadow(shopts)
    const input_box = shadow.querySelector('.input_box').attachShadow(shopts)
    const history = shadow.querySelector('.history')
    const footer = shadow.querySelector('.footer')
    // ----------------------------------------
    // ELEMENTS
    // ----------------------------------------
    {//task explorer
      const on = {
        send,
        open_chat,
        on_tx,
        render_msg
      }
      const protocol = use_protocol('task_explorer')({ state, on })
      const opts = { users: state.users, host: state.username }
      const element = task_explorer(opts, protocol)
      explorer_box.append(element)
    }
    {//chat input
      const on = {
        send,
        on_tx,
      }
      const protocol = use_protocol('chat_input')({ state, on })
      const opts = { users: state.users, host: state.username }
      const element = await chat_input(opts, protocol)
      input_box.append(element)
    }
    // ----------------------------------------
    // INIT
    // ----------------------------------------
    return el
    async function on_tx ({ data }) {
      render_msg({ data })

      const channel = state.net[state.aka.task_explorer]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'save_msg',
        data: {content: data.content, username: state.username, chat_id: state.chat.id}
      })
      channel_up.send({
        head: [id, channel_up.send.id, channel_up.mid++],
        type: 'send',
        data: {from: state.username, users: state.users, to: 'task_messenger', type: 'on_rx', data_re: {content: data.content, chat_id: state.chat.id}}
      })
    }
    async function on_rx (data) {
      const { from, data_re } = data
      const { content, chat_id } = data_re
      const channel = state.net[state.aka.task_explorer]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'save_msg',
        data: {content, username: from, chat_id}
      })
      if(state.chat && chat_id === state.chat.id)
        render_msg({ data: { username: from, content }})
      history.scrollTop = history.scrollHeight
    }
    async function send ({ data }) {
      const {to, route} = data
      if(to === name){
        on[data.type](data)
        return
      }
      const channel = state.net[state.aka[route[0]]]
      data.route = data.route.slice(1)
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'send',
        data
      })
    }
    async function open_chat ({ data }){
      state.chat = {data: data.room, id: data.id}
      history.innerHTML = ''
      chatroom = []
      const temp_room = []
      const temp = JSON.parse(JSON.stringify(state.chat.data))
      const cache = [1]
      let min = 1
      let count = 0
      while(min !== Infinity && count < 10 ){
        let min_key
        min = Infinity
        for(entry of Object.entries(temp)){
          if(entry[1].length && entry[1][0].meta.date < min){
            min = entry[1][0].meta.date
            min_key = entry[0]
          }
        }
        min_key !== undefined && temp_room.push(min_key+'-'+temp[min_key].pop().head.mid)
        count++
      }
      temp_room.forEach(append_msg)
      const channel = state.net[state.aka.chat_input]
      channel.send({
        head: [id, channel.send.id, channel.mid++],
        type: 'activate_input',
        data: 'Type a message'
      })
      update_status(data)
    }
    async function append_msg (id){
      const element = document.createElement('div')
      element.classList.add('msg')
      element.id = id
      const id_split = id.split('-')
      const data = state.chat.data[id_split[0]][id_split[1]]
      if(id_split[0] === 'system'){
        element.classList.add('system')
        element.innerHTML = data.data
      }
      else{
        id_split[0] === '' && element.classList.add('right')
        element.innerHTML = `
          <div class='username'>
            ${state.id_map[id_split[0] ? id_split[0] : state.pk]}
          </div>
          <div class='content'>
          ${data.data}
          </div>`

        if(data.refs.cause){
          const cause_split = data.refs.cause.split('-')
          const cause_data = state.chat.data[cause_split[0]][cause_split[1]]
          const refs = document.createElement('div')
          refs.classList.add('refs')
          refs.innerHTML = `
            ${cause_data.data}`
          element.prepend(refs)
          refs.onclick = () => {
            const target = history.querySelector('#'+data.refs.cause)
            target.tabIndex = '0'
            target.focus()
            target.onblur = () => target.removeAttribute('tabindex')
          }
        }
      }
      history.append(element)
      history.scrollTop = history.scrollHeight
    }
    async function update_status (data) {
      const title = footer.querySelector('.title')
      title.innerHTML = data.name
      const input = footer.querySelector('.input')
      input.innerHTML = `Inputs: ${data.inputs ? data.inputs.length : '0'}`
      const output = footer.querySelector('.output')
      output.innerHTML = `Outputs: ${data.outputs ? data.outputs.length : '0'}`
      const task = footer.querySelector('.task')
      task.innerHTML = `Tasks: ${data.sub ? data.sub.length : '0'}`
    }
    async function render_msg ({ data }){
      const element = document.createElement('div')
      element.classList.add('msg')
      element.id = data.username+data.id

      if(data.username === 'system'){
        element.classList.add('system')
        element.innerHTML = data.content
      }
      else{
        data.username === state.pk && element.classList.add('right')
        element.innerHTML = `
          <div class='username'>
            ${state.id_map[data.username]}
          </div>
          <div class='content'>
          ${data.content}
          </div>`

        if(data.refs){
          const refs = document.createElement('div')
          refs.classList.add('refs')
          refs.innerHTML = `
            ${data.refs.data}`
          element.prepend(refs)
          refs.onclick = () => {
            data.refsname = data.refsname ? data.refsname : state.pk
            const target = history.querySelector('#'+data.refsname+data.refs.head.mid)
            target.tabIndex = '0'
            target.focus()
            target.onblur = () => target.removeAttribute('tabindex')
          }
        }
      }
      history.append(element)
      history.scrollTop = history.scrollHeight
    }
  }
  function get_theme () {
    return `
      * {
        box-sizing: border-box;
      }
      .main{
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100vh;
        width: 100%;
        color: white;
        background-color: black;
        border: 1px solid gray;
      }
      .container{
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        border: 1px solid gray;
      }
      .chat{
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        border-bottom: 1px solid gray;
        background-color: #212121;
      }
      .chat > .history{
        display: flex;
        flex-direction: column;
        min-height: 100%;
        overflow-y: scroll;
        max-height: 50px;
      }
      .chat .msg > .content{
        background-color: #555;
        padding: 10px;
        border-radius: 6px;
        width: fit-content;
        z-index: 1;
        position: relative;
      }
      .chat .msg{
        position: relative;
        margin: 10px;
      }
      .chat .msg > .refs{
        background-color: #555;
        padding: 10px;
        margin-bottom: -10px;
        padding-bottom: 20px;
        opacity: 0.5;
        border-radius: 6px;
        width: fit-content;
        cursor: pointer;
      }
      .chat .msg.right > div{
        margin-left: auto;
      }
      .chat .msg:focus{
        background-color: #33330f;
      }
      .chat .msg.system{
        margin: 0 auto;
        background: none;
      }
      .chat .msg:first-child{
        margin-top: auto;
      }
      .chat .msg .username{
        position: absolute;
        top: -16px;
        font-size: 14px;
      }
      .chat .msg.right .username{
        right: 2px;
      }
      .footer{
        display: flex;
        justify-content: space-around;
        width: 100%;
      }
    `
  }
  function use_protocol (petname) {
    return ({ protocol, state, on = { } }) => {
      if (petname in state.aka) throw new Error('petname already initialized')
      const { id } = state
      const invalid = on[''] || (message => console.error('invalid type', message))
      if (protocol) return handshake(protocol(Object.assign(listen, { id })))
      else return handshake
      // ----------------------------------------
      // @TODO: how to disjoin channel
      // ----------------------------------------
      function handshake (send) {
        state.aka[petname] = send.id
        const channel = state.net[send.id] = { petname, mid: 0, send, on }
        return protocol ? channel : Object.assign(listen, { id })
      }
      function listen (message) {
        const [from] = message.head
        const by = state.aka[petname]
        if (from !== by) return invalid(message) // @TODO: maybe forward
        console.log(`[${id}]:${petname}>`, message)
        const { on } = state.net[by]
        const action = on[message.type] || invalid
        action(message)
      }
    }
  }
}
}).call(this)}).call(this,require('_process'),"/src/taskmessenger.js")
},{"_process":1,"chat_input":2,"task_explorer":3}],6:[function(require,module,exports){
module.exports = [require, ana_data_vault]

async function ana_data_vault (node) {
  const { require, spawn, config } = node
  const tasks = {}

  console.log('ANA-DATA-VAULT:', config)


  document.body.style = 'margin: 0; height: 100vh; display: flex; flex-direction: column;'

  const el = document.createElement('div')
  el.style = `display: flex;
  flex-direction: column;
  background-color: gray;
  box-sizing: border-box;
  height: 100%;`
  el.innerHTML = `
  <div class="grid"></div>
  <div><h1 style="margin:0;">ana-data-vault</h1></div>`
  const [grid, menu] = el.children

  grid.style = 'box-sizing: border-box; background-color: #333; color: white; display: flex; flex-direction: column; flex-grow: 1;'
  document.body.append(el)


  Object.keys(config).map(name => {
    const app = Object.assign(document.createElement('div'), { id: name })
    const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 65%, 1)`
    const c = randomHsl()
    app.style = `box-sizing: border-box; padding: 2px; flex-grow: 1; background-color: ${c};`
    const shadow = app.attachShadow({ mode: 'closed' })
    shadow.append(spawn(name, config[name], port => {
      port.onmessage = onmessage
      tasks[name] = port
    }))
    function onmessage ({ data, ports: [port] }) {
      console.log(`%c[(vault)]%c[by ${name.toUpperCase()}] recv`, 'color:green;', 'color:white;', data, port)
      console.log('@TODO: set up interaction')
    }
    grid.append(app)
  })
}
},{}],7:[function(require,module,exports){
module.exports = [require, ana_js]

async function ana_js (node) { // ANA.js

  document.body.innerHTML = '<h1>ana-test</h1>'
  // document.body.innerHTML = localStorage.ana
  document.body.style = 'background: skyblue;'


  // const args_ana = [{ name: 'ana', pk: `6789ana`, sk: `9876oiuy` }]
  // const args_bob = [{ name: 'bob', pk: `1234bob`, sk: `4321fdsa` }]
  // void ANA_js({ args: args_ana  }) // ANA.js
  // .then(o => BOB_js({ args: args_bob.concat(o) })) // BOB.js
  const args_ana = [{ name: 'ana', pk: `6789ana`, sk: `9876oiuy` }]
  // --------------------------------------
  // SETUP
  const { io, db, state, require, config: args } = node
  // const TM = require('tm')
  const [opts] = args_ana || args
  // const tm = await TM(opts)
  db.on((book_id, data) => {
    console.log('from book', book_id, opts.name, 'received msg', data)
   })
  // CONNECT
  const on = { connect, on_rx, on_join }
  io.on(port => {
    console.log('[ANA:IO]:connecting', port)
    port.onmessage = ({ data: msg }) => on[msg.type](msg, port)
  })
  // --------------------------------------
  ana()
  return state.id
  function ana (c = 0) {
    console.log('%cHere: ', 'color: red;', window)
    const clearTimeout = window.clearTimeout
    const id = setInterval(() => {
      console.log('ana', localStorage.ana = c--)
    }, 1000)
    const B = document.createElement('button')
    B.onclick = () => clearTimeout(id)
    B.textContent = 'stop ana'
    document.body.append(B)
  }
  // --------------------------------------
  async function connect ({ head, data }, port) {
    state.net[head.from] = port
    state[`${state.id}-${head.from}`] = db({ name: `${state.id}-${head.from}` })
    state[`${head.from}-${state.id}`] = db({ name: `${head.from}-${state.id}`, key: data })
    state.net[head.from].postMessage({ head: {from: state.id, to: head.from}, type: 'connect', data: state[`${state.id}-${head.from}`].key })
    setTimeout(() => on_tx({ head: {from: state.id, to: head.from}, type: 'on_rx', data: 'Hello'}), 200)
  }
  async function on_rx ({ head, data }){
    const msg = await state[`${head.from}-${state.id}`].get(data)
    console.log('Log from ana: ', msg)
    print()
   }
  async function on_tx (msg){
    const { head } = msg
    state[`${state.id}-${head.to}`].add(msg)
  }
  async function on_join (id){
    tm.on_join(id)
  }
  function print () {
    const keys = Object.keys(localStorage);

    // Iterate over the keys and retrieve corresponding values
    const allLocalStorage = {};
    keys.forEach(key => {
      allLocalStorage[key] = JSON.parse(localStorage[key])
    });
    console.log(allLocalStorage)
  }
}
},{}],8:[function(require,module,exports){
module.exports = [require, bob_data_vault]

async function bob_data_vault (node) {
  const { require, spawn, config } = node
  const tasks = {}
  console.log('BOB-DATA-VAULT:', config)


  document.body.style = 'margin: 0; height: 100vh; display: flex; flex-direction: column;'


  const el = document.createElement('div')
  el.style = `display: flex;
  flex-direction: column;
  background-color: gray;
  box-sizing: border-box;
  height: 100%;`
  el.innerHTML = `
  <div class="grid"></div>
  <div><h1 style="margin:0;">ana-data-vault</h1></div>`
  const [grid, menu] = el.children

  grid.style = 'box-sizing: border-box; background-color: #333; color: white; display: flex; flex-direction: column; flex-grow: 1;'
  document.body.append(el)



  Object.keys(config).map(name => {
    const app = Object.assign(document.createElement('div'), { id: name })
    const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 65%, 1)`
    const c = randomHsl()
    app.style = `box-sizing: border-box; padding: 2px; flex-grow: 1; background-color: ${c};`
    const shadow = app.attachShadow({ mode: 'closed' })
    shadow.append(spawn(name, config[name], port => {
      port.onmessage = onmessage
      tasks[name] = port
    }))
    function onmessage ({ data, ports: [port] }) {
      console.log(`%c[(vault)]%c[by ${name.toUpperCase()}] recv`, 'color:green;', 'color:white;', data, port)
      console.log('@TODO: set up interaction')
    }
    grid.append(app)
  })
}
},{}],9:[function(require,module,exports){
module.exports = [require, bob_js]

async function bob_js (node) { // BOB.js
  document.body.innerHTML = '<h1>bob-test</h1>'
  document.body.style = 'background: pink;'
  // document.body.innerHTML = localStorage.bob


  // const args_ana = [{ name: 'ana', pk: `6789ana`, sk: `9876oiuy` }]
  // const args_bob = [{ name: 'bob', pk: `1234bob`, sk: `4321fdsa` }]
  // void ANA_js({ args: args_ana  }) // ANA.js
  // .then(o => BOB_js({ args: args_bob.concat(o) })) // BOB.js
  const args_ana = [{ name: 'ana', pk: `6789ana`, sk: `9876oiuy` }]
  const ana_id = args_ana[0].pk
  const args_bob = [{ name: 'bob', pk: `1234bob`, sk: `4321fdsa` }]
  // --------------------------------------
  // SETUP
  const { io, db, state, config: args } = node
  // const TM = require('tm')
  const [opts, peer_id = ana_id] = args_bob || args
  // const tm = await TM(db)
  db.on((book_id, data) => {
    console.log('from book', book_id, opts.name, 'received msg', data)
   })
  // CONNECT
  const on = { on_rx, connect }
  io.on(port => {
    console.log('[BOB:IO]:connecting', port)
    port.onmessage = ({ data: msg }) => on[msg.type](msg)
    state.net[peer_id] = port
  })
  await io.at(peer_id)
  state[`${state.id}-${peer_id}`] = db({ name: `${state.id}-${peer_id}` })
  state.net[peer_id].postMessage({ head: {from: state.id, to: peer_id}, type: 'connect', data: state[`${state.id}-${peer_id}`].key })
  // create_task({ title: 'task1', parent: '' })
  // on_tx({ head: {from: state.id, to: peer_id}, type: 'on_join', data: state.tasks['0'] })
  // --------------------------------------

  bob()
  return
  function bob (c = 999) {
    const clearTimeout = window.clearTimeout
    const id = setInterval(() => {
      console.log('bob', localStorage.bob = c--)
    }, 1000)
    const B = document.createElement('button')
    B.onclick = () => clearTimeout(id)
    B.textContent = 'stop bob'
    document.body.append(B)
  }
  // --------------------------------------
  async function connect ({ head, data }, port) {
    state.net[head.from] = port
    state[`${head.from}-${state.id}`] = db({ name: `${head.from}-${state.id}`, key: data })
    on_tx({ head: {from: state.id, to: peer_id}, type: 'on_rx', data: 'Hi' })
  }
  async function on_rx ({ head, data }){
    state[`${head.from}-${state.id}`] = db.reader(`${head.from}-${state.id}`, head.from)
    const msg = await state[`${head.from}-${state.id}`].get(data)
    console.log('Log from bob: ', msg)
    }
  async function on_tx (msg){
    const { head } = msg
    state[`${state.id}-${head.to}`].add(msg)
  }
  async function create_task (msg){
    const {index, task_id} = await tm.on_create(msg)
    state.tasks[task_id] = index
  }
}
},{}],10:[function(require,module,exports){
;(function dat_container_runtime () { // [initial version: 2024.05.18]
  document.head.replaceChildren()
  // ----------------------------------------------------------------------------
  module.exports = shim
  // ----------------------------------------------------------------------------
  async function shim (REGISTRY, PROGRAMS) { // v2024.05.27
    validize_args(REGISTRY, PROGRAMS)
    const run = window !== top ? container : dbio
    run(REGISTRY, PROGRAMS)
  }
  // ----------------------------------------------------------------------------
  function validize_args (REGISTRY = {}, PROGRAMS = {}) { // v2024.05.27
    // @TODO: upgrade later to proper persistent registry
    Object.assign(REGISTRY, { '': [() => {}, internal_vault] }, REGISTRY)
    const stack = [{ path: [], level: PROGRAMS }]
    while (stack.length) {
      const { path, level } = stack.pop()
      if (!level['']) level[''] = ''
      const keys = Object.keys(level)
      for (var i = keys.length; i--;) {
        const k = keys[i]
        path.push(k)
        const v = level[k]
        if (typeof v === 'string') {
          const M = REGISTRY[v]
          if (!Array.isArray(M)) throw new Error(`module "${v}" is undefined`)
          const [require, exports] = M
          if (typeof require !== 'function') throw new Error(`module "${v}" at "${path}" is ill defined`)
          if (typeof exports !== 'function') throw new Error(`module "${v}" at "${path}" is ill defined`)
        } else {
          if (v !== Object(v)) throw new Error(`PROGRAMS is ill defined in "${path}"`)
          stack.push({ path: [...path], level: v })
        }
        path.pop()
      }
    }
  }
  // ----------------------------------------------------------------------------
  async function container (REGISTRY, PROGRAMS) { // v2024.05.30
    // launched from BOOTLOADER
    const fragment = location.hash.slice(1)


    const command = cmd_codec.decode(fragment) // @TODO: what if fragment is only a single string?

    if ('' in command) {
      const vault_app = command['']
      const label = vault_app || '(vault)'
      alert(`%c[${label.toUpperCase()}]`, 'color: skyblue;', 'run')
      delete command['']
      const [require, launch] = REGISTRY[vault_app]
      const port = window.port
      delete window.port
      port.onmessage = onmessage
      window.node.require = use.bind(require)
      window.node.config = command
      window.name = `${label}`
      window.node.name = referrer
      const vault_window = {
        JSON: window.JSON,
        Object: window.Object,
        document: window.document,
        console: { log: console.log.bind(console) },
        cmd_codec,
        location: { hash: `#${cmd_codec.encode(command)}` },
        node,
        Error,
        Math,
        setInterval,
      }
      vault_window.window = vault_window
      const api = node.box(`(${launch})(window.node)`, vault_window)
      console.log(label, { api })
      return api
    } else {
      const command = fragment
      const [require, launch] = REGISTRY[command]

      const label = fragment
      const port = window.port
      delete window.port
      port.onmessage = onmessage
      window.node.require = use.bind(require)
      window.node.config = command
      window.name = `${label}`
      const app_window = {
        JSON: window.JSON,
        Object: window.Object,
        document: window.document,
        console: { log: console.log.bind(console) },
        cmd_codec,
        location: { hash: `#${cmd_codec.encode(command)}` },
        node,
        Error,
        Math,
        setInterval,
        clearTimeout,
        localStorage
        // iframer,
      }
      app_window.window = app_window
      const api = node.box(`(${launch})(window.node)`, app_window)
      console.log(label, { api })
      function onmessage (event) {
        alert(`%c[${fragment.toUpperCase()}]`, 'color: green;', '[from vault]', evemt)
        const { type } = event.data || {}
        if (!api[type]) console.error('ERROR:', window.name, 'does not support', type)
      }

    }
    function use (name) {
      const require = this
      console.log('[require]', name)
      const [subrequire, launch] = require(name)
      return launch({ require: use.bind(subrequire) })
    }
    function onmessage (event) {
      alert(`%c[${program.toUpperCase()}]`, 'color: skyblue;', '[from bootloader]', evemt)
      const { type } = event.data || {}
      if (!api[type]) console.error('ERROR:', window.name, 'does not support', type)
    }
  }
  // demo(taskmessenger(ana,bob),devenv(ana,bob))
  // ----------------------------------------------------------------------------
  async function dbio (REGISTRY, PROGRAMS) { // v2024.05.27
    const daturn_armed_turtle_shell = `🪐🚀<span style="transform: scale(-1, 1);">🐢</span>`
    const info = `dbio shim: [v0.0.1-pre-alpha-rc.1] ${daturn_armed_turtle_shell} dat(a container runtime)`
    const on = {}
    const txt = Object.assign(document.createElement('div'), { innerHTML: info} ).textContent
    console.log(`%c${txt}`, 'color: gray;')
    window.name = '(dbio)'
    window.fetch = window.fetch.bind(window)
    window.addEventListener = window.addEventListener.bind(window)
    window.removeEventListener = window.removeEventListener.bind(window)
    // -----------------
    window.spawn = spawn
    window.tasks = {}
    window.counter = 0
    window.validize_args = validize_args
    window.cmd_codec = { encode, decode }
    // const location = window.location
    // window.location = new Proxy({}, {
    //   get (o, k) { return o[k] },
    //   set (o, k, v) {
    //     console.log({k, o, loc: location[k]})
    //     if (k === 'hash') try { return o[k] = location[k] = v} finally { on.hashchange(new HashChangeEvent('hashchange')) }
    //     else return o[k] = location[k] = v
    //   },
    // }),
    const vault = document.createElement('div')
    document.body.append(vault)
    vault.style = 'flex-grow: 1;'
    const kernel = Object.assign(document.createElement('div'), {
      innerHTML: info,
      style: `line-height: 14px; display: flex; align-items: center;
      justify-content: center; font-size: 9px; font-weight: 900;`
    })
    document.body.append(kernel)
    window.shadow = vault.attachShadow({ mode: 'closed' })
    Object.defineProperty(window, 'onhashchange',  {
      get () { return on.hashchange },
      set (v) { return on.hashchange = v }
    })
    const source = `return (Reg, Ps) => (${dbio_loader})(Reg, Ps)`
    const F = await box(source, window)
    await F(REGISTRY, PROGRAMS)
  }
  // ----------------------------------------------------------------------------
  async function dbio_loader (REGISTRY, PROGRAMS) { // v2024.05.27
    const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 25%, 1)`
    // const c = randomHsl()
    const c = `hsla(133, 57%, 45%, 1);`
    document.body.style = `box-sizing: border-box; margin: 0;
    display: flex; flex-direction: column; height: 100vh;
    background-color: ${c}; color: white; font-family: Courier New; padding: 0px;`
    document.title = `[🪐] `
    const { href, hash } = new URL(document.currentScript.src)
    // @TODO: use # everything for now -> but later history push state to adjust query too
    // const default_commands = cmd_codec.decode(hash.slice(1)) // @TODO: use url params
    const default_programs = cmd_codec.encode(PROGRAMS)
    const bundle = await (await fetch(href)).text()
    window.__temp__ = { bundle }
    // @TODO: verify all params if they exist, otherwise start only default vault and show recover options
    oncommand()
    function oncommand (event) {
      localStorage.clear()
      // @TODO: use # everything for now -> but later history push state to adjust query too
      const fragment = decodeURIComponent(location.hash.slice(1))
      const hash = !event ? fragment || localStorage.autostart : fragment
      const cmds = Object.assign({ '': '' }, cmd_codec.decode(hash || default_programs))
      if (!(cmds[''] in PROGRAMS)) {
        console.error(`"${vault}" not found.`)
        cmds[''] = ''
      }
      window.onhashchange = undefined
      const programs = cmd_codec.encode(cmds)
      location.hash = localStorage.autostart = programs
      window.onhashchange = oncommand
      console.log('%c[DBIO]', 'color:green;', event ? 'reboot' : 'boot', cmds)
      const [vault, ...tools] = Object.keys(cmds).map(x => x || '(vault)')
      document.title = `[🪐] ` + vault + ' : ' + tools
      const id = counter++
      // @INFO: build task (=iframe task) (= itask)
      shadow.append(spawn(cmds[''] || '(root)', cmds, port => {
        port.onmessage = onmessage
        tasks[id] = port
      }))
      function onmessage ({ data, ports: [port] }) {
        console.log(`%c[DBIO]%c[by root] recv`, 'color:green;', 'color:white;', data, port)
        console.log('@TODO: set up sys api for program to interact with')
      }
    }
  }
  // ----------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  function box (source, sdk = {}) { // v2024.05.22
    const name = sdk.name || '(anon)' // @TODO: increase counter maybe
    if (typeof source === 'function') source = `return (${source})()`
    Object.assign(sdk, { globalThis: sdk })
    sdk.require = null // @TODO: fix this
    sdk.top = null // @TODO: fix this
    const global = new Proxy(sdk, {
      get (sdk, k) {
        if (typeof k === 'string' && !(k in sdk)) throw new Error(`Uncaught ReferenceError: ${k} is not defined`)
        return sdk[k] === sdk ? global : sdk[k]
      },
      put (sdk, k, v) { return sdk[k] = v === sdk ? global : v },
      has () { return true },
      deleteProperty (sdk, k) { return delete sdk[k] },
      ownKeys(sdk) { return Object.keys(sdk) },
      isExtensible (sdk) { return Object.isExtensible(sdk) },
      setPrototypeOf (sdk, p) { return Reflect.setPrototypeOf(sdk, p) },
      getPrototypeOf (sdk) { return Reflect.getPrototypeOf(sdk) },
      // apply (sdk, self, args) { return Reflect.apply(sdk, sefl, args) },
      // construct (sdk, args, o) { return Reflect.construct(sdk, args, o) },
      defineProperty (sdk, k, descriptor) {
        Object.defineProperty(sdk, k, descriptor)
        return global
      },
      getOwnPropertyDescriptor (sdk, k) {
        return Object.getOwnPropertyDescriptor(sdk, k)
      },
      preventExtension (sdk) {
        Object.preventExtensions(sdk)
        return true
      },
    })
    const run = new Function('global', `//# sourceURL=${name}
    with (global) return (function () { "use strict";\n${source};\n})()`)
    return run(global)
  }
  // ----------------------------------------------------------------------------
  function encode (o) { // v2024.05.29
    o = Object.assign({}, o)
    Object.keys(o).map(k => { try { o[k] = JSON.stringify(o[k]) } catch (e) { } })
    const s = decodeURIComponent(new URLSearchParams(o).toString())
    return s
  }
  // ----------------------------------------------------------------------------
  function decode (s) { // v2024.05.29
    const o = Object.fromEntries(new URLSearchParams(s).entries())
    Object.keys(o).map(k => { try { o[k] = JSON.parse(o[k]) } catch (e) { } })
    return o
  }
  // ----------------------------------------------------------------------------
  // function add_deps (f, ...deps) { // v2024.05.26
  //   const bundle = `${f}`.slice(0, -1) + `${deps.map(dep => `${dep}\n`)}}`
  //   return bundle
  // }
  // ----------------------------------------------------------------------------
  function recover () { // v2024.05.27
    // window.onerror = recover // ???
    // @TODO: allow to reset location.hash and localStorage.autostart to defaults
    // @TODO: show meaningful error and maybe support chat buttons to get help
  }
  // ----------------------------------------------------------------------------
  // ----------------------------------------------------------------------------
  function spawn /* i-task */ (name, opts = {}, listen) { // v2024.05.30
    if (typeof opts === 'function') [opts, listen] = [{}, opts]
    return iframer(connect)
    // @TODO: spawn should auto append to an element in sys_sdk.document.body
    // -> which is empty, because instead it is fullscreen populated by noscript iframe
    function connect (iwindow) { // -> datauri bootloader iframe
      const filepath = name
      const { bundle } = window.__temp__
      const source = JSON.stringify(bundle)
      const program = cmd_codec.encode(opts)
      const loader = web_loader
      // -----------------------
      const myspawn = `${spawn}`.slice(0, -1) + `${web_loader}\n${BOOTLOADER}\n${box}\n}`
      const myloader = `${loader}`.slice(0, -1) + `${cmd_codec.decode}\n${cmd_codec.encode}\n}`
      const iframe_bootloader = `//# sourceURL=${filepath}\n//# ignoreList=${filepath}\n
      (${BOOTLOADER})((p => (event = void 0, p))(event.ports[0]),
      "${name}", ${JSON.stringify(opts)},
      ${myspawn}, ${box}, ${source}, '${program}', ${myloader}, ${cmd_codec.decode}, ${cmd_codec.encode}, ${iframer})`
      const { port1, port2 } = new MessageChannel()
      iwindow.postMessage(iframe_bootloader, '*', [port1])
      listen(port2)
      // -----------------------
    }
  }
  // ----------------------------------------------------------------------------
  function web_loader () { // v2024.05.23
    // e.g. for VAULT
    const cmd_codec = { encode, decode }
    if (window.name !== web_loader.name) throw new Error('web loader error')
    const { opts: command } = __temp__

    const vault_name = command[''] || '(vault)'

    // @TODO: what if command is only a single string?
    const fragment = typeof command === 'string' ? command : cmd_codec.encode(command)



    const name = vault_name
    console.log('%c[WEBLOADER]', 'color:green;', 'load', name, command)
    const on =  {}
    const app_sdk = make_app_sdk(window.iwindow)
    return app_sdk
    function make_app_sdk (window) {
      const {
        Promise, setTimeout, clearTimeout, document, console, Object,
        Blob, URL, Array, JSON, Math, setInterval
      } = window
      const si = (...args) => setInterval(...args)
      const sdk = { // @TODO: make this a true membrane!
        node: {},
        name: '(sudo)', // web_loader? // loader:web
        Promise,
        setTimeout,
        clearTimeout,
        document,
        console,
        Object,
        Blob,
        JSON,
        URL,
        Array,
        Math,
        setInterval: si,
        alert: console.log.bind(console),
        location: new Proxy({ hash: `#${fragment}` }, {
          get (o, k) { return o[k] },
          set (o, k, v) {
            try { return o[k] = v = `#${v}` } finally { on.hashchange?.(v) }
          },
        }),
        localStorage: { autostart: fragment },
      }
      Object.defineProperty(document, 'title',  {
        get () { return document.title },
        set (v) { return document.title = v }
      })
      Object.defineProperty(sdk, 'onhashchange',  {
        get () { return on.hashchange },
        set (v) { return on.hashchange = v }
      })
      sdk.window = sdk.globalThis = sdk
      return sdk
    }
  }
  // ----------------------------------------------------------------------------
  async function BOOTLOADER (port0, name, opts, spawn, box, bundle, program, loader, decode, encode, iframer) {  // v2024.05.30
    const cmd_codec = { encode, decode }
    console.log('%c[BOOTLOADER]', 'color:green;', 'loader:', loader.name, 'program:', name, opts)

    port0.onmessage = root_receive
    const { port1, port2 } = new MessageChannel()
    port1.onmessage = prog_receive

    // console.log('CHOOSE:', {name, opts}) // (root) // opts
    const args = (typeof opts === 'string') ? {} : opts



    const loader_sdk = await (('' in args) ? make_vault_sdk(window) : make_sys_sdk(window))
    // const loader_sdk = await make_sys_sdk(window)
    loader_sdk.port = port0
    loader_sdk.iframer = iframer
    loader_sdk.__temp__ = { bundle, opts }
    loader_sdk.cmd_codec = cmd_codec
    loader_sdk.name = loader.name
    loader_sdk.referrer = name

    // const require = ((registry, modules = {}) => function require (name) {
    //   if (modules[name]) return modules[name].exports
    //   if (registry[name]) {
    //     const exports = {}
    //     const module = { exports }
    //     registry[name](exports, module, require)
    //     return (modules[name] = module).exports
    //   }
    //   throw new Error(`module "${name}" not found`)
    // })(MODULES)

    // @TODO: persist and make keys deterministic
    const pk = `${Math.random()}`.slice(2)
    const sk = `${Math.random()}`.slice(2)
    /**************************************************************************
      vault.js
    **************************************************************************/
    const IO = IO_js()
    const DB = DB_js()
    const state = { name, pk, sk, net: {}, tasks: {} }
    state.seed = pk + sk
    state.id = pk
    const io = IO(name, state.seed)
    const db = DB(state.seed)
    // const book = db.author(seed)
    // const version = (await book.len() || await book.add({ name, status: {}, net: {}, aka: {} })) - 1
    const node = { io, db, state, box, spawn }
    // -----------------------------------


    const app_sdk = box(loader, safeguard(loader_sdk)) // creates window.node
    // populates window.node:
    app_sdk.node = node
    app_sdk.port = port2
    app_sdk.Error = Error
    app_sdk.cmd_codec = cmd_codec
    app_sdk.referrer = name

    // inside new iframe, BOOTLOADER box -> run bundle again to load "vault"
    const app_api = box(bundle, safeguard(app_sdk))



    // @TODO: maybe use `app_api`
    return
    function prog_receive (event) {
      console.log('%c[BOOTLOADER]', 'color:green;', `[from ${name}]`, event)
      port0.postMessage(event.data)
    }
    function root_receive (event) {
      console.log('%c[BOOTLOADER]', 'color:green;', '[from dbio]', event)
      const message = event.data
      const { type = '', data = [] } = message || {}
      port1.postMessage(message)
      if (app_api[type]) app_api(...data)
    }
    function safeguard (window) {
      // @TODO: secure window object
      // @TODO: try to re-use safemode()
      // console.error('@TODO: safeguard noscript document')
      // @TODO: safeguard: access through DOM of iframe realms:
      // -> Object, Object.prototype, Function, Function.prototype, Error, Error.prototype
      // possibly others
      // ==> scuttle and lock down iframe as well and replace with inert where possible
      return window
    }
    async function make_vault_sdk (window) {
      // @TODO: window.name = loader.name
      // @TODO: iwindow.name = app_name => name
      window.name = name
      window.iwindow = window
      return window
    }
    async function make_sys_sdk (window) { // -> sandboxed noscript iframe
      const el = iframer('allow-same-origin allow-scripts', iwindow => {
        iwindow.name = name // e.g. 'taskchat'
        window.iwindow = iwindow
        window.name = loader.name
        resolve(window)
      })
      document.body.append(el)
      document.body.style = `display: flex; margin: 0; height: 100vh;`
      const { resolve, promise } = Promise.withResolvers()
      return promise
    }
    /**************************************************************************
      IO.js
    **************************************************************************/
    function IO_js () { // IO.js
      const taken = {}
      // @TODO: main issue is that port0 and maybe other ports have to be used
      // to communicate across iframe (=process) boundaries
      return IO
      function IO (alias, seed) {
        if (taken[seed]) throw new Error(`seed "${seed}" already taken`)
        const pk = seed.slice(0, seed.length / 2)
        const sk = seed.slice(seed.length / 2, seed.length)
        const self = taken[pk] = { id: pk, peer: {} }
        const io = { at, on }
        return io
        async function at (id, signal = AbortSignal.timeout(1000)) {
          if (id === pk) throw new Error('cannot connect to loopback address')
          if (!self.online) throw new Error('network must be online')
          const peer = taken[id] || {}
          // if (self.peer[id] && peer.peer[pk]) {
          //   self.peer[id].close() || delete self.peer[id]
          //   peer.peer[pk].close() || delete peer.peer[pk]
          //   return console.log('disconnect')
          // }
          if (!peer.online) return wait() // peer with id is offline or doesnt exist
          connect()
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
            port2.to = port1.by = pk
            self.online(self.peer[id] = port1)
            peer.online(peer.peer[pk] = port2)
          }
        }
        function on (online) {
          if (!online) return self.online = null
          const resolve = self.online?.resolve
          self.online = online
          if (resolve) resolve(online)
        }
      }
    }
    /**************************************************************************
      DB.js
    **************************************************************************/
    function DB_js () { // DB.js
      const localStorage = {}
      // @TODO: main issue is, that `port0` has to be used to communicate
      // -> with root document to actually persist any data
      const cache = { }
      const admin = { reset, on: null }
      DB.admin = admin
      return DB
      function reset () { localStorage.clear() }
      function DB (seed, hook) {
        if (!seed || typeof seed !== 'string') throw new Error('no seed provided')
        DB.admin = undefined
        const pk = seed.slice(0, seed.length / 2)
        const sk = seed.slice(seed.length / 2, seed.length)
        if (cache[pk]) throw new Error(`seed "${seed}" already in use`)
        const db = open(pk) || save(cache[pk] = { // internal audit book
          pk, sk, books: {}, names: {}, pages: [], state: {}, peers: []
        })
        db.pages.push({ type: 'load' })
        make.on = on
        return make
        function on (debug) { hook = debug }
        function make ({ name, key } = {}, _on) {
          const book = load({ name, key })
          key = book.pk
          const own = db.books[book.pk]
          const api = own ? { key, add, get, version, on } : { key, get, version, on }
          return book && api
          async function add (x) {
            const { length: i } = book.pages
            if (admin?.on?.(x, i, key, pk)) return
            if (hook?.(key, x, i)) return
            book.pages[i] = x
            save(book)
            book.peers.forEach(notify_reader)
            return i
            function notify_reader (port) {
              if (typeof port === 'function') port([x, i, key])
              else port.postMessage([x, i, key])
            }
          }
          async function get (i) { return book.pages[i] } // opts = { wait: false }
          async function version () { return book.pages.length - 1 }
          async function on (name, fn) {
            if (!fn) [name, fn] = ['add', name]
            if (typeof fn === 'function' || fn.postMessage) book.peers.push(fn)
            throw new Error('`fn` must be a function')
          }
        }
        function save (book) {
          localStorage[book.pk] = JSON.stringify(Object.assign({}, book, { peers: [] }))
          return book
        }
        function open (key) {
          // return cache[key] ||= JSON.parse(localStorage[key] || null)
          return cache[key] || (cache[key] = JSON.parse(localStorage[key] || null))
        }
        function load ({ name, key }) {
          if (sk === key || pk === key) throw new Error(`unauthorized access`)
          if (key) {
            const book = open(key)
            if (book && name) {
              if (!db.names[name]) (db.names[name] = key)
              else if (db.names[name] !== key) throw new Error(`name "${name}" is in use`)
            }
            return book
          } else if (name) {
            key = db.names[name]
            return key ? open(key) : init({name})
          } else throw new Error('must provide `name` and/or `key` to load book')
        }
        function init (name) {
          const [pk, sk] = [2, 2].map(x => `${Math.random()}`.slice(x))
          const book = save(cache[pk] = { pk, sk, pages: [], state: {}, peers: [] })
          db.names[name] = pk
          db.books[pk] = sk
          save(db)
          return book
        }
      }
    }
    /*************************************************************************/
  }
  // ----------------------------------------------------------------------------
  function iframer (sandbox, done) { // v2024.05.30
    if (typeof sandbox === 'function') [sandbox, done] = ['', sandbox]
    const iframe = document.createElement('iframe')
    new Promise(f => iframe.onload = _ => f(iframe.contentWindow)).then(done)
    if (!sandbox) { // 1. datauri bootloader iframe
      const id = Math.random() // @TODO: use a id/counter from parent frame location.href?
      const T = 'script'
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>${''
      }<body><${T}>document.currentScript.remove();onmessage=E=>eval(E.data)${''
      }//${id}</${T}></body></html>`
      const bytes = new TextEncoder().encode(html)
      const b64 = btoa(Array.from(bytes, b => String.fromCodePoint(b)).join(""))
      iframe.src = 'data:text/html;base64,' + b64 // data uri
      // const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 65%, 1)`
      // const c = randomHsl()
      // iframe.style = `border: 1; width: 100%; height: 100%; display: grid;
      // box-sizing: border-box; background-color: ${c};`

      iframe.style = `border: 2px solid red; width: 100%;
      height: 100%;
      display: grid;
      box-sizing: border-box;`
      const el = document.createElement('div')
      el.style = `height: 100%;
      box-sizing: border-box;
      padding: 2px;
      background-color: #333;`
      const sh = el.attachShadow({ mode: 'closed' })
      sh.append(iframe)
      return el
    } else { // 2. sandboxed noscript iframe
      iframe.srcdoc = `<!DOCTYPE html>
      <html><head><meta charset="utf-8"></head><body></body></html>`
      iframe.sandbox = sandbox
      iframe.style = 'border: 0; margin: 0; padding: 0;  display: flex; flex-grow: 1'
      return iframe
    }
  }
  // ----------------------------------------------------------------------------
  async function internal_vault (node) { // v2024.05.30
    document.documentElement.style = `height: 100%; margin: 0; box-sizing: border-box;`
    document.body.style = `display: flex;
    flex-direction: column;
    flex-grow: 1;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    padding: 0;`

    const tasks = {}
    const fragment = location.hash.slice(1)
    const command = cmd_codec.decode(fragment)
    const { config, spawn } = node

    if (JSON.stringify(config) !== JSON.stringify(command)) throw new Error('wat?')

    const icon_play = '▶️'
    const icon_stop = '⏹'
    const state = { program: {} }

    const el = document.createElement('div')
    el.style = `display: flex;
    flex-direction: column;
    background-color: gray;
    box-sizing: border-box;
    height: 100%;`
    // 🛡️
    el.innerHTML = `
    <div class="grid"></div>
    <div><label>🐢 ${node.name} </label><span> ${
      Object.keys(command).map(name => {
      state.program[name] = 'idle'
      return `<button data-name="${name}"><span>${icon_play}</span>${name}</button>`
    }).join('')
    }</span></div>`
    const [grid, menu] = el.children
    menu.style = `background-color: gray`
    grid.style = `display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    padding: 5px;
    flex-grow: 1;
    background-color: darkgray;`
    const items = [...el.querySelectorAll('button')]
    items.forEach(btn => btn.onclick = (navigate({
      preventDefault: () => {}, currentTarget: btn
    }), navigate))
    document.body.replaceChildren(el)
    function navigate (event) {
      event.preventDefault()
      const btn = event.currentTarget
      const { name } = btn.dataset
      const [icon] = btn.children
      const is_idle = state.program[name] === 'idle'
      icon.textContent = is_idle ? icon_stop : icon_play
      state.program[name] = is_idle ? 'busy' : 'idle'
      if (!is_idle) {
        state.program[name] = 'idle'
        grid.querySelector(`#${name}`).remove()
        return
      }
      const app = Object.assign(document.createElement('div'), { id: name })
      const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 65%, 1)`
      const c = randomHsl()
      app.style = `box-sizing: border-box; padding: 2px; flex-grow: 1; background-color: ${c};`
      // setInterval(() => { app.style.backgroundColor = randomHsl() }, 50);
      const shadow = app.attachShadow({ mode: 'closed' })
      shadow.append(spawn(name, command[name], port => {
        port.onmessage = onmessage
        tasks[name] = port
      }))
      function onmessage ({ data, ports: [port] }) {
        console.log(`%c[(vault)]%c[by ${name.toUpperCase()}] recv`, 'color:green;', 'color:white;', data, port)
        console.log('@TODO: set up interaction')
      }
      grid.append(app)
    }
  }
  // ----------------------------------------------------------------------------
})()
},{}],11:[function(require,module,exports){
module.exports = [require, file]

async function file (node) {
  const { require, spawn, config } = node
  const tasks = {}

  document.body.style = 'margin: 0; height: 100vh; display: flex; flex-direction: column;'
  const el = document.createElement('div')
  el.style = `display: flex;
  flex-direction: column;
  background-color: gray;
  box-sizing: border-box;
  height: 100%;`
  el.innerHTML = `
  <div class="grid"></div>
  <div><h1> devtools vault </h1></div>`
  const [grid, menu] = el.children

  grid.style = 'flex-wrap: wrap; box-sizing: border-box; background-color: #333; color: white; flex-grow:1; display: flex;'
  document.body.append(el)

  Object.keys(config).map(name => {
    const app = Object.assign(document.createElement('div'), { id: name })
    const randomHsl = () => `hsla(${Math.random() * 360}, 100%, 65%, 1)`
    const c = randomHsl()
    app.style = `box-sizing: border-box; padding: 2px; flex-grow: 1; background-color: ${c};`
    const shadow = app.attachShadow({ mode: 'closed' })
    shadow.append(spawn(name, config[name], port => {
      port.onmessage = onmessage
      tasks[name] = port
    }))
    function onmessage ({ data, ports: [port] }) {
      console.log(`%c[(vault)]%c[by ${name.toUpperCase()}] recv`, 'color:green;', 'color:white;', data, port)
      console.log('@TODO: set up interaction')
    }
    grid.append(app)
  })
  // const ana = require('ana-test.js')
  // const bob = require('bob-test.js')
  // ;[`${bob}`, `${ana}`].map(ctrls)
  // console.log('%cHere: ', 'color: red;', ana, bob)
  // ana()
  // bob()
  return // console.log({ana, bob})
  async function ctrls (src, i) {
    const el = document.createElement('div')
    // div.append(el)
    const style = `border: 0; width: 30vw; height: 30vh; display: flex; background-color: ${i ? 'gray' : 'brown'};`
    const { port } = await spawn(el, `${src}`, style)


    // @TODO: make spawn append to real DOM, but don't expose element
    // -> or maybe do expose it, but only iframes, but that means here they could append other elements, including script tags and stuff
    // --> that is bad

    const txt = document.createTextNode('')
    const btn = document.createElement('button')
    boot()
    document.body.prepend(btn)
    tasks[i] = port
    function boot () {
      btn.onclick = stop
      btn.textContent = `stop peer ${i}`
      txt.replaceWith(el)
    }
    function stop () {
      btn.onclick = boot
      btn.textContent = `boot peer ${i}`
      el.replaceWith(txt)
    }
  }
}
},{}],12:[function(require,module,exports){
// 1. all available modules
const REGISTRY = {
  'ana-data-vault': require('ana-data-vault'),
  'taskmessenger': require('..'),
  'bob-data-vault': require('bob-data-vault'),
  'devtools-vault': require('devtools-vault'),
  'ana-test': require('ana-test'),
  'bob-test': require('bob-test')
}
// 2. where to launch which module
const PROGRAMS = {
  // 1. root vault should see and have power to override anything
  // 2. sub vault should see and have power to override anything sub
  // 3. but root vault shoul still be able to override what sub sees and change it later as well?

  // '': '?a=b?c=d?e=f',

  // that's an OVERRIDE!

  "demo": {
    "tm": {
      "ana": {
        // '?': '..',
        '': 'ana-data-vault',
        "taskchat": 'taskmessenger',
      },
      "bob": {
        '': 'bob-data-vault',
        "taskchat": 'taskmessenger',
      }
    },
    "devenv": {
      '': 'devtools-vault',
      "ana": {
        "test-db-io": 'ana-test',
      },
      "bob": {
        "test-db-io": 'bob-test',
      },
    },
  },
}
// 3. start
require('dbio')(REGISTRY, PROGRAMS)

// @TODOs:
// 1. at first to enable the connectivity you need to continue with your work
// 2. second, to slowly refactor the code base and get rid
//    of browserify/budo and the "bundle step"
//    (which is a bit of a tough one)
// 3. to factor out the runtime code and remove it from the "task-messenger" repository

/* STORY:
1. shim loads to define REGISTRY and PROGRAMS (validated + sanitized)
2. dbio -> dbio_loader runs:
    1. has PROGRAMS
    2. gets default args from currentScript
    3. sees user # params as well
    4. can access localStorage.autostart too
3. dbio_loader spawns: IFRAME(bundle_source)     +   ???
4. container runs:
  1. has PROGRAMS
  -> needs bundle.js#args  : === PROGRAMS
  -> needs user_args       : ???
  -> needs localStorage    : ???
5. scenarios:
  - PROGRAMS is currently used instead of bundle.js#args
  - user_args overwrite autostart overwrites DEFAULTS (PROGRAMS or bundle.js#args)
  - localStorage.autostart = user_args || DEFAULTS
  - any change updates user_args (location.hash), but also autostart
6. so container needs access to:
  - DEFAULTS: ok
  - [ ] but ideally through bundle.js#args
  - [ ] user_args via `location.hash`, but "update" needs to reflect in real browser bar
  - [ ] localStorage.autostart to read and store changes to -> needs to reflect in root browser window
  -
*/
// @TODO: spawn should auto append to an element in sys_sdk.document.body
// -> which is empty, because instead it is fullscreen populated by noscript iframe
},{"..":5,"ana-data-vault":6,"ana-test":7,"bob-data-vault":8,"bob-test":9,"dbio":10,"devtools-vault":11}]},{},[12]);

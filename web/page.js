const foo = require('foo')
console.log('PAGE', foo)
document.title = 'ds'
var count = 0
addEventListener("keydown", (event) => {
  clearTimeout(tid)
  const o = {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    count: count++
  }
  console.log(o)
  document.body.innerHTML = `<h1> BIOS </h1><pre>${JSON.stringify(o)}</pre>`
})
document.body.style = 'background-color: black; color: lime; display: flex; font-family: mono; flex-direction: column; justify-content: center; align-items: center;'
document.body.innerHTML =`<h1>BOOT</h1><h2> press <pre>ctrl+meta+alt</pre> to enter bios </h2>`
const tid = setTimeout(() => console.log((document.body.replaceChildren(), 'done')), 1000)

// @TODO: merge with /home/serapath/Desktop/DEV/DATA/code/#work/ ...stuff as a demo project

/*

*/

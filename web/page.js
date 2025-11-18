const foo = require('./foo.js')
console.log('PAGE')
document.body.innerHTML = `<h1> PAGE </h1>`
alert('PAGE')
// @TODO: merge with C#work/ ...stuff as a demo project

/*
var count = 0
addEventListener("keydown", (event) => {
  clearTimeout(tid)
  console.log({
    alt: event.altKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    count: count++
  })
})
document.body.style = 'background-color: black; color: lime; display: flex; font-family: mono; flex; justify-content: center; align-items: center;'
document.body.innerHTML =`<h1> press <pre>ctrl+meta+alt</pre> to enter bios </h1>`
const tid = setTimeout(() => console.log((document.body.replaceChildren(), 'done')), 1000)
const foo = require('./foo')
console.log('page', foo)
*/

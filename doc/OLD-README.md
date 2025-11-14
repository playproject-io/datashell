# documentation



## roles
```js
//  shimdev  // works on shim
//  basedev  // works on root base platform bios/ipxe / kernel?
// [pagedev] // sets up page
//  coredev  // sets up system
//  tooldev  // make a tool
//  packdev  // make a tool or other packs
// [enduser] // uses the page
```
## other
```js
// enduser now
input
// enduser old
state
vault // [store, cache], registry, publish, (partitioned) localStorage
  // node package manager
  // node version manager
  // node registry
```
## config
```js
// - shim code versions   // coredev
// - shim versions        // coredev
// - kernel code versions //
// - tool code versions   // tooldev
// - tool versions        // tooldev
```
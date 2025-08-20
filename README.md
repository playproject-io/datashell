# datashell
datashell command line tool

## description

<img src="logo/datashell-logo.png" width="120" height="120">

**A Peer-to-Peer Prototyping Environment for Web Apps with User-Owned Data Vaults**

Moving data to the cloud solved users' early issues with backups and data loss, but today Big Tech companies own most of our data and control how it is used, leaving users vulnerable to privacy violations and data manipulation.

As a response to this unhealthy dependency to the Big Tech, Dat Ecosystem projects have been building a neutral common p2p infrastructure over the past 10 years. But cross-platform packaging, standards on how to build p2p apps, which give users sovereignity over their data, and educating developers how to build and bring p2p apps to the users still remains a challenge.

To address this problem, DataShell aims to create a new open standard for user-owned, GDPR compliant data vaults. Furthermore, we aim to provide developers with an open in-browser prototyping environment which they can use (or self-host) to build web apps based on the vault standard in order to create an open resilient app ecosystem that gives users full control, data portability and the ability to self-authenticate, verify data and permissionlessly combine it in new ways.

> [Read the paper](https://github.com/playproject-io/datashell/blob/main/paper/paper.pdf)

> [See the demo](https://playproject-io.github.io/datashell) (work in progress)

## usage
`npm install -g datashell`

### cli
```bash
ds # prints help
```

### setup
1. add `./index.html` and `your-app.js`
```html
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><link rel="icon" href="data:,"></head>
  <body><script src="boot.js"></script></body>
</html>
```
2. add `./boot.js` and append a version number or label to imported `shim.js` url (see code below)
   * for available version numbers or labels, check [drive.json](http://playproject.io/datashell/drive.json)
```js
const env = { version: 'latest' }
const arg = { x: 321, y: 543 }
const url = 'https://playproject.io/datashell/shim.js'
const src = `${url}?${new URLSearchParams(env)}#${new URLSearchParams(arg)}`
this.open ? document.body.append(Object.assign(document.createElement('script'), { src })) : importScripts(src)
```
3. add a `./bundle.js` file using [browserify](https://www.npmjs.com/package/browserify) in the same folder as `boot.js`
   * e.g. run `npx browserify -i STATE your-app.js -o bundle.js`
4. open `index.html` in your browser

### api
Following the usage steps above, `your-app.js` will have access to the following api:
#### `const STATE = require('STATE')`
* see [docs/](https://github.com/playproject-io/datashell/tree/main/docs)

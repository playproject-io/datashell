# DataShell 

<img src="logo/datashell-logo.png" width="120" height="120">

## A Peer-to-Peer Prototyping Environment for Web Apps with User-Owned Data Vaults

Moving data to the cloud solved users' early issues with backups and data loss, but today Big Tech companies own most of our data and control how it is used, leaving users vulnerable to privacy violations and data manipulation.

As a response to this unhealthy dependency to the Big Tech, Dat Ecosystem projects have been building a neutral common p2p infrastructure over the past 10 years. But cross-platform packaging, standards on how to build p2p apps, which give users sovereignity over their data, and educating developers how to build and bring p2p apps to the users still remains a challenge.

To address this problem, DataShell aims to create a new open standard for user-owned, GDPR compliant data vaults. Furthermore, we aim to provide developers with an open in-browser prototyping environment which they can use (or self-host) to build web apps based on the vault standard in order to create an open resilient app ecosystem that gives users full control, data portability and the ability to self-authenticate, verify data and permissionlessly combine it in new ways. 

> [Read the paper](https://github.com/playproject-io/datashell/blob/main/paper/paper.pdf)

> [See the demo](https://playproject-io.github.io/datashell) (work in progress)

## usage
1. add `./index.html`
```html
<body><script>import('./boot.js')</script></body>
```
2. add `./boot.js` and postfix a version number or label to imported `shim.js` url
   * for available version numbers or labels, check [shim.json](http://playproject.io/datashell/shim.json)
```js
import 'http://playproject.io/datashell/shim.js?version=stable'
const filepath = 'bundle.js' // 'bundle.js' is the default when just calling boot(import.meta.url)
boot(import.meta.url, filepath)
```
3. add a `./bundle.js` file or whatever `filepath` you defined in `boot.js` using [browserify](https://www.npmjs.com/package/browserify)
   * e.g. run `npx browserify your-app.js > bundle.js`
4. open a url to display your `index.html` in a browser

## api
Following the usage steps above, `your-app.js` will have access to the following api:
### `const STATE = require('STATE')`
* see [docs/](https://github.com/playproject-io/datashell/tree/main/docs)

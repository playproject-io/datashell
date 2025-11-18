### Proposal

```js
const net = {
  api: [ 'inject', 'fill' ],
  event: {
    click: []
    hover: []
  }
}
```



### Usage in override
```js
  data.net.event.click.push({ address: 'page', type: 'register', args: rainbow_theme })
```
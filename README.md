
# `mutual-net`

Mutually authenticating and encrypted client and servers (similar to nodes net api) using webRTC and wrtc for networking.

## `discovery`

Communication and discovery is done using WebRTC, the hash of the shared secret
 is used as the discovery channel. The connected peers must know the real shared
 secret to decrypt or encrypt.

## `features`

* mutually authenticated client & server
* runs in the browser and node w. webRTC

## `example`

```js

var net = require('mutual-net')

var test = net()
var client = net()

test.authorize(client.getPublicKey())

test.createServer(function (socket) {
  socket.pipe(socket)
}, function () {
  client.connect(test.getPublicKey(), function (err, socket) {
    socket.on('data', function (d) {
      console.log(d.toString())
    })
    socket.write('hello!')
  })
})


```

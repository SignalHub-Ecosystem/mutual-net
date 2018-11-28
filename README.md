
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

var net = require('@m-onz/cohort-net')

// authorize the client to connect

var server = net.createServer(function (socket) {
  socket.pipe(socket)
}, function () {
  var client = net()
  socket = client.connect(server.getPublicKey())
  server.authorize(client.getPublicKey())
  socket.on('data', console.log)
  socket.write('hello!')
})

```

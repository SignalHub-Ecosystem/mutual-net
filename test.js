
var assert = require('assert')
var net = require('.')

var mutual = net({ privateKey: '2f2a592db78286cde0029a51cbc82bc4e86240378a90988f92f24283a139cd43' })
var client = net({ privateKey: 'da54880592b7808977e0e81623a43fb0f5ed092f81bc60182b953e704ec4df37' })

assert.ok(client.getPublicKey())

assert.ok(client.getPublicKey() === '04b65c0ee0c1c2c653daf00f6eef39a582860ef1de89f6c171b7c0cecb3addbb974debd1f827892ddffeaba27a752aae0d473c527fb7fda10f5c58cf7e7fc1954a')

mutual.authorize(client.getPublicKey())

mutual.createServer(function (socket) {
  socket.pipe(socket)
}, function () {
  client.connect(mutual.getPublicKey(), function (err, socket) {
    socket.on('data', function (d) {
      console.log(d.toString())
      assert.ok(d.toString().startsWith('hello'))
      console.log('received data')
      process.exit(0)
    })
    socket.write('hello!')
  })
})

assert.ok(mutual.getPrivateKey() === '2f2a592db78286cde0029a51cbc82bc4e86240378a90988f92f24283a139cd43')
assert.ok(client.getPrivateKey() === 'da54880592b7808977e0e81623a43fb0f5ed092f81bc60182b953e704ec4df37')
console.log('set private keys')

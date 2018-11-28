
var net = require('.')

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

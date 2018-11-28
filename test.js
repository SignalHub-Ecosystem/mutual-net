
var net = require('.')

var server = net.createServer(function (socket) {
  socket.pipe(socket)
}, function () {
  var client = net()
  socket = client.connect(server.getPublicKey())
  server.authorize(client.getPublicKey())
  socket.on('data', console.log)
  socket.write('hello!')
})

//
var net = require('net')
const crypto = require('crypto');
const bob = crypto.createECDH('secp256k1');
var bobSK = 'd439fcb947cb512b6c8cfd2f7d08f03ce4fbe3412db2cebd4ff637f1058a0542'
bob.setPrivateKey(Buffer.from(bobSK, 'hex'))
var bobPK = bob.getPublicKey()
var clientPK = '0497f2daee1f9883181ac305b978450b18b193df2e431aff41340e5fa7736099aa9487d41bfff597f9396526bcc1d57d7c5ef95eeed341c04af8290ee9a4589b3d'
const bobSecret = bob.computeSecret(Buffer.from(clientPK, 'hex'), null, 'hex');

var dcs = require('./duplex-crypto-stream.js')

net.createServer(function (socket) {
  socket = dcs(socket, bobSecret)
  socket.pipe(socket)
}).listen(5000)

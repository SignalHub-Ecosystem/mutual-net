
var net = require('net')
const crypto = require('crypto');
const alice = crypto.createECDH('secp256k1');
var aliceSK = 'd391508954d7b8f348148e70fcba202c7110e9216daf5e65b6d42b1639423d68'
alice.setPrivateKey(Buffer.from(aliceSK, 'hex'))
var alicePK = alice.getPublicKey()
var bobPK = '0434673a4735746e791f6a13911d04d30d555e366aec24f5ca6b47b80d9c61f11415492e83ce006061216fac3a7b88351d2da2f7b6e87e22066370de4faa640c8c'
const aliceSecret = alice.computeSecret(Buffer.from(bobPK,'hex'), null, 'hex');


var dcs = require('./duplex-crypto-stream.js')

var socket = dcs(net.connect(5000), aliceSecret)

process.stdin.pipe(socket)

socket.pipe(process.stdout)


// Mutual

var EventEmitter = require('events').EventEmitter
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var inherits = require('inherits')
var crypto = require('crypto')
var dcs = require('./duplex-crypto-stream.js')

if (typeof window !== 'object') {
  var wrtc = require('wrtc')
}

function hash (thing) {
  return crypto.createHash('sha1').update(thing).digest('hex');
}

function Mutual (options) {
  if (!(this instanceof Mutual)) return new Mutual(options)
  EventEmitter.call(this)
  this.setMaxListeners(0)
  this.options = Object.assign({}, options)
  this.id = crypto.createECDH('secp256k1')
  this.id.generateKeys()
  this.publicKey = this.id.getPublicKey().toString('hex')
  console.log(this.publicKey)
  this.signalhubs = [ 'https://telescope.computer' ]
  this.authorized = []
}

inherits(Mutual, EventEmitter)

Mutual.prototype.connect = function (pk, cb) {
  var secret = this.id.computeSecret(Buffer.from(pk, 'hex'), null, 'hex')
  console.log('<connect> ', secret)
  var hub = signalhub(hash(secret), this.signalhubs)
  if (typeof window !== 'object') {
    var sw = swarm(hub, { wrtc: wrtc })
  } else {
    var sw = swarm(hub)
  }
  sw.once('peer', function (peer, id) {
    console.log('peer!')
    socket = dcs(peer, secret)
    cb(null, socket)
  })
  sw.on('disconnect', function () {})
}

Mutual.prototype.getPublicKey = function () {
  return this.publicKey
}

Mutual.prototype.authorize = function (public_key) {
  this.authorized.push({
    public_key: public_key,
    secret: this.id.computeSecret(Buffer.from(public_key, 'hex'), null, 'hex'),
    live: false
  })
  this.channels()
}

Mutual.prototype.channels = function () {
  var self = this
  this.authorized.forEach(function (client) {
    if (!client.live) {
      console.log(client)
      var hub = signalhub(hash(client.secret), self.signalhubs)
      if (typeof window !== 'object') {
        var sw = swarm(hub, { wrtc: wrtc })
      } else {
        var sw = swarm(hub)
      }
      sw.on('peer', function (peer, id) {
        console.log('peer!')
        var socket = dcs(peer, client.secret)
        self.emit('connection', socket, client.publicKey)
      })
      sw.on('disconnect', function () {
        self.emit('peers', sw.peers.length)
      })
      client.live = true
    }
  })
}

Mutual.prototype.createServer = function (cb, cb2) {
  this.channels()
  this.on('connection', cb)
  if (typeof cb2 === 'function') cb2()
}

module.exports = Mutual

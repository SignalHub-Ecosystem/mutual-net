
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
  this.options = Object.assign({
    signalhubs: [ 'https://telescope.computer' ],
  }, options)
  this.id = crypto.createECDH('secp256k1')
  if (this.options.hasOwnProperty('privateKey')) {
    this.id.setPrivateKey(Buffer.from(this.options.privateKey, 'hex'))
  } else { this.id.generateKeys(); }
  this.publicKey = this.id.getPublicKey().toString('hex')
  console.log('public key <', this.publicKey, '>')
  this.signalhubs = this.options.signalhubs
  this.authorized = []
}

inherits(Mutual, EventEmitter)

Mutual.prototype.connect = function (pk, cb) {
  var secret = this.id.computeSecret(Buffer.from(pk, 'hex'), null, 'hex')
  // nice spinner goes here?
  var hub = signalhub(hash(secret), this.signalhubs)
  if (typeof window !== 'object') {
    var sw = swarm(hub, { wrtc: wrtc })
  } else {
    var sw = swarm(hub)
  }
  sw.once('peer', function (peer, id) {
    socket = dcs(peer, secret)
    cb(null, socket)
  })
  sw.on('error', console.log)
  sw.on('disconnect', function () {})
}

Mutual.prototype.getPublicKey = function () {
  return this.id.getPublicKey().toString('hex')
}

Mutual.prototype.getPrivateKey = function () {
  return this.id.getPrivateKey().toString('hex')
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
      var hub = signalhub(hash(client.secret), self.signalhubs)
      if (typeof window !== 'object') {
        var sw = swarm(hub, { wrtc: wrtc })
      } else {
        var sw = swarm(hub)
      }
      sw.on('peer', function (peer, id) {
        var socket = dcs(peer, client.secret)
        self.emit('connection', socket, client.publicKey)
      })
      sw.on('error', console.log)
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

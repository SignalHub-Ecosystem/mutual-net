
var pumpify = require('pumpify')
var cryptoStream = require('crypto-stream');

module.exports = function (stream, secret) {
  var encrypter = cryptoStream.encrypt(secret);
  var decrypter = cryptoStream.decrypt(secret);
  return pumpify(encrypter, stream, decrypter)
}

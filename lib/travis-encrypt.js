var rsa = require('ursa');
var q = require('q');
var request = require('request');

var getKey = function (slug) {
    var defer = q.defer();
    var headers = {
        'Accept': 'application/vnd.travis-ci.2+json, */*; q=0.01'
    };
    request.get({
        url: 'https://api.travis-ci.org/repos/' + slug + '/key',
        headers: headers
    }, function (err, res) {
        if (err || res.statusCode !== 200) {
            defer.reject();
        } else {
            defer.resolve(JSON.parse(res.body));
        }
    });
    return defer.promise;
};

var encrypt = function (slug, data) {
    return getKey(slug).then(function (res) {
        var pem = res.key.replace(/RSA PUBLIC KEY/g, 'PUBLIC KEY');
        try {
            var publicKey = rsa.createPublicKey(pem);
            var cipherText = publicKey.encrypt(data, undefined, undefined, rsa.RSA_PKCS1_PADDING);
            return q.resolve(cipherText.toString('base64'));
        } catch (err) {
            return q.reject(err);
        }
    });
};

module.exports = encrypt;
var NodeRSA = require('node-rsa');
var Travis = require('travis-ci');

var isUndefined = function (arg) {
    return typeof arg === 'undefined';
};

var encryptData = function (data, key, callback) {
    var pem = key.replace(/RSA PUBLIC KEY/g, 'PUBLIC KEY');
    try {
        var publicKey = new NodeRSA(pem, 'pkcs8-public-pem');
        var cipherText = publicKey.encrypt(data, 'base64');
        return callback(null, cipherText);
    } catch (err) {
        return callback(err);
    }
};

var encryptTravisProData = function (ownerName, name, data, username, password, callback) {
    var travis = new Travis({
        version: '2.0.0',
        pro: true
    });

    travis.authenticate({
        username: username,
        password: password
    }, function (err) {
        if (err) { return callback(err); }

        travis.repos(ownerName, name).key.get(function (keyError, res) {
            if (keyError) {
                return travis.repos(ownerName, name).get(function (reposError) {
                    callback(reposError ? 'repository ' + ownerName + '/' + name + ' not found' : keyError);
                });
            }


            encryptData(data, res.key, callback);
        });
    });
};

var encryptTravisData = function (ownerName, name, data, callback) {
    var travis = new Travis({
        version: '2.0.0'
    });

    travis.repos(ownerName, name).key.get(function (keyError, res) {
        if (keyError) {
            return travis.repos(ownerName, name).get(function (reposError) {
                callback(reposError ? 'repository ' + ownerName + '/' + name + ' not found' : keyError);
            });
        }

        encryptData(data, res.key, callback);
    });
};

var encrypt = function (slug, data, username, password, callback) {
    if ((isUndefined(username) && !isUndefined(password)) ||
        (!isUndefined(username) && isUndefined(password))
    ) {
        return callback('insufficient github credentials');
    }

    var ownerName = slug.split('/')[0];
    var name = slug.split('/')[1];

    if (!isUndefined(username) && !isUndefined(password)) {
        encryptTravisProData(ownerName, name, data, username, password, callback);
    } else {
        encryptTravisData(ownerName, name, data, callback);
    }
};

module.exports = encrypt;

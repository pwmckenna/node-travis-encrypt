var rsa = require('ursa');
var GitHubApi = require('github');
var Travis = require('travis-ci');
var _ = require('lodash');

var getGithubTravisProOAuthToken = function (username, password, callback) {
    var github = new GitHubApi({
        // required
        version: '3.0.0',
    });
    github.authenticate({
        type: 'basic',
        username: username,
        password: password
    });
    github.authorization.getAll({}, function (err, res) {
        if (err) { return callback(err); }

        var authorization = _.findWhere(res, {
            app: {
                name: 'Travis Pro',
                url: 'https://travis-ci.com'
            }
        });
        if (authorization) {
            return callback(null, authorization.token);
        } else {
            return callback('travis pro oauth token not found');
        }
    });
};

var encryptData = function (data, key, callback) {
    var pem = key.replace(/RSA PUBLIC KEY/g, 'PUBLIC KEY');
    try {
        var publicKey = rsa.createPublicKey(pem);
        var cipherText = publicKey.encrypt(data, undefined, undefined, rsa.RSA_PKCS1_PADDING);
        return callback(null, cipherText.toString('base64'));
    } catch (err) {
        return callback(err);
    }
};

var encryptTravisProData = function (ownerName, name, data, username, password, callback) {
    var travis = new Travis({
        version: '2.0.0',
        pro: true
    });

    getGithubTravisProOAuthToken(username, password, function (err, oauthToken) {
        if (err) { return callback(err); }

        travis.auth.github({
            github_token: oauthToken
        }, function (err, res) {
            if (err) { return callback(err); }

            travis.authenticate(res.access_token, function (err) {
                if (err) { return callback(err); }

                travis.repos.key({
                    owner_name: ownerName,
                    name: name
                }, function (err, res) {
                    if (err) { return callback(err); }

                    encryptData(data, res.key, callback);
                });
            });
        });
    });
};

var encryptTravisData = function (ownerName, name, data, callback) {
    var travis = new Travis({
        version: '2.0.0'
    });

    travis.repos.key({
        owner_name: ownerName,
        name: name
    }, function (err, res) {
        if (err) { return callback(err); }

        encryptData(data, res.key, callback);
    });
};

var encrypt = function (slug, data, username, password, callback) {
    if ((_.isUndefined(username) && !_.isUndefined(password)) ||
        (!_.isUndefined(username) && _.isUndefined(password))
    ) {
        return callback('insufficient github credentials');
    }

    var ownerName = slug.split('/')[0];
    var name = slug.split('/')[1];

    if (!_.isUndefined(username) && !_.isUndefined(password)) {
        encryptTravisProData(ownerName, name, data, username, password, callback);
    } else {
        encryptTravisData(ownerName, name, data, callback);
    }
};

module.exports = encrypt;
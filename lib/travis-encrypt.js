var rsa = require('ursa');
var q = require('q');
var request = require('request');
var GitHubApi = require('github');
var _ = require('lodash');

var getGithubTravisProOAuthToken = function (username, password) {
    var github = new GitHubApi({
        // required
        version: '3.0.0',
    });
    github.authenticate({
        type: 'basic',
        username: username,
        password: password
    });
    var getAllAuthorizationsRequest = q.defer();
    github.authorization.getAll({}, getAllAuthorizationsRequest.makeNodeResolver());

    return getAllAuthorizationsRequest.promise.then(function (res) {
        var authorization = _.findWhere(res, {
            app: {
                name: 'Travis Pro',
                url: 'https://travis-ci.com'
            }
        });
        if (authorization) {
            return q.resolve(authorization.token);
        } else {
            return q.reject();
        }
    });
};

var getTravisAccessKey = function (token) {
    var defer = q.defer();
    var headers = {
        'Accept': 'application/vnd.travis-ci.2+json, */*; q=0.01'
    };
    request.post({
        url: 'https://api.travis-ci.com/auth/github',
        headers: headers,
        form: {
            github_token: token
        }
    }, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            defer.reject(res.body);
        } else {
            defer.resolve(JSON.parse(res.body).access_token);
        }
    });
    return defer.promise;
};

var getKey = function (slug) {
    var defer = q.defer();
    var headers = {
        'Accept': 'application/vnd.travis-ci.2+json, */*; q=0.01'
    };
    request.get({
        url: 'https://api.travis-ci.org/repos/' + slug + '/key',
        headers: headers
    }, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            defer.reject(res.body);
        } else {
            defer.resolve(JSON.parse(res.body).key);
        }
    });
    return defer.promise;
};

var getKeyPro = function (slug, token) {
    var defer = q.defer();
    var headers = {
        'Accept': 'application/vnd.travis-ci.2+json, */*; q=0.01',
        'Authorization': 'token ' + token
    };
    request.get({
        url: 'https://api.travis-ci.com/repos/' + slug + '/key',
        headers: headers
    }, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            defer.reject(res.body);
        } else {
            defer.resolve(JSON.parse(res.body).key);
        }
    });
    return defer.promise;
};

var encryptData = function (data, key) {
    var pem = key.replace(/RSA PUBLIC KEY/g, 'PUBLIC KEY');
    try {
        var publicKey = rsa.createPublicKey(pem);
        var cipherText = publicKey.encrypt(data, undefined, undefined, rsa.RSA_PKCS1_PADDING);
        return q.resolve(cipherText.toString('base64'));
    } catch (err) {
        return q.reject(err);
    }
};

var encrypt = function (slug, data, username, password, callback) {
    if ((_.isUndefined(username) && !_.isUndefined(password)) ||
        (!_.isUndefined(username) && _.isUndefined(password))
    ) {
        q.reject('insufficient github credentials').nodeify(callback);
    }


    var keyRequest;
    if (!_.isUndefined(username) && !_.isUndefined(password)) {
        return getGithubTravisProOAuthToken(username, password)
            .then(getTravisAccessKey)
            .then(_.partial(getKeyPro, slug))
            .then(function (key) {
                return encryptData(data, key);
            }).nodeify(callback);
    } else {
        return getKey(slug).then(function (key) {
            return encryptData(data, key);
        }).nodeify(callback);
    }
};

module.exports = encrypt;
var test = require('tape');
var merge = require('lodash.merge');
var proxyquire =  require('proxyquire')
var base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

test('it encrypts for travis pro if username + password is given', function (t) {
    var encrypt = getTravisMock({
        repos: function () {
            return {
                key: {
                    get: function (callback) {
                        callback(null, { key: getFakePublicKey() });
                    }
                }
            };
        }
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna',
        password: 'somepass'
    }, function (err, result) {
        t.notOk(err, 'should not error');
        t.ok(result.match(base64), 'should give expected cipher format');
        t.end();
    });
});

test('it gives error if travis auth fails (for travis pro)', function (t) {
    var encrypt = getTravisMock({
        authenticate: function (creds, callback) {
            callback(new Error('Bad credentials'));
        }
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna',
        password: 'somepass'
    }, function (err) {
        t.ok(err && err.message.indexOf('Bad credentials') !== -1, 'callback called with error');
        t.end();
    });
});

test('it should handle repo-not-found errors', function (t) {
    var encrypt = getTravisMock({
        repos: function () {
            return {
                key: {
                    get: function (callback) {
                        callback(new Error('Some key error'));
                    }
                },
                get: function (callback) {
                    callback(new Error('Repo not found'));
                }
            };
        }
    });

    t.plan(2);
    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna',
        password: 'somepass'
    }, function (err) {
        t.equals(err.message, 'repository pwmckenna/node-travis-encrypt not found');
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR'
    }, function (err) {
        t.equals(err.message, 'repository pwmckenna/node-travis-encrypt not found');
    });
});

test('it should handle key errors', function (t) {
    var encrypt = getTravisMock({
        repos: function () {
            return {
                key: {
                    get: function (callback) {
                        callback(new Error('Some key error'));
                    }
                },
                get: function (callback) {
                    callback();
                }
            };
        }
    });

    t.plan(2);
    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna',
        password: 'somepass'
    }, function (err) {
        t.equals(err.message, 'Some key error');
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR'
    }, function (err) {
        t.equals(err.message, 'Some key error');
    });
});

test('it requires both username and password to be given', function (t) {
    t.plan(2);

    var encrypt = getTravisMock();

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        password: 'somepass'
    }, function (err) {
        t.equals(err.message, 'insufficient github credentials');
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna'
    }, function (err) {
        t.equals(err.message, 'insufficient github credentials');
    });
});

test('it requires repo to be given (and be a string)', function (t) {
    t.plan(2);
    var encrypt = getTravisMock();
    encrypt({ data: 'FOO=BAR' }, function (err) {
        t.equals(err.message, '`repo` must be a string');
    });

    encrypt({ repo: 13, data: 'FOO=BAR' }, function (err) {
        t.equals(err.message, '`repo` must be a string');
    });
});

test('it requires repo to contain a slash (/)', function (t) {
    t.plan(2);
    var encrypt = getTravisMock();
    encrypt({ repo: 'foo' }, function (err) {
        t.equals(err.message, '`repo` must be in `owner/repo` form');
    });

    encrypt({ repo: '/bar' }, function (err) {
        t.equals(err.message, '`repo` must be in `owner/repo` form');
    });
});

test('it requires data to be given (and be a string)', function (t) {
    t.plan(2);
    var encrypt = getTravisMock();
    encrypt({ repo: 'foo/bar' }, function (err) {
        t.equals(err.message, '`data` must be a string');
    });

    encrypt({ repo: 'foo/bar', data: 13 }, function (err) {
        t.equals(err.message, '`data` must be a string');
    });
});

test('it encrypts for travis open-source if no username/password is given', function (t) {
    var encrypt = getTravisMock({
        repos: function (owner, repo) {
            t.equals(owner, 'pwmckenna', 'correct owner');
            t.equals(repo, 'node-travis-encrypt', 'correct repo');

            return {
                key: {
                    get: function (callback) {
                        callback(null, { key: getFakePublicKey() });
                    }
                }
            };
        }
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR'
    }, function (err, result) {
        t.notOk(err, 'should not error');
        t.ok(result.match(base64), 'should give expected cipher format');
        t.end();
    });
});

test('it should catch errors thrown by ursa', function (t) {
    var encrypt = getTravisMock({
        repos: function () {
            return {
                key: {
                    get: function (callback) {
                        callback(null, { key: 'foo' });
                    }
                }
            };
        }
    });

    encrypt({
        repo: 'pwmckenna/node-travis-encrypt',
        data: 'FOO=BAR',
        username: 'pwmckenna',
        password: 'somepass'
    }, function (err) {
        t.ok(err, 'should catch and call callback with error');
        t.end();
    });
});

function getFakePublicKey() {
    return [
        '-----BEGIN RSA PUBLIC KEY-----',
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArgov0KHVYlOtS15/WIO0',
        'Hpz9NIuWQiH/9VuCqjEnsMJdZR20NsxiNCjMTjOXtl8jCGFAp8fyb5peT7Qlp4xZ',
        'ky6odeyFEc6Z9QInyRSVBozlRoYShefQ6JSPFaF9k+FYFN/xz0LYHZwZCW+r78dQ',
        'V9ZGKBQT61El8NiriiqKq1SBZiEI7jT18J0i6H1qFVAkkZcyz3v85/yudPUC1wBF',
        'wzfk9yJ9O8bpNlGonxlDoQKXxHS8yV15dTqAAoeVysBqQk1/NiDQuEJMbrq3cfDl',
        'l0scsnVec0dwIUNY9UasxrbPpwk00ce54uWjwYl/sQ+AOvKZhJXbJFEfKyFi8f2E',
        'dQIDAQAB',
        '-----END RSA PUBLIC KEY-----',
        ''
    ].join('\n');
}

function getTravisMock(mocks) {
    return proxyquire('../lib/travis-encrypt', {
        'travis-ci': function travisCiModuleMock() {
            return merge({
                authenticate: function (creds, callback) {
                    callback();
                }
            }, mocks || {});
        }
    });
}

var test = require('tape');
var merge = require('lodash.merge');
var proxyquire =  require('proxyquire')
var base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
var undef;

test('it encrypts for travis pro if username + password is given', function(t) {
    var encrypt = getTravisMock({
        repos: function() {
            return {
                key: {
                    get: function(callback) {
                        callback(null, { key: getFakePublicKey() });
                    }
                }
            };
        }
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', 'somepass', function(err, result) {
        t.notOk(err, 'should not error');
        t.ok(result.match(base64), 'should give expected cipher format');
        t.end();
    });
});

test('it gives error if travis auth fails (for travis pro)', function(t) {
    var encrypt = getTravisMock({
        authenticate: function(creds, callback) {
            callback(new Error('Bad credentials'));
        }
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', 'somepass', function(err) {
        t.ok(err && err.message.indexOf('Bad credentials') !== -1, 'callback called with error');
        t.end();
    });
});

test('it should handle repo-not-found errors', function(t) {
    var encrypt = getTravisMock({
        repos: function() {
            return {
                key: {
                    get: function(callback) {
                        callback(new Error('Some key error'));
                    }
                },
                get: function(callback) {
                    callback(new Error('Repo not found'));
                }
            };
        }
    });

    t.plan(2);
    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', 'somepass', function(err) {
        t.equals(err, 'repository pwmckenna/node-travis-encrypt not found');
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', undef, undef, function(err) {
        t.equals(err, 'repository pwmckenna/node-travis-encrypt not found');
    });
});

test('it should handle key errors', function(t) {
    var encrypt = getTravisMock({
        repos: function() {
            return {
                key: {
                    get: function(callback) {
                        callback(new Error('Some key error'));
                    }
                },
                get: function(callback) {
                    callback();
                }
            };
        }
    });

    t.plan(2);
    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', 'somepass', function(err) {
        t.equals(err.message, 'Some key error');
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', undef, undef, function(err) {
        t.equals(err.message, 'Some key error');
    });
});

test('it requires both username and password to be given', function(t) {
    t.plan(2);

    var encrypt = getTravisMock();

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', undef, 'somepass', function(err) {
        t.equals(err, 'insufficient github credentials');
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', undef, function(err) {
        t.equals(err, 'insufficient github credentials');
    });
});

test('it encrypts for travis open-source if no username/password is given', function(t) {
    var encrypt = getTravisMock({
        repos: function(owner, repo) {
            t.equals(owner, 'pwmckenna', 'correct owner');
            t.equals(repo, 'node-travis-encrypt', 'correct repo');

            return {
                key: {
                    get: function(callback) {
                        callback(null, { key: getFakePublicKey() });
                    }
                }
            };
        }
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', undef, undef, function(err, result) {
        t.notOk(err, 'should not error');
        t.ok(result.match(base64), 'should give expected cipher format');
        t.end();
    });
});

test('it should catch errors thrown by ursa', function(t) {
    var encrypt = getTravisMock({
        repos: function() {
            return {
                key: {
                    get: function(callback) {
                        callback(null, { key: 'foo' });
                    }
                }
            };
        }
    });

    encrypt('pwmckenna/node-travis-encrypt', 'FOO=BAR', 'pwmckenna', 'somepass', function(err) {
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
                authenticate: function(creds, callback) {
                    callback();
                }
            }, mocks || {});
        }
    });
}

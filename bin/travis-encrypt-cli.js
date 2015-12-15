#!/usr/bin/env node
process.title = 'travis-encrypt';

var yargs = require('yargs');
var encrypt = require('..');
var deepProp = require('deep-property');
var yamlread = require('read-yaml');
var yamlwrite = require('write-yaml');
require('colors');

var args = yargs.usage('Usage: $0 -r [repository slug] -u [username] -p [password] -a [key]');
args.help('help');

var argv = args
    .string('r')
    .alias('r', 'repo')
    .alias('r', 'repository')
    .describe('r', 'repository slug')

    .string('u')
    .alias('u', 'username')
    .describe('u', 'github username associated with the pro travis repo')

    .string('p')
    .alias('p', 'password')
    .describe('p', 'github password for the user associated with the pro travis repo')

    .string('a')
    .alias('a', 'add')
    .describe('a', 'adds it to .travis.yml under key (default: env.global)')

    .check(function (args) {
        if (!args.hasOwnProperty('r')) {
            throw new Error('no repository specified');
        }

        var hasUser = args.hasOwnProperty('u');
        var hasPass = args.hasOwnProperty('p');

        if ((!hasUser && hasPass) || (hasUser && !hasPass)) {
            throw new Error('insufficient github credentials');
        }

        return true;
    })
    .argv;

var encryptData = function (data) {
    encrypt(argv.repo, data, argv.username, argv.password, function (err, res) {
        console.log('# ' + data.split('=')[0]);
        if (err) {
            console.warn(err);
        } else {
            console.log(res.green);
        }
    });
};

var encryptAndSaveData = function (data) {
    var remaining = data.length + 1,
        blobs = [],
        config;

    function saveConfig() {
        var prop = typeof argv.add === 'string' ? argv.add : 'env.global';
        var env = (deepProp.get(config, prop) || []).concat(blobs);
        deepProp.set(config, prop, env);

        yamlwrite('.travis.yml', config);
        console.log('Wrote ' + blobs.length + ' blob(s) to .travis.yml');
    }

    function onResult(err, res, isConfig) {
        if (err) {
            throw err;
        }

        if (!isConfig) {
            blobs.push({ secure: res });
        } else {
            config = res;
        }

        if (--remaining === 0) {
            saveConfig();
        }
    }

    yamlread('.travis.yml', function (err, res) {
        onResult(err, res, true);
    });

    data.forEach(function (envLine) {
        encrypt(argv.repo, envLine, argv.username, argv.password, onResult);
    });
};

if (argv.add) {
    encryptAndSaveData(argv._);
} else {
    argv._.forEach(encryptData);
}

process.stdin.on('readable', function () {
    var buf = process.stdin.read();
    if (buf) {
        buf.toString().trim().split(' ').forEach(encryptData);
    }
    process.stdin.end();
});

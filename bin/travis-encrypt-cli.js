#!/usr/bin/env node
process.title = 'travis-encrypt';

var optimist = require('optimist');
var encrypt = require('..');
var path = require('path');
require('colors');

var argv = optimist
    .usage('Usage: $0 -r [repository slug] -n [name] -v [value] -j [json file] -u [username] -p [password]')

    .string('r')
    .alias('r', 'repo')
    .alias('r', 'repository')
    .describe('r', 'repository slug')
    
    .string('n')
    .alias('n', 'name')
    .describe('n', 'environment variable name to encrypt')

    .string('v')
    .alias('v', 'value')
    .describe('v', 'environment variable value to encrypt')

    .string('j')
    .alias('j', 'json')
    .describe('j', 'json file with variables to encrypt')

    .string('u')
    .alias('u', 'username')
    .describe('u', 'github username associated with the pro travis repo')

    .string('p')
    .alias('p', 'password')
    .describe('p', 'github password for the user associated with the pro travis repo')

    .check(function (args) {
        if ((!args.hasOwnProperty('u') && args.hasOwnProperty('p')) ||
            (args.hasOwnProperty('u') && !args.hasOwnProperty('p'))
        ) {
            throw 'insufficient github credentials';
        }

        if (!(args.hasOwnProperty('n') && args.hasOwnProperty('v')) &&
            !args.hasOwnProperty('j')
        ) {
            throw 'must provide a key/value pair or a json file of variables to encrypt'
        }
    })
    .argv;

var displayEncryptedValue = function (slug, name, value, username, password) {
    return encrypt(slug, name + '=' + value, username, password, function (err, res) {
        console.log('# ' + name.grey);
        if (err) {
            console.warn(err.toString().red);
        } else {
            console.log(res.green);
        }
    });
}

if (argv.hasOwnProperty('json')) {
    var json = require(path.resolve(argv.json));
    for (var j in json) {
        displayEncryptedValue(argv.repo, j, json[j], argv.username, argv.password);
    }
} else {
    displayEncryptedValue(argv.repo, argv.name, argv.value, argv.username, argv.password);
}

#!/usr/bin/env node
process.title = 'travis-encrypt';

var optimist = require('optimist');
var encrypt = require('..');
var path = require('path');
require('colors');

var argv = optimist
    .usage('Usage: $0 -s [repository slug] -n [name] -v [value] -j [json file]')

    .string('s')
    .alias('s', 'slug')
    .describe('s', 'repository slug')
    
    .string('n')
    .alias('n', 'name')
    .describe('n', 'environment variable name to encrypt')

    .string('v')
    .alias('v', 'value')
    .describe('v', 'environment variable value to encrypt')

    .string('j')
    .alias('j', 'json')
    .describe('j', 'json file with variables to encrypt')

    .check(function (args) {
        if (!(args.hasOwnProperty('n') && args.hasOwnProperty('v')) &&
            !args.hasOwnProperty('j')
        ) {
            throw 'must provide a key/value pair or a json file of variables to encrypt'
        }
    })
    .argv;

var displayEncryptedValue = function (slug, name, value) {
    return encrypt(slug, name + '=' + value).then(function (res) {
        console.log('# ' + name.grey);
        console.log(res.green);
    }, function (err) {
        console.log('# ' + name.grey);
        console.warn(err.toString().red);
    });
}

if (argv.hasOwnProperty('json')) {
    var json = require(path.resolve(argv.json));
    for (var j in json) {
        displayEncryptedValue(argv.slug, j, json[j]);
    }
} else {
    displayEncryptedValue(argv.slug, argv.name, argv.value);
}

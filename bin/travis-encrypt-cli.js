#!/usr/bin/env node
process.title = 'travis-encrypt';

var yargs = require('yargs');
var encrypt = require('..');
var path = require('path');
var split = require('split');
require('colors');

var argv = yargs
    .usage('Usage: $0 -r [repository slug] -u [username] -p [password]')

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

    .check(function (args) {
        if ((!args.hasOwnProperty('u') && args.hasOwnProperty('p')) ||
            (args.hasOwnProperty('u') && !args.hasOwnProperty('p'))
        ) {
            throw 'insufficient github credentials';
        }
    })
    .argv;


var encryptData = function (data) {
    encrypt(argv.repo, data, argv.username, argv.password, function (err, res) {
        console.log('# ' + data.split('=')[0]);
        if (err) {
            console.warn(err.toString().red);
        } else {
            console.log(res.green);
        }
    });
};

argv._.forEach(encryptData);

process.stdin.on('readable', function () {
    var buf = process.stdin.read();
    if (buf) {
        buf.toString().trim().split(' ').forEach(encryptData);
    }
    process.stdin.end();
});
#!/usr/bin/env node
process.title = 'travis-encrypt';

var argv = require('optimist')
    .usage('Usage: $0 --slug [repository slug] --data [data to encrypt]')
    .demand(['s', 'd'])
    .string('s')
    .string('d')
    .alias('s', 'slug')
    .alias('d', 'data')
    .argv;

var encrypt = require('..');
encrypt(argv.slug, argv.data).then(function (data) {
    console.log(data);
}, function (err) {
    console.warn(err);
});
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
  .describe('a', 'adds it to .travis.yml under the given key (default: `env.global`)')

  .check(function (args) {
    if (!args.r) {
      throw new Error('no repository specified');
    }

    var hasUser = args.u;
    var hasPass = args.p;

    if ((!hasUser && hasPass) || (hasUser && !hasPass)) {
      throw new Error('insufficient github credentials');
    }

    return true;
  })
  .argv;

function encryptData (data) {
  encrypt({
    repo: argv.repo,
    data: data,
    username: argv.username,
    password: argv.password
  }, function onEncryptResult (err, res) {
    console.log('# ' + data.split('=')[0]);
    if (err) {
      console.warn(err);
    } else {
      console.log(res.green);
    }
  });
}

function makeArray (arr) {
  if (!arr || typeof arr.length === 'undefined') {
    return [ arr ];
  }
  return arr;
}

function encryptAndSaveData (data, prop) {
  var remaining = data.length;
  var blobs = [];
  var config;

  function saveConfig (prop) {
    prop = prop || 'env.global';

    var existingProps = makeArray(deepProp.get(config, prop) || []);
    var env = existingProps.concat(blobs);
    deepProp.set(config, prop, env);

    yamlwrite.sync('.travis.yml', config);
    console.log('Wrote ' + blobs.length + ' blob(s) to .travis.yml');
  }

  function onResult (err, res) {
    if (err) {
      throw err;
    }

    blobs.push({ secure: res });

    if (--remaining === 0) {
      saveConfig(prop);
    }
  }

  config = yamlread.sync('.travis.yml');

  data.forEach(function (envLine) {
    encrypt({
      repo: argv.repo,
      data: envLine,
      username: argv.username,
      password: argv.password
    }, onResult);
  });
}

if (typeof argv.add !== 'undefined') {
  encryptAndSaveData(argv._, typeof argv.add === 'string' && argv.add !== '' ? argv.add : null);
} else {
  argv._.forEach(encryptData);
}

process.stdin.on('readable', function readStdIn () {
  var buf = process.stdin.read();
  if (buf) {
    buf.toString().trim().split(' ').forEach(encryptData);
  }
  process.stdin.end();
});

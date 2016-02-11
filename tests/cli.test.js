var fs = require('fs');
var path = require('path');
var childProc = require('child_process');
var test = require('tape');
var concat = require('concat-stream');

test('it shows help on --help', function (t) {
  spawn(['--help'], function (res) {
    t.equals(res.status, 0, 'status could should be 0');
    t.ok(res.stdout.indexOf('Usage: ') === 0, 'contains usage');
    t.ok(res.stdout.indexOf('--help') !== -1, 'contains --help');
    t.end();
  });
});

test('it requires repository slug (--r, --repo, --repository)', function (t) {
  t.plan(4);

  spawn([], function (res) {
    t.equal(res.status, 1, 'status could should be 1');
    bufferContains(t, res.stderr, 'no repository specified');
  });

  spawn(['-r'], function (res) {
    t.equal(res.status, 1, 'status could should be 1');
    bufferContains(t, res.stderr, 'no repository specified');
  });
});

test('it requires both user and pass if only user is specified', function (t) {
  spawn(['-r', 'foo/bar', '-u', 'foo'], function (res) {
    t.equal(res.status, 1, 'status could should be 1');
    bufferContains(t, res.stderr, 'insufficient github credentials');

    t.end();
  });
});

test('it requires both user and pass if only password is specified', function (t) {
  spawn(['-r', 'foo/bar', '-p', 'foo'], function (res) {
    t.equal(res.status, 1, 'status could should be 1');
    bufferContains(t, res.stderr, 'insufficient github credentials');

    t.end();
  });
});

test('it encrypts every data pair given', function (t) {
  spawn(['-r', 'pwmckenna/node-travis-encrypt', 'FOO=bar', 'BAR=foo'], function (res) {
    t.equal(res.status, 0, 'status could should be 0');
    bufferContains(t, res.stdout, '# FOO');
    bufferContains(t, res.stdout, '# BAR');

    t.end();
  });
});

test('it encrypts from stdin', function (t) {
  var envVars = fs.createReadStream(path.join(__dirname, 'fixtures', 'env-vars'));
  var script = path.join(__dirname, '..', 'bin', 'travis-encrypt-cli.js');
  var proc = childProc.spawn('node', [script, '-r', 'pwmckenna/node-travis-encrypt']);

  proc.stdout.pipe(concat(function (res) {
    bufferContains(t, res, '# FOO');
    bufferContains(t, res, '# BAR');
    t.end();
  }));

  proc.stdin.resume();
  envVars.pipe(proc.stdin, { end: false });
});

test('it can write given data to .travis.yml', function (t) {
  var fixturesDir = path.join(__dirname, 'fixtures');
  var target = path.join(fixturesDir, '.travis.yml');
  var source = path.join(fixturesDir, 'travis.original.yml');

  maybeUnlink(target);
  fs.writeFileSync(
    target,
    fs.readFileSync(source)
  );

  spawn(['--add', '-r', 'pwmckenna/node-travis-encrypt', 'FOO=bar', 'BAR=foo'], {
    cwd: path.join(__dirname, 'fixtures')
  }, function (res) {
    t.equal(res.status, 0, 'status could should be 0');
    bufferContains(t, res.stdout, 'Wrote 2 blob(s)');

    var edited = fs.readFileSync(target);
    bufferContains(t, edited, '- secure: ');

    maybeUnlink(target);

    t.end();
  });
});

test('it can write given data to .travis.yml with shorthand flag', function (t) {
  var fixturesDir = path.join(__dirname, 'fixtures');
  var target = path.join(fixturesDir, '.travis.yml');
  var source = path.join(fixturesDir, 'travis.original.yml');

  maybeUnlink(target);
  fs.writeFileSync(
    target,
    fs.readFileSync(source)
  );

  spawn(['-a', '-r', 'pwmckenna/node-travis-encrypt', 'FOO=bar', 'BAR=foo'], {
    cwd: path.join(__dirname, 'fixtures')
  }, function (res) {
    t.equal(res.status, 0, 'status could should be 0');
    bufferContains(t, res.stdout, 'Wrote 2 blob(s)');

    var edited = fs.readFileSync(target);
    bufferContains(t, edited, '- secure: ');

    maybeUnlink(target);
    t.end();
  });
});

test('it can write given data to a key in .travis.yml', function (t) {
  var fixturesDir = path.join(__dirname, 'fixtures');
  var target = path.join(fixturesDir, '.travis.yml');
  var source = path.join(fixturesDir, 'travis.original.yml');

  maybeUnlink(target);
  fs.writeFileSync(
    target,
    fs.readFileSync(source)
  );

  spawn(['-r', 'pwmckenna/node-travis-encrypt', '--add', 'addons.addTest', 'testing'], {
    cwd: path.join(__dirname, 'fixtures')
  }, function (res) {
    t.equal(res.status, 0, 'status could should be 0');
    bufferContains(t, res.stdout, 'Wrote 1 blob(s)');

    var edited = fs.readFileSync(target);
    bufferContains(t, edited, 'addTest:');
    bufferContains(t, edited, '- secure: ');

    maybeUnlink(target);

    t.end();
  });
});

function maybeUnlink (target) {
  try {
    fs.unlinkSync(target);
  } catch (e) {}
}

function spawn (args, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var script = path.join(__dirname, '..', 'bin', 'travis-encrypt-cli.js');
  var proc = childProc.spawn('node', [script].concat(args), opts);
  var stderr, stdout;

  proc.stdout.pipe(concat(function (res) {
    stdout = res;
  }));

  proc.stderr.pipe(concat(function (res) {
    stderr = res;
  }));

  proc.on('close', function (code) {
    cb({
      status: code,
      stdout: stdout.toString(),
      stderr: stderr.toString()
    });
  });

  proc.stdin.end();
}

function bufferContains (t, buffer, str) {
  var asString = buffer.toString();
  var containsStr = asString.indexOf(str) !== -1;

  if (!containsStr) {
    return t.fail(
      'String did not contain substring. Expected:\n' +
      '"' + str + '", got:\n' +
      '"' + asString + '"'
    );
  }

  t.assert(containsStr, 'buffer should contain "' + str + '"');
}

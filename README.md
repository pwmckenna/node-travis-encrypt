# travis-encrypt
Encrypt environment variables for use in your travis-ci .travis.yml configuration files. Now supports Travis-ci Pro!

## Installation

On Debian/Ubuntu, you should install **nodejs-legacy** not
**nodejs** (see [Stackoverflow](http://stackoverflow.com/questions/21168141/can-not-install-packages-using-node-package-manager-in-ubuntu)
for more details). Then install via your preferred method, for example
npm:

```bash
% sudo apt-get install nodejs-legacy npm
% npm install pwmckenna/node-travis-encrypt
```

## CLI
```bash
Usage: travis-encrypt -r [repository slug] -u [username] -p [password] -a

Options:
  -r, --repo        repository slug                                                   [string]
  -u, --username    github username associated with the pro travis repo               [string]
  -p, --password    github password for the user associated with the pro travis repo  [string]
  -a, --add         add it to .travis.yml under the given key or `env.global`         [string]
```

##### args
```bash
travis-encrypt -r pwmckenna/node-travis-encrypt ENV1=VALUE1
> # ENV1
> fsqKj4hKmeB8T28xIkrYZqwM6i9CMvOnUUGXcxgvcroBQyNn/0lNX68UTcjyOmW8oE4yOyHJ+rWLp6qEG \
> Rjxi+LG/lIqx27bAwIJbEnOZfxBuGCkJrlymsEKz7efE8b2nwgBXzeVNNhu4eg76IwMcgXL5QxrsYhwRMyXGcsOcBA=
```

##### stdin
```bash
echo ENV1=VALUE1 ENV2=VALUE2 | ./bin/travis-encrypt-cli.js -r pwmckenna/node-travis-encrypt
> # ENV1
> dSVtmeY8PRGTwze0dQJs/PazSbWUtF81w374t9CHWP9/JafgLjxgp6WHQR+RF+3VW74LlgOvD4q1XN2KT+nsN0 \
> wfeDNlBfD+Ekp1Ohh/Hjgu0957tq8907+KPIjAwJ9xnbd1y37wnjHyMUxLBcMrjzc+m1Vbx5E2gNEeMvApN28=
> # ENV2
> eA9USvpYLcLYzmWkrBqNm7baojEp+TfpsYTzHoGXDTlqsX0K7yKRsGtm7bHPOBSBRI6y71iT752NQn93broqwN \
> 9THCR/ZEYGGA1JgoNrsKYlDFp9G00tTobIoFygDUy940W5X0fySJU87dxLTaGxcbfMkKFAPamnpSEQI2Jkyso=
```

##### using `--username` & `--password` for Travis-ci Pro
```bash
travis-encrypt -r pwmckenna/private-repo -u pwmckenna -p password EXAMPLE_ENV_VARIABLE
> # EXAMPLE_ENV_VARIABLE
> fsqKj4hKmeB8T28xIkrYZqwM6i9CMvOnUUGXcxgvcroBQyNn/0lNX68UTcjyOmW8oE4yOyHJ+rWLp6qEG \
> Rjxi+LG/lIqx27bAwIJbEnOZfxBuGCkJrlymsEKz7efE8b2nwgBXzeVNNhu4eg76IwMcgXL5QxrsYhwRMyXGcsOcBA=
```

Take the output and add it as secure environment variables in your *.travis.yml* file.
```yml
language: node_js
node_js:
    - 0.8
env:
    global:
        - secure: "XqJtWxYjtjhRO3LzC/iBGLawDP+f/dL6kcUfDzDJPSKhdnXIRQgBE65g58hf1bPh4YowxuyPUnpK5pq6+frYQ6zNsW0AWBMa2dUP1FdSIxdCJNa3UHlMLYhqqECuVvev9A9NCijKBkuOOA+OvNgq9NIQsiS4g+dsaAlpuE72MYc="
```

##### using --add to populate .travis.yml
```bash
travis-encrypt --add -r pwmckenna/node-travis-encrypt ENV1=VALUE1 ENV2=VALUE2
> Wrote 2 blob(s) to .travis.yml
```

##### using --add to populate .travis.yml with Heroku deploy key
```bash
travis-encrypt --add deploy.api_key -r pwmckenna/node-travis-encrypt "<Heroku API key>"
> Wrote 1 blob(s) to .travis.yml
```

## Module
```js
var encrypt = require('travis-encrypt');
encrypt({
  repo: 'pwmckenna/node-travis-encrypt',
  data: 'EXAMPLE_ENV_VARIABLE=asdf'
}, function (err, blob) {
  // do something with the encrypted data blob...
});

// also supports encrypting for private travis pro repos,
// though it needs your github credentials to login to travis pro.
encrypt({
  repo: 'pwmckenna/private-repo',
  data: 'EXAMPLE_ENV_VARIABLE=asdf',
  username: 'username',
  password: 'password'
}, function (err, blob) {
  // do something with the encrypted data blob...
});
```

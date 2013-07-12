# travis-encrypt
Encrypt environment variables for use in your travis-ci .travis.yml configuration files. Now supports Travis-ci Pro!

## CLI
```bash
Usage: travis-encrypt -r [repository slug] -n [name] -v [value] -j [json file] -u [username] -p [password]

Options:
  -r, --repo        repository slug                                                   [string]
  -n, --name        environment variable name to encrypt                              [string]
  -v, --value       environment variable value to encrypt                             [string]
  -j, --json        json file with variables to encrypt                               [string]
  -u, --username    github username associated with the pro travis repo               [string]
  -p, --password    github password for the user associated with the pro travis repo  [string]
```

##### using `--name` & `--value`
```bash
travis-encrypt -r pwmckenna/node-travis-encrypt -n EXAMPLE_ENV_VARIABLE -v asdf
> # EXAMPLE_ENV_VARIABLE
> fsqKj4hKmeB8T28xIkrYZqwM6i9CMvOnUUGXcxgvcroBQyNn/0lNX68UTcjyOmW8oE4yOyHJ+rWLp6qEG \
> Rjxi+LG/lIqx27bAwIJbEnOZfxBuGCkJrlymsEKz7efE8b2nwgBXzeVNNhu4eg76IwMcgXL5QxrsYhwRMyXGcsOcBA=
```

##### using `--json`
```bash
travis-encrypt -r pwmckenna/node-travis-encrypt -j config.json
> # API_KEY
> EkIAdybOOkDIxHJ2CbDjznQzGawrdSjP6pqBmKtKHFX5H8A5cduBR+zrYh/m5N0p6gl/ttJYjhu6S94QF5PISv \
> 9zHUceVNC4p4mG90X/ozn2yMU7PiI8Bv/sq+c26jwBoXiH6NsmvB5kj0yA2Nj331s9wIiSOn0TNhI33LP5d/s=
> # API_SECRET
> d88/OV73Y30VXccYuCc31TwuqkWS4zrTpSTCwCop+655QteiSI/wGI9b202w+LmorLlV5n33CA74SETz0NAqMG \
> U6vbppz8cNEwgKfzUYXcwv9o5DfDACpLw8AcgGeYG3890oBKjIr9OIzJOONTND+6XarOueKLgwouuXUwqc1FM=
> # EXPRESS_SESSION_SECRET
> DwKevRdW4YacvZj3nAQI2kLQo5wiGH4PzT/xB2t9IpdnfJ6DMBSoqpavWQGbXfD9ZzN7DgnBvFmvm295LdqIlY \
> Zc/K0rFFKvQYNCJzKNxxBPTcos3kjDBOgAd2PEgZFGnMfBY59HMqyYnscJEn/3FHi0ju8HRXn0+09KllERLj4=
```

##### using `--username` & `--password` for Travis-ci Pro
```bash
travis-encrypt -r pwmckenna/private-repo -n EXAMPLE_ENV_VARIABLE -v asdf -u pwmckenna -p password
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

## Module
```js
var encrypt = require('travis-encrypt');
encrypt('pwmckenna/node-travis-encrypt', 'EXAMPLE_ENV_VARIABLE=asdf', function (err, blob) {
  // do something with the encrypted data blob...
});

// also supports encrypting for private travis pro repos, 
// though it needs your github credentials to login to travis pro.
encrypt('pwmckenna/private-repo', 'EXAMPLE_ENV_VARIABLE=asdf', username, password, function (err, blob) {
  
});
```
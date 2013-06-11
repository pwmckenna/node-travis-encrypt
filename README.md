# travis-encrypt
Encrypt environment variables for use in your travis-ci .travis.yml configuration files.

## CLI
```bash
Usage: travis-encrypt -r [repository slug] -n [name] -v [value] -j [json file]

Options:
  -r, --repo   repository slug                        [string]
  -n, --name   environment variable name to encrypt   [string]
  -v, --value  environment variable value to encrypt  [string]
  -j, --json   json file with variables to encrypt    [string]
```

##### using `--name` & `--value`
```bash
travis-encrypt -r pwmckenna/travis-encrypt -n EXAMPLE_ENV_VARIABLE -v asdf
> # EXAMPLE_ENV_VARIABLE
> fsqKj4hKmeB8T28xIkrYZqwM6i9CMvOnUUGXcxgvcroBQyNn/0lNX68UTcjyOmW8oE4yOyHJ+rWLp6qEG \
> Rjxi+LG/lIqx27bAwIJbEnOZfxBuGCkJrlymsEKz7efE8b2nwgBXzeVNNhu4eg76IwMcgXL5QxrsYhwRMyXGcsOcBA=
```

##### using `--json`
```bash
travis-encrypt -r pwmckenna/travis-encrypt -j config.json
> # API_KEY
> EkIAdybOOkDIxHJ2CbDjznQzGawrdSjP6pqBmKtKHFX5H8A5cduBR+zrYh/m5N0p6gl/ttJYjhu6S94QF5PISv \
> 9zHUceVNC4p4mG90X/ozn2yMU7PiI8Bv/sq+c26jwBoXiH6NsmvB5kj0yA2Nj331s9wIiSOn0TNhI33LP5d/s=
> # PORT
> d88/OV73Y30VXccYuCc31TwuqkWS4zrTpSTCwCop+655QteiSI/wGI9b202w+LmorLlV5n33CA74SETz0NAqMG \
> U6vbppz8cNEwgKfzUYXcwv9o5DfDACpLw8AcgGeYG3890oBKjIr9OIzJOONTND+6XarOueKLgwouuXUwqc1FM=
> # EXPRESS_SESSION_SECRET
> DwKevRdW4YacvZj3nAQI2kLQo5wiGH4PzT/xB2t9IpdnfJ6DMBSoqpavWQGbXfD9ZzN7DgnBvFmvm295LdqIlY \
> Zc/K0rFFKvQYNCJzKNxxBPTcos3kjDBOgAd2PEgZFGnMfBY59HMqyYnscJEn/3FHi0ju8HRXn0+09KllERLj4=
```

Take the output and add it as secure environment variables in your *.travis.yml* file.
> ```yml
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
encrypt('pwmckenna/travis-encrypt', 'EXAMPLE_ENV_VARIABLE=asdf').then(function (res) {
  // do something with res...
});

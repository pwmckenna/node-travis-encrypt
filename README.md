# Travis-encrypt
Encrypt environment variables for use in your travis-ci .travis.yml configuration files.

## CLI
```bash
Usage: travis-encrypt --slug [repository slug] --data [data to encrypt]

Options:
  -s, --slug  [string]  [required]
  -d, --data  [string]  [required]
```

```bash
travis-encrypt -s pwmckenna/travis-encrypt -d EXAMPLE_ENV_VARIABLE=asdf
> XqJtWxYjtjhRO3LzC/iBGLawDP+f/dL6kcUfDzDJPSKhdnXIRQgBE65g58hf1bPh4YowxuyPUnpK5pq6+frYQ6 \
zNsW0AWBMa2dUP1FdSIxdCJNa3UHlMLYhqqECuVvev9A9NCijKBkuOOA+OvNgq9NIQsiS4g+dsaAlpuE72MYc=
```
Take that variable and add its as a secure environment variable in your *.travis.yml* file.
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

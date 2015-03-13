System.config({
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "transduce-reduce": "npm:transduce-reduce@^0.1.0",
    "github:jspm/nodelibs@0.0.5": {
      "Base64": "npm:Base64@^0.2.0",
      "ripemd160": "npm:ripemd160@^0.2.0",
      "base64-js": "npm:base64-js@^0.0.4",
      "inherits": "npm:inherits@^2.0.1",
      "ieee754": "npm:ieee754@^1.1.1",
      "pbkdf2-compat": "npm:pbkdf2-compat@^2.0.1",
      "sha.js": "npm:sha.js@^2.2.6",
      "json": "github:systemjs/plugin-json@^0.1.0"
    },
    "npm:Base64@0.2.1": {},
    "npm:base64-js@0.0.4": {},
    "npm:ieee754@1.1.4": {},
    "npm:inherits@2.0.1": {},
    "npm:iterator-protocol@0.1.0": {
      "transduce-util": "npm:transduce-util@~0.1.0"
    },
    "npm:pbkdf2-compat@2.0.1": {},
    "npm:ripemd160@0.2.0": {},
    "npm:sha.js@2.3.0": {},
    "npm:transduce-reduce@0.1.0": {
      "transformer-protocol": "npm:transformer-protocol@~0.1.0",
      "iterator-protocol": "npm:iterator-protocol@~0.1.0",
      "transduce-reduced": "npm:transduce-reduced@~0.1.0",
      "transduce-util": "npm:transduce-util@~0.1.0"
    },
    "npm:transduce-reduced@0.1.0": {},
    "npm:transduce-util@0.1.0": {},
    "npm:transformer-protocol@0.1.0": {
      "transduce-util": "npm:transduce-util@0.1.0"
    }
  }
});

System.config({
  "versions": {
    "github:jspm/nodelibs": "0.0.5",
    "github:systemjs/plugin-json": "0.1.0",
    "npm:Base64": "0.2.1",
    "npm:base64-js": "0.0.4",
    "npm:ieee754": "1.1.4",
    "npm:inherits": "2.0.1",
    "npm:iterator-protocol": "0.1.0",
    "npm:pbkdf2-compat": "2.0.1",
    "npm:ripemd160": "0.2.0",
    "npm:sha.js": "2.3.0",
    "npm:transduce-reduce": "0.1.0",
    "npm:transduce-reduced": "0.1.0",
    "npm:transduce-util": "0.1.0",
    "npm:transformer-protocol": "0.1.0"
  }
});


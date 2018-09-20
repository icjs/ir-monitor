IrMonitor
=========

[![CircleCI](https://circleci.com/gh/ldcc/irc-keyring/tree/master.svg?style=svg)](https://circleci.com/gh/ldcc/irc-keyring/tree/master)

An IrChain monitor to hint user real-time reality that transactions information.

after 30 block

Examples
--------

```js
const Provider = require('irc.js').HttpProvider;
const Monitor = require('./src/monitor');

const monitor = new Monitor({
  provider: new Provider('http...'),  // your custom provider here
  confirm: console.log,               // your confirm callback here
  notify: console.log,                // your notify callback here
});

monitor.add('');                      // add an address you want to monitor
```

More details to check this [example][example link] for a quick overview.

[example link]: https://github.com/icjs/ir-monitor/blob/master/example.js

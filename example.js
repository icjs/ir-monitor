const Provider = require('irc.js').HttpProvider;
const Monitor = require('./src/monitor');

// const provider = new Provider('http://112.74.96.198:8545/');
const provider = new Provider('http://localhost:8545/');

const confirm = (txInfo) => {
  console.log('===========================================');
  console.log(txInfo);
  console.log('===========================================');
};

const notify = (txInfo) => {
  console.log('===========================================');
  console.log(txInfo);
  console.log('===========================================');
};

const monitorredes = {
  '0xb3f1507591583ebf14b5b31d134d700c83c20fa1': true,
};

const monitor = new Monitor({
  provider: provider,
  confirm: confirm,
  notify: notify,
  monitorredes: monitorredes
});

monitor.add('0xd0ca89a6d9435a6a4857c1083f165af01fbfda7d');

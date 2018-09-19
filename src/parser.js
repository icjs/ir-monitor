const fs = require('fs');
const BN = require('bn.js');
const Provider = require('irc.js').HttpProvider;
const abiCoder = require('irc.js').abi;
const host = 'https://scan.irchain.io/token/irc_contract_metadata/';
const provider = new Provider('', 2000);
const tokens_info = require('./lib/tokens-data');
let blockStart = new BN('0', 16);

function fetchTokens(callback) {
  const param = '?format=json&height_start=' + blockStart.toString();
  provider.host = host + param;
  provider.sendAsync(null, (err, result) => {
    if (!err) {
      const blockNumber = new BN(result.d[0].block);
      blockStart.lt(blockNumber) && (blockStart = blockNumber);
      result.d.filter(token => !tokens_info[token.token]).forEach(token =>
          tokens_info[token.token] = {
            name: token.name,
            symbol: token.symbol,
          });
      fs.writeFileSync('./src/lib/tokens-data.json', JSON.stringify(tokens_info));
      if (typeof callback === 'function') {
        callback(Object.assign(tokens_info));
      }
    }
  });
}

fetchTokens();

function parse(address, input) {
  const token = tokens_info[address];
  if (token) {
    const data = abiCoder.decodeMethod(input);
    return Object.assign({token, input: data});
  }
}

module.exports = {
  tokens_info: Object.assign(tokens_info),
  fetchTokens: fetchTokens,
  parse: parse,
};

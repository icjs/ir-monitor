const IrcQuery = require('irc.js').Query;
const IrcContract = require('irc.js').Contract;
const abi = require('irc.js').abi.stdTokenAbi;
const BN = require('bn.js');

function Wallet(provider) {

  const query = new IrcQuery(provider);
  const token = new IrcContract(query)(abi).at();

  this.hintIrcer = (tx, hint) => {
    return (o) => query.getBalance(o).then(b => hint({...tx, ircer: strify(b), hintTo: o}));
  };

  this.hintToken = (tx, hint) => {
    token.address = tx.to;
    return (o) => token.balanceOf(o).then(b => hint({...tx, toker: strify(b), hintTo: o}));
  };
}

module.exports = Wallet;

const zero = new BN(0);
const decimals = 18;

function strify([balance]) {
  if (balance.eq(zero)) {
    return '0';
  }

  if (decimals === 0) {
    return balance.toString();
  }

  let bal = balance.toString();
  let len = bal.length;
  let decimalIndex = len - decimals;
  let prefix = '';

  if (decimalIndex <= 0) {
    while (prefix.length <= decimalIndex * -1) {
      prefix += '0';
      len++;
    }
    bal = prefix + bal;
    decimalIndex = 1;
  }

  return `${bal.substr(0, len - decimals)}.${bal.substr(decimalIndex, 3)}`;
}

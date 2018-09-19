const parser = require('./parser');
const {
  MAX_LEN,
  CONFIRM,
  NOTIFY,
} = require('./lib/enum');

function Queue() {
  const txsCache = {};
  const txsBlock = [];

  /**
   * @param {string} block: the position of which block
   * @param {array} originTxs: the transactions from this block
   * @param {function} hint: an callback to hind user
   */
  this.inQueue = function(block, originTxs, hint) {
    if (originTxs === []) return;
    parser.fetchTokens(() => {
      const txs = originTxs.map(Tx);
      if (txsBlock.length >= MAX_LEN) {
        const dueBlock = txsBlock.shift();
        const dueTxs = txsCache[dueBlock];
        delete txsCache[dueBlock];
        hint(CONFIRM, dueBlock, dueTxs);
      }
      txsBlock.push(block);
      txsCache[block] = txs;
      hint(NOTIFY, block, txs);
    });
  };
}

module.exports = new Queue();

/**
 * @namespace tx.from
 * @namespace tx.to
 * @namespace tx.value
 * @namespace tx.input
 */
function Tx(tx = {}) {
  return Object.assign({
    from: tx.from,
    to: tx.to,
    value: tx.value,
  }, parser.parse(tx.to, tx.input));
}

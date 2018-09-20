const parser = require('./parser');
const {
  MIN_LEN,
  MAX_LEN,
  CONFIRM,
  NOTIFY,
} = require('./lib/enum');


function Queue(opt = {}) {
  const txsCache = {};
  const txsBlock = [];

  /** @namespace opt.confirmSpacing */
  const spacing = opt.confirmSpacing || MIN_LEN;
  this.spacing = spacing > MAX_LEN ? MAX_LEN : spacing;

  /**
   * @param {string} block: the position of which block
   * @param {array} originTxs: the transactions from this block
   * @param {function} hint: an callback to hind user
   */
  this.inQueue = function(block, originTxs, hint) {
    if (originTxs === []) return;
    parser.fetchTokens(() => {
      const txs = originTxs.map(Tx);
      if (txsBlock.length >= this.spacing) {
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
  return {
    from: tx.from,
    to: tx.to,
    value: tx.value,
    ...parser.parse(tx.to, tx.input),
  };
}

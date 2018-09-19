const BlockTracker = require('irc-block-tracker');
const EventEmitter = require('events').EventEmitter;
const BN = require('bn.js');
const Wallet = require('./wallet');
const queue = require('./queue');
const {
  CONFIRM,
  NOTIFY,
} = require('./lib/enum');

class Monitor extends EventEmitter {

  constructor(opts = {}) {
    super();

    this.confirm = opts.confirm || console.log;
    this.notify = opts.notify || console.log;

    this.provider = opts.provider;
    this.blockTracker = new BlockTracker({
      provider: this.provider,
      pollingInterval: opts.pollingInterval || 4000,
    });
    this.blockTracker.on('latest', this.updateTxs.bind(this));
    this.blockNumber = null;
    this.wallet = new Wallet(this.provider);
    this.queue = queue;
    this.monitorredes = opts.monitorredes || {};
    this.running = true;
  }

  /**
   * @namespace tx.from: an tx from whos sends
   * @namespace tx.to: an tx to whos recipients
   * @namespace tx.value: the number of ircer on this tx
   * @namespace tx.token.name: the token name iff whos sends to an contract
   * @namespace tx.token.symbol: the token symbol iff whos sends to an contract
   * @namespace tx.input.name: the calling operate name iff whos sends to an contract
   * @namespace tx.input.params: the calling operate input parmas iff whos sends to an contract
   */
  hint(type, block, txs) {
    const hint = this.pickHint(type);
    txs.forEach(tx => {
      const hindList = [];
      //  hint sender
      if (this.monitorredes[tx.from]) {
        hindList.push(tx.from);
      }
      //  hind recipient
      if (this.monitorredes[tx.to]) {
        hindList.push(tx.to);
      }

      tx.block = block;
      // const wallet = this.wallet;
      const hinting = tx.token ? this.wallet.hintToken : this.wallet.hintIrcer;

      hindList.forEach(hinting(tx, hint));
    });
  }

  /**
   * @namespace block.number
   * @namespace block.timestamp
   * @namespace block.transactions
   */
  async updateTxs(block) {
    const blockNumber = new BN(block.number.slice(2), 16);
    this.blockNumber || (this.blockNumber = blockNumber);
    if (this.blockNumber.lt(blockNumber)) {
      this.blockNumber = blockNumber;
      const txs = block.transactions;
      this.queue.inQueue(blockNumber.toString(), txs, this.hint.bind(this));
    }
  }

  pickHint(type) {
    switch (type) {
      case CONFIRM:
        return this.confirm;
      case NOTIFY:
        return this.notify;
    }
  }

  add(address) {
    this.monitorredes[address] = true;
  }

  start() {
    if (!this.running) {
      this.running = true;
      this.blockTracker.on('latest', this.updateTxs.bind(this));
    }
  }

  stop() {
    if (this.running) {
      this.running = false;
      this.blockTracker.removeAllListeners();
    }
  }
}

module.exports = Monitor;

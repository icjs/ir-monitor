const Provider = require('irc.js').HttpProvider;
const BlockTracker = require('irc-block-tracker');
const EventEmitter = require('events').EventEmitter;
const BN = require('bn.js');
const Wallet = require('./wallet');
const queue = require('./queue');
const {
  CONFIRM,
  NOTIFY,
  MAINNET_URL,
} = require('./lib/enum');

class Monitor extends EventEmitter {

  constructor(opts = {}) {
    super();

    this.confirm = opts.confirm || console.log;
    this.notify = opts.notify || console.log;

    this.monitorredes = {};
    opts.monitorredes = opts.monitorredes || [];
    opts.monitorredes.forEach(address => this.monitorredes[address] = true);

    this.provider = opts.provider || new Provider(MAINNET_URL);
    this.blockTracker = new BlockTracker({
      provider: this.provider,
      pollingInterval: opts.pollingInterval || 4000,
    });
    this.blockTracker.on('latest', this.updateTxs.bind(this));
    this.blockNumber = null;
    this.wallet = new Wallet(this.provider);
    this.queue = queue;
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
      tx.block = block;

      const hinting = tx.token ? this.wallet.hintToken : this.wallet.hintIrcer;
      const hindList = {};
      // hint sender
      if (this.monitorredes[tx.from]) {
        hindList[tx.from] = true;
      }
      // hint recipient
      if (this.monitorredes[tx.to]) {
        hindList[tx.to] = true;
      }
      // hint others
      const params = tx.input.params;
      for (let i = 0; i < params.length; i++) {
        const param = tx.input.params[i];
        params[i].type === 'address' &&
        this.monitorredes[param.value] &&
        (hindList[param.value] = true);
      }

      Object.keys(hindList).forEach(hinting(tx, hint));
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

  subscribe(address) {
    this.monitorredes[address] = true;
  }

  unsubscribe(address) {
    delete this.monitorredes[address];
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

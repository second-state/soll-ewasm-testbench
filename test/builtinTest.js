const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/builtinTest.wasm';
const deployWasmFile = './test/builtinTest.deploy.wasm';

describe('builtinTest', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    testMsgSender: '81f27b03',
    testMsgValue: '59bd3a5d',
    testMsgData: '66e7cea9',
    testBlockCoinbase: '783cb332',
    testBlockDifficulty: '3d02fb66',
    testBlockGasLimit: '4a42dec0',
    testBlockNumber: '98f6f550',
    testBlockTimestamp: '3932a4ff',
    testBlockHash: '0d4295a8',
    testGasLeft: 'e44059e7',
    testTxGasPrice: '07eb8209',
    testTxOrig: 'ae85a906',
    testKeccak256: '78383f2b',
    testAddressBalance: '9fa9e2e6',
    testThis: 'b658ed64',
    testEvent: '24ec1d3f',
  };
  let storage = '{}';

  it('deploy', done => {
    const deployWasmBin = fs.readFileSync(deployWasmFile);
    const wasmBin = fs.readFileSync(wasmFile);
    const env = {};
    main(deployWasmFile, utils.toHex(deployWasmBin), storage, env).then(result => {
      assert.equal(result.returnData, utils.toHex(wasmBin));
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('check msg.sender', done => {
    const callData = functionSignature.testMsgSender;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['0'], '1234567890123456789012345678901234567890');
    }).then(done).catch(err => done(err));
  });

  it('check msg.value', done => {
    const callData = functionSignature.testMsgValue;
    const env = {
      callValue: '1234'
    };
    main(wasmFile, callData, storage, env).then(result => {
      assert.equal(JSON.parse(result.storage)['1'], '1234');
    }).then(done).catch(err => done(err));
  });

  it('check msg.data', done => {
    const callData = functionSignature.testMsgData;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['2'], '66e7cea900000000000000000000000000000000000000000000000000000008');
    }).then(done).catch(err => done(err));
  });

  it('check block.coinbase', done => {
    const callData = functionSignature.testBlockCoinbase;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['3'], '1234567890123456789012345678901234567890');
    }).then(done).catch(err => done(err));
  });

  it('check block.difficulty', done => {
    const callData = functionSignature.testBlockDifficulty;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['4'], '405bbd86ca28');
    }).then(done).catch(err => done(err));
  });

  it('check block.gaslimit', done => {
    const callData = functionSignature.testBlockGasLimit;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['5'], '5208');
    }).then(done).catch(err => done(err));
  });

  it('check block.number', done => {
    const callData = functionSignature.testBlockNumber;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['6'], 'd80');
    }).then(done).catch(err => done(err));
  });

  it('check block.timestamp', done => {
    const callData = functionSignature.testBlockTimestamp;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['7'], '1a0a');
    }).then(done).catch(err => done(err));
  });

  it('check blockhash(uint)', done => {
    const bk = '1234';
    const callData = functionSignature.testBlockHash + utils.to256CallData(bk);
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['8'], '1234567890123456789012345678901234567890123456789012345678901234');
    }).then(done).catch(err => done(err));
  });

  it('check gasleft()', done => {
    const callData = functionSignature.testGasLeft;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['9'], 'fff8');
    }).then(done).catch(err => done(err));
  });

  it('check tx.gasprice', done => {
    const callData = functionSignature.testTxGasPrice;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['a'], '1f3f33ff5fabc5fdff67890feff12345');
    }).then(done).catch(err => done(err));
  });

  it('check tx.origin', done => {
    const callData = functionSignature.testTxOrig;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['b'], '1234567890123456789012345678901234567890');
    }).then(done).catch(err => done(err));
  });

  it('check keccak256(bytes)', done => {
    const callData = functionSignature.testKeccak256;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['e'], 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
    }).then(done).catch(err => done(err));
  });

  it('check address.balance', done => {
    const callData = functionSignature.testAddressBalance;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['f'], '12345678901234567890123456789012');
    }).then(done).catch(err => done(err));
  });

  it('check this', done => {
    const callData = functionSignature.testThis;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['10'], '5e72914535f202659083db3a02c984188fa26e9f');
    }).then(done).catch(err => done(err));
  });

  it('check event', done => {
    const callData = functionSignature.testEvent;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.transactionReceipt.data, '00000000000000000000000000000000000000000000000000000000000001c8');
      assert.equal(result.transactionReceipt.topics[0], 'e9b9381c33cd3a4b41d7c0f0c70a8bb84387e96ff0a4abf2b9dfe092f73609dd');
      assert.equal(result.transactionReceipt.topics[1], '0000000000000000000000001234567890123456789012345678901234567890');
      assert.equal(result.transactionReceipt.topics[2], '000000000000000000000000000000000000000000000000000000000000007b');
    }).then(done).catch(err => done(err));
  });
});
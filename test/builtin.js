const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/builtin.wasm';
const deployWasmFile = './test/builtin.deploy.wasm';

describe('Solidity builtin', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    testMsgSender: 'd81bebb9',
    testMsgValue: 'a94b16d0',
    testMsgData: '0eec3364',
    testBlockCoinbase: 'a4f45e8b',
    testBlockDifficulty: 'b0d49a89',
    testBlockGasLimit: '81c17482',
    testBlockNumber: 'e970e86d',
    testBlockTimestamp: '0169f732',
    testBlockHash: '6c1bf16b',
    testGasLeft: '24ad3920',
    testTxGasPrice: '54ca3ee5',
    testTxOrig: '8b038f2d',
    testKeccak256: 'c8ec99f1',
    testAddressBalance: '1753752e',
    testThis: '90be6c1d',
    testEvent: '4f9d719e',
    testEncode: '42011ac9',
    testEncodePacked: 'fbc2d64d',
  };
  let storage = '{}';

  it('deploy', done => {
    const deployWasmBin = fs.readFileSync(deployWasmFile);
    const wasmBin = fs.readFileSync(wasmFile);
    main(deployWasmFile, utils.toHex(deployWasmBin), storage).then(result => {
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
      assert.equal(JSON.parse(result.storage)['2'], 'eec336400000000000000000000000000000000000000000000000000000008');
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
      assert.equal(JSON.parse(result.storage)['c'], 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
    }).then(done).catch(err => done(err));
  });

  it('check address.balance', done => {
    const callData = functionSignature.testAddressBalance;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['d'], '12345678901234567890123456789012');
    }).then(done).catch(err => done(err));
  });

  it('check this', done => {
    const callData = functionSignature.testThis;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['e'], '5e72914535f202659083db3a02c984188fa26e9f');
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

  it('check abi.encode', done => {
    const callData = functionSignature.testEncode;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"f":"3c1","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac802":"11","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac803":"2222","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac804":"33333333","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac805":"123","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac806":"c0","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac807":"1a0","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac808":"c0","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac809":"44444444444444444","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80a":"5555555555555555555555555555555555","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80b":"1","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80c":"80","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80d":"b","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80e":"5365636f6e645374617465000000000000000000000000000000000000000000","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac80f":"4","8d1108e10bcb7c27dddfc02ed9d693a074039d026cf4ea4240b40f7d581ac810":"534f4c4c00000000000000000000000000000000000000000000000000000000"}');
    }).then(done).catch(err => done(err));
  });

  it('check abi.encodePacked', done => {
    const callData = functionSignature.testEncodePacked;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"10":"c3","1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672":"1100002222000000003333333300000000000000000000000000000000000001","1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae673":"2300000000000000044444444444444444000000000000000000000000000000","1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae674":"5555555555555555555555555555555555015365636f6e645374617465534f4c","1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae675":"4c00000000000000000000000000000000000000000000000000000000000000"}');
    }).then(done).catch(err => done(err));
  });
});
const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/builtinYul.wasm';

describe('Yul/in-line assembly builtin', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    testDispatch: '00000001',
    testPayable: '00000002',
    testStorageMemory: '00000003',
    testEvent: '00000004',
  };
  let storage = '{}';

  it('check calldatasize() and calldataload()', done => {
    const callData = functionSignature.testDispatch;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)[0], '1');
    }).then(done).catch(err => done(err));
  });

  it('check callvalue() and revert()', done => {
    const callData = functionSignature.testPayable;
    const env = {
      callValue: '1234'
    };
    main(wasmFile, callData, storage, env).then(result => {
      assert.equal(result.transactionReceipt.revertReason, 'Function is not payable');
    }).then(done).catch(err => done(err));
  });

  it('check memory load/store, storage load/store', done => {
    const callData = functionSignature.testStorageMemory;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(JSON.parse(result.storage)['0'], '6162630000000000000000000000000000000000000000000000000000000000');
      assert.equal(JSON.parse(result.storage)['1'], '6162630000000000000000000000000045000000000000000000000000000000');
    }).then(done).catch(err => done(err));
  });

  it('check keccak256, caller() and log3()', done => {
    const callData = functionSignature.testEvent;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.transactionReceipt.data, '00000000000000000000000000000000000000000000000000000000000001c8');
      assert.equal(result.transactionReceipt.topics[0], 'e9b9381c33cd3a4b41d7c0f0c70a8bb84387e96ff0a4abf2b9dfe092f73609dd');
      assert.equal(result.transactionReceipt.topics[1], '0000000000000000000000001234567890123456789012345678901234567890');
      assert.equal(result.transactionReceipt.topics[2], '000000000000000000000000000000000000000000000000000000000000007b');
    }).then(done).catch(err => done(err));
  });
});
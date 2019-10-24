const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/erc20.wasm';
const deployWasmFile = './test/erc20.deploy.wasm';

describe('erc20', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    allowance: 'dd62ed3e',
    approve: '095ea7b3',
    balanceOf: '70a08231',
    totalSupply: '18160ddd',
    transfer: 'a9059cbb',
    transferFrom: '23b872dd',
  };
  let storage = '{}';

  it('deploy', done => {
    const deployWasmBin = fs.readFileSync(deployWasmFile);
    const wasmBin = fs.readFileSync(wasmFile);
    const env = {caller: '7fffffff'};
    main(deployWasmFile, utils.toHex(deployWasmBin), storage, env).then(result => {
      assert.equal(result.returnData, utils.toHex(wasmBin));
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('check balance of 0x7fffffff', done => {
    const address = '0x7fffffff';
    const callData = functionSignature.balanceOf + utils.to256CallData(address);
    main(wasmFile, callData, storage).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1000);
    }).then(done).catch(err => done(err));
  });

  it('check total supply', done => {
    const callData = functionSignature.totalSupply;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1000);
    }).then(done).catch(err => done(err));
  });

  it('transfer 20 from 0x7fffffff to 0x01', done => {
    const to = '0x01';
    const amount = 20;
    const callData = functionSignature.transfer + utils.to256CallData(to) + utils.to256CallData(amount);
    const env = {caller: '7fffffff'};
    main(wasmFile, callData, storage, env).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1);
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('check balance of 0x01', done => {
    const address = '01';
    const callData = functionSignature.balanceOf + utils.to256CallData(address);
    main(wasmFile, callData, storage).then(result => {
      assert.equal(parseInt(result.returnData, 16), 20);
    }).then(done).catch(err => done(err));
  });

  it('approve 10 from 0x7fffffff for 0x01 to spend', done => {
    const address = '0x01';
    const amount = 10;
    const callData = functionSignature.approve + utils.to256CallData(address) + utils.to256CallData(amount);
    const env = {caller: '7fffffff'};
    main(wasmFile, callData, storage, env).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1);
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('check allowance from 0x7fffffff by 0x01', done => {
    const owner = '0x7fffffff';
    const sender = '0x01';
    const callData = functionSignature.allowance + utils.to256CallData(owner) + utils.to256CallData(sender);
    main(wasmFile, callData, storage).then(result => {
      assert.equal(parseInt(result.returnData, 16), 10);
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('transfer 3 from 0x7fffffff by 0x01 to 0x02', done => {
    const sender = '0x7fffffff';
    const recipient = '0x02';
    const amount = 3;
    const callData = functionSignature.transferFrom + utils.to256CallData(sender)
      + utils.to256CallData(recipient) + utils.to256CallData(amount);
    const env = {caller: '01'};
    main(wasmFile, callData, storage, env).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1);
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

  it('check balance of 0x7fffffff', done => {
    const address = '0x7fffffff';
    const callData = functionSignature.balanceOf + utils.to256CallData(address);
    main(wasmFile, callData, storage).then(result => {
      assert.equal(parseInt(result.returnData, 16), 1000 - 20 - 3);
      storage = result.storage;
    }).then(done).catch(err => done(err));
  });

});

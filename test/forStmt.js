const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/forStmt.wasm';
const deployWasmFile = './test/forStmt.deploy.wasm';

describe('forStmt', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    add: '771602f7',
  };

  it('deploy', done => {
    const deployWasmBin = fs.readFileSync(deployWasmFile);
    const wasmBin = fs.readFileSync(wasmFile);
    main(deployWasmFile, '', '{}').then(result => {
      assert.equal(result.returnData, utils.toHex(wasmBin));
    }).then(done).catch(err => done(err));
  });

  describe('add', () => {
    it('normal add', done => {
      const a = '10';
      const b = '20';
      const callData = functionSignature.add + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        assert.equal(result.returnData,'000000000000000000000000000000000000000000000000000000000000001e' );
      }).then(done).catch(err => done(err));
    });

    it('overflow add', done => {
      const a = '0x' + 'f'.repeat(64);
      const b = '0x1';
      const callData = functionSignature.add + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        const revertMessage = Buffer.from(result.returnData, 'hex').toString();
        assert.equal(revertMessage, 'SafeMath: addition overflow');
      }).then(done).catch(err => done(err));
    });
  });
});

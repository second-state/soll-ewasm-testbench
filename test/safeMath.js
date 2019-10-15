const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/safeMath.wasm';
const deployWasmFile = './test/safeMath.deploy.wasm';

describe('safeMath', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    add: '771602f7',
    sub: 'b67d77c5',
    mul: 'c8a4ac9c',
    div: 'a391c15b',
    mod: 'f43f523a',
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

  describe('sub', () => {
    it('normal sub', done => {
      const a = '30';
      const b = '10';
      const callData = functionSignature.sub + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        assert.equal(result.returnData,'0000000000000000000000000000000000000000000000000000000000000014' );
      }).then(done).catch(err => done(err));
    });

    it('overflow sub', done => {
      const a = '10';
      const b = '20';
      const callData = functionSignature.sub + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        const revertMessage = Buffer.from(result.returnData, 'hex').toString();
        assert.equal(revertMessage, 'SafeMath: subtraction overflow');
      }).then(done).catch(err => done(err));
    });
  });

  describe('mul', () => {
    it('normal mul', done => {
      const a = '0xff';
      const b = '0x100';
      const callData = functionSignature.mul + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        assert.equal(result.returnData,'000000000000000000000000000000000000000000000000000000000000ff00' );
      }).then(done).catch(err => done(err));
    });

    it('overflow mul', done => {
      const a = '0x' + 'f'.repeat(64);
      const b = '2';
      const callData = functionSignature.mul + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        const revertMessage = Buffer.from(result.returnData, 'hex').toString();
        assert.equal(revertMessage, 'SafeMath: multiplication overflow');
      }).then(done).catch(err => done(err));
    });
  });

  describe('div', () => {
    it('normal div', done => {
      const a = '0xffff03';
      const b = '0x100';
      const callData = functionSignature.div + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        assert.equal(result.returnData,'000000000000000000000000000000000000000000000000000000000000ffff' );
      }).then(done).catch(err => done(err));
    });

    it('div by zero', done => {
      const a = '0xffffff03';
      const b = '0x0';
      const callData = functionSignature.div + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        const revertMessage = Buffer.from(result.returnData, 'hex').toString();
        assert.equal(revertMessage, 'SafeMath: division by zero');
      }).then(done).catch(err => done(err));
    });
  });

  describe('mod', () => {
    it('normal mod', done => {
      const a = '0xffffff03';
      const b = '0x100';
      const callData = functionSignature.mod + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        assert.equal(result.returnData,'0000000000000000000000000000000000000000000000000000000000000003' );
      }).then(done).catch(err => done(err));
    });

    it('mod by zero', done => {
      const a = '0xffffff03';
      const b = '0x0';
      const callData = functionSignature.mod + utils.to256CallData(a) + utils.to256CallData(b);
      main(wasmFile, callData, '{}').then(result => {
        const revertMessage = Buffer.from(result.returnData, 'hex').toString();
        assert.equal(revertMessage, 'SafeMath: modulo by zero');
      }).then(done).catch(err => done(err));
    });
  });

});

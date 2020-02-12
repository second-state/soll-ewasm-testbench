const assert = require('assert');
const fs = require('fs');
const main = require('../index');
const utils = require('../utils');
const wasmFile = './test/string.wasm';
const deployWasmFile = './test/string.deploy.wasm';

describe('string', function() {
  const _log = console.log;
  before(() => {
    console.log = () => {};
  });
  after(() => {
    console.log = _log;
  });

  const functionSignature = {
    testStorageStoreString1: '5c132a23',
    testStorageStoreString2: '6c4ce967',
    testStorageLoadStoreString: '4c53141a',
    testMappingWithString: '9c96fde7',
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

  it('check store storage with inline slot string', done => {
    const callData = functionSignature.testStorageStoreString1;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"0":"5365636f6e645374617465000000000000000000000000000000000000000016"}');
    }).then(done).catch(err => done(err));
  });

  it('check store storage with externd slot string', done => {
    const callData = functionSignature.testStorageStoreString2;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"1":"69","b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6":"4142434445464748494a4b4c4d4e4f505152535455565758595a414243444546","b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf7":"4748494a4b4c4d4e4f505152535455565758595a000000000000000000000000"}');
    }).then(done).catch(err => done(err));
  });

  it('check store storage with externd slot string', done => {
    const callData = functionSignature.testStorageLoadStoreString;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"0":"5365636f6e645374617465000000000000000000000000000000000000000016","1":"69","2":"5365636f6e645374617465000000000000000000000000000000000000000016","3":"69","b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6":"4142434445464748494a4b4c4d4e4f505152535455565758595a414243444546","b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf7":"4748494a4b4c4d4e4f505152535455565758595a000000000000000000000000","c2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b":"4142434445464748494a4b4c4d4e4f505152535455565758595a414243444546","c2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85c":"4748494a4b4c4d4e4f505152535455565758595a000000000000000000000000"}');
    }).then(done).catch(err => done(err));
  });

  it('check mapping(string=>string)', done => {
    const callData = functionSignature.testMappingWithString;
    main(wasmFile, callData, storage).then(result => {
      assert.equal(result.storage, '{"bc90f4f302d8a3e74cf92fc20b61016e161c9a7469eeb33c00aa4163ba2b221e":"69","547e033eb000f79ba4276869e8f40bc8237802b8f4c46d3799948e3e35289b4a":"4142434445464748494a4b4c4d4e4f505152535455565758595a414243444546","547e033eb000f79ba4276869e8f40bc8237802b8f4c46d3799948e3e35289b4b":"4748494a4b4c4d4e4f505152535455565758595a000000000000000000000000"}');
    }).then(done).catch(err => done(err));
  });
});
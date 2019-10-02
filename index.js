#!/usr/bin/env node
'strict';
let fs = require('fs');
let precompiled = {
    keccak256: null
};

class Environment {
    constructor() {
        this.storage = {};
        this.gasLeft = 65536;
        this.callData = new Uint8Array(0);
        this.returnData = new Uint8Array(0);
        this.caller = '1234567890123456789012345678901234567890';
        this.callValue = 'ffffffffffffffffffffffffffffffff';
        this.txGasPrice = '1f3f33ff5fabc5fdff67890feff12345';
        this.txOrigin = '1234567890123456789012345678901234567890';
        this.blockCoinbase = '1234567890123456789012345678901234567890';
        this.blockDifficulty = '1f3f33ff5fabc5fdff67890feff123451f3f33ff5fabc5fdff67890feff12345';
        this.gasLimit = 1000;
        this.blockNumber = 3456;
        this.blockTimestamp = 6666;
    }
    setCallData(callData) {
        if (!/^([0-9a-f][0-9a-f])+$/i.test(callData)) {
            console.log(`except hex encoded calldata, got: ${callData}`);
            return false;
        }
        this.callData = new Uint8Array(callData.length / 2).fill(0x00);
        callData.match(/.{2}/g).forEach((value, i) => {
            this.callData[i] = parseInt(value, 16);
        });
        return true;
    }
    getStorage(storage) {
        return JSON.stringify(this.storage);
    }
    setStorage(storage) {
        this.storage = JSON.parse(storage);
        return true;
    }
}

class Interface {
    get exports() {
        let ret = {
            ethereum: {
            },
            debug: {
            },
        };

        [
            'useGas',
            'getCallDataSize',
            'callDataCopy',
            'storageStore',
            'storageLoad',
            'log',
            'finish',
            'revert',
            'callStatic',
            'returnDataCopy',
            'getCaller',
            'getCallValue',
            'getTxGasPrice',
            'getTxOrigin',
            'getBlockCoinbase',
            'getBlockDifficulty',
            'getBlockGasLimit',
            'getBlockNumber',
            'getBlockTimestamp',
            'getGasLeft'
        ].forEach((method) => {
            ret.ethereum[method] = this[method].bind(this);
        });
        [
            'print32',
        ].forEach((method) => {
            ret.debug[method] = this[method].bind(this);
        });

        return ret;
    }
    constructor(env) {
        this.env = env;
    }
    getMemory(offset, length) {
        return new Uint8Array(this.mem.buffer, offset, length);
    }
    setMemory(offset, length, value) {
        const memory = new Uint8Array(this.mem.buffer, offset, length);
        memory.set(value);
    }
    toHex(data) {
        return Array.from(data).map((value) => value.toString(16).padStart(2, '0')).join('');
    }
    toLEHex(data) {
        return Array.from(data).map((value) => value.toString(16).padStart(2, '0')).reverse().join('');
    }
    toBigInt(hexRepr) {
        return BigInt(hexRepr);
    }
    takeGas(amount) {
        if (this.env.gasLeft < amount) {
            throw new Error('Ran out of gas')
        }
        this.env.gasLeft -= amount
    }
    useGas(gas) {
        console.log(`useGas(${gas})`);
        //takeGas(gas);
    }
    getCallDataSize() {
        console.log(`getCallDataSize() = ${this.env.callData.length}`);
        this.takeGas(2);
        return this.env.callData.length;
    }
    callDataCopy(resultOffset, dataOffset, length) {
        console.log(`callDataCopy(${resultOffset}, ${dataOffset}, ${length})`);
        this.takeGas(3 + Math.ceil(length / 32) * 3)

        if (length) {
            const callData = this.env.callData.slice(dataOffset, dataOffset + length)
            this.setMemory(resultOffset, length, callData)
        }
    }
    storageStore(pathOffset, valueOffset) {
        console.log(`storageStore(${pathOffset}, ${valueOffset})`);
        const path = this.toBigInt('0x' + this.toLEHex(this.getMemory(pathOffset, 32))).toString(16);
        const value = this.toBigInt('0x' + this.toLEHex(this.getMemory(valueOffset, 32))).toString(16);
        console.log(`storageStore(${path}, ${value})`);
        this.env.storage[path] = value;
    }
    storageLoad(pathOffset, valueOffset) {
        console.log(`storageLoad(${pathOffset}, ${valueOffset})`);
        const path = this.toBigInt('0x' + this.toLEHex(this.getMemory(pathOffset, 32))).toString(16);
        if (path in this.env.storage) {
            let value = this.env.storage[path];
            const data = value.padStart(64, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
            this.setMemory(valueOffset, 32, data);
            console.log(`storageLoad(${path}) = ${value}`);
        } else {
            const data = Array(32).fill(0);
            this.setMemory(valueOffset, 32, data);
            console.log(`storageLoad(${path}) = 0`);
        }
    }
    log(dataOffset, dataLength, numberOfTopics, topic1, topic2, topic3, topic4) {
        console.log(`log(${dataOffset}, ${dataLength}, ${numberOfTopics}, ${topic1}, ${topic2}, ${topic3}, ${topic4})`);
        this.takeGas(375 + (375 * numberOfTopics) + (8 * dataLength));
        if (dataLength >= 1) {
            const data = this.getMemory(dataOffset, dataLength);
            console.log(data);
        }
        if (numberOfTopics >= 1) {
            const t1 = this.getMemory(topic1, 32);
            console.log(t1);
            const hex = Buffer.from(t1).toString('hex');
            console.log('signature: ' + hex);
        }
        if (numberOfTopics >= 2) {
            const t2 = this.getMemory(topic2, 32);
            console.log(t2);
        }
        if (numberOfTopics >= 3) {
            const t3 = this.getMemory(topic3, 32);
            console.log(t3);
        }
        if (numberOfTopics >= 4) {
            const t4 = this.getMemory(topic4, 32);
            console.log(t4);
        }
    }
    finish(dataOffset, dataLength) {
        console.log(`finish(${dataOffset}, ${dataLength})`);
        const data = this.getMemory(dataOffset, dataLength)
        this.env.returnData = data;
        throw new Error('finish');
    }
    revert(dataOffset, dataLength) {
        console.log(`revert(${dataOffset}, ${dataLength})`);
        const data = this.getMemory(dataOffset, dataLength)
        this.env.returnData = data;
        console.log(data);
        console.log(String.fromCharCode.apply(null, data));
        throw new Error('revert');
        process.exit(0);
    }
    callStatic(gas, addressOffset, dataOffset, dataLength) {
        console.log(`callStatic(${gas}, ${addressOffset}, ${dataOffset}, ${dataLength})`);
        const address = this.toBigInt('0x' + this.toLEHex(this.getMemory(addressOffset, 20)));
        const data = this.getMemory(dataOffset, dataLength);
        console.log(`callStatic(${gas}, ${address}, ${data})`);

        let vm;
        switch (address) {
            case BigInt(9):
                vm = precompiled.keccak256;
                break;
            default:
                return 1;
        }

        vm.run(this.toHex(data));

        this.env.returnData = vm.env.returnData;
        console.log(`returnData = ${vm.env.returnData}`)
        return 0;
    }
    returnDataCopy(resultOffset, dataOffset, length) {
        console.log(`returnDataCopy(${resultOffset}, ${dataOffset}, ${length})`);

        if (length) {
            const callData = this.env.returnData.slice(dataOffset, dataOffset + length);
            this.setMemory(resultOffset, length, callData);
        }
    }
    getCaller(resultOffset) {
        console.log(`getCaller(${resultOffset})`);
        const data = this.env.caller.padStart(40, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(resultOffset, 20, data);
        console.log(`getCaller = ${data}`);
    }
    getCallValue(resultOffset) {
        console.log(`getCallValue(${resultOffset})`);
        const data = this.env.callValue.padStart(32, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(resultOffset, 16, data);
        console.log(`getCallValue = ${data}`);
    }
    getGasLeft() {
        console.log(`getGasLeft(${this.env.gasLeft})`);
        return this.env.gasLeft;
    }

    getTxGasPrice(valueOffset) {
        console.log(`getTxGasPrice(${valueOffset})`);
        const data = this.env.txGasPrice.padStart(32, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(valueOffset, 16, data);
        console.log(`getTxGasPrice = ${data}`);
    }

    getTxOrigin(resultOffset) {
        console.log(`getTxOrigin(${resultOffset})`);
        const data = this.env.txOrigin.padStart(40, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(resultOffset, 20, data);
        console.log(`getTxOrigin = ${data}`);
    }

    getBlockCoinbase(resultOffset) {
        console.log(`getBlockCoinbase(${resultOffset})`);
        const data = this.env.blockCoinbase.padStart(40, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(resultOffset, 20, data);
        console.log(`getBlockCoinbase = ${data}`);
    }

    getBlockDifficulty(resultOffset) {
        console.log(`getBlockDifficulty(${resultOffset})`);
        const data = this.env.blockDifficulty.padStart(64, '0').match(/.{2}/g).reverse().map(value => parseInt(value, 16));
        this.setMemory(resultOffset, 32, data);
        console.log(`getBlockDifficulty = ${data}`);
    }

    getBlockGasLimit() {
        console.log(`getBlockGasLimit() = ${this.env.gasLimit}`);
        return ;
    }

    getBlockNumber() {
        console.log(`getBlockNumber() = ${this.env.blockNumber}`);
        return ;
    }

    getBlockTimestamp() {
        console.log(`getBlockTimestamp() = ${this.env.blockTimestamp}`);
        return ;
    }

    print32(value) {
        console.log(`print32(${(new Uint32Array([value]))[0]})`);
    }
}

class VM {
    constructor(path) {
        this.env = new Environment();
        this.int = new Interface(this.env);
        this.path = path;
    }
    async instantiate() {
        this.vm = await WebAssembly.instantiate(fs.readFileSync(this.path), this.int.exports);
        this.int.mem = this.vm.instance.exports.memory;
    }
    run(callData, storage) {
        if (!this.env.setCallData(callData)) {
            return false;
        }
        if (storage && !this.env.setStorage(storage)) {
            return false;
        }
        try {
            this.vm.instance.exports.main();
        } catch (error) {
            if (error.message !== "finish") {
                console.log(error);
            }
        }
        return true;
    }
}

async function main(path, callData, storage) {
    for (let name in precompiled) {
        let vm = new VM(`lib/${name}.wasm`);
        await vm.instantiate();
        precompiled[name] = vm;
    }
    let vm = new VM(path);
    await vm.instantiate();
    vm.run(callData, storage);
    return [vm.env.returnData, vm.env.getStorage()];
};

if (require.main === module) {
    if (4 > process.argv.length || process.argv.length > 5) {
        console.log(`usage: ${process.argv[1]} ewasm-file calldata [storage]`);
        process.exit(0);
    }
    main(process.argv[2], process.argv[3], process.argv[4]).then(console.log).catch(console.log);
} else {
    module.exports = main;
}

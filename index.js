#!/usr/bin/env node
'strict';
if (process.argv.length != 3) {
    console.log(`usage: ${process.argv[1]} ewasm-file`);
    process.exit(0)
}

let fs = require('fs');

class Environment {
    constructor (data = {}) {
        const defaults = {
            callData: new Uint8Array([
                0xf7, 0x02, 0x16, 0x77,
                0xa0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                0xa0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ])
        }
        Object.assign(this, defaults, data)
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
            'getCallDataSize',
            'callDataCopy',
            'finish',
            'revert',
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
    getMemory (offset, length) {
        return new Uint8Array(this.kernel.memory.buffer, offset, length);
    }
    setMemory(offset, length, value) {
        const memory = new Uint8Array(this.kernel.memory.buffer, offset, length);
        memory.set(value);
    }
    takeGas (amount) {
        if (this.kernel.environment.gasLeft < amount) {
            throw new Error('Ran out of gas')
        }
        this.kernel.environment.gasLeft -= amount
    }
    constructor(kernel) {
        this.kernel = kernel;
    }
    getCallDataSize() {
        console.log("getCallDataSize");
        this.takeGas(2);
        return this.kernel.environment.callData.length;
    }
    callDataCopy(offset, dataOffset, length) {
        console.log(`callDataCopy(${offset}, ${dataOffset}, ${length})`);
        this.takeGas(3 + Math.ceil(length / 32) * 3)

        if (length) {
            const callData = this.kernel.environment.callData.slice(dataOffset, dataOffset + length)
            this.setMemory(offset, length, callData)
        }
    }
    finish(offset, length) {
        console.log(`finish(${offset}, ${length})`);
        const data = this.getMemory(offset, length)
        console.log(data);
        process.exit(0);
    }
    revert(offset, length) {
        console.trace(`revert(${offset}, ${length})`);
        const data = this.getMemory(offset, length)
        console.log(data);
        process.exit(0);
    }

    print32(value) {
        console.log(`print32(${value})`);
    }
};

let kernel = {
    environment: new Environment(),
};

let interface = new Interface(kernel);

WebAssembly.instantiate(fs.readFileSync(process.argv[2]), interface.exports).then(result => {
    const exports = result.instance.exports;
    kernel.memory = exports.memory;
    exports.main();
}).catch(console.error);

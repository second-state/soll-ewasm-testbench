#!/usr/bin/env node
'strict';
if (process.argv.length != 6) {
    console.log(`usage: ${process.argv[1]} ewasm-file func-sig arg1 arg2`);
    process.exit(0)
}

let fs = require('fs');

class Environment {
    constructor (funcSig, arg1, arg2, data = {}) {
        let defaults = {
            callData: new Uint8Array(20).fill(0x00)
        };
        let setCallData = (data, offset) => {
            data.match(/.{2}/g).reverse().forEach((value, i) => {
                defaults.callData[offset + i] = parseInt(value, 16);
            });
        };
        switch (funcSig) {
            case 'add':
                setCallData('771602f7', 0);
                break;
            case 'sub':
                setCallData('b67d77c5', 0);
                break;
            case 'mul':
                setCallData('c8a4ac9c', 0);
                break;
            case 'div':
                setCallData('a391c15b', 0);
                break;
            case 'mod':
                setCallData('f43f523a', 0);
                break;
            default:
                if (/^([0-9a-f][0-9a-f])+$/i.test(funcSig))
                    setCallData(funcSig, 0);
                break;
        }
        arg1 = parseInt(arg1);
        arg2 = parseInt(arg2);
        if (arg1 && arg2) {
            setCallData(arg1.toString(16).padStart(16, '0'), 4);
            setCallData(arg2.toString(16).padStart(16, '0'), 12);
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
        console.log(Array.from(data).map((value) => value.toString(16).padStart(2, '0')));
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
    environment: new Environment(...process.argv.slice(3, 6)),
};

let interface = new Interface(kernel);

WebAssembly.instantiate(fs.readFileSync(process.argv[2]), interface.exports).then(result => {
    const exports = result.instance.exports;
    kernel.memory = exports.memory;
    exports.main();
}).catch(console.error);

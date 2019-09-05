#!/usr/bin/env node
'strict';
let main = require('./index');

if (process.argv.length < 6) {
    console.log(`usage: ${process.argv[1]} ewasm-file storage func [args..]`);
    process.exit(0);
}

function generate(funcSig, arg1, arg2) {
    let callData = ''
    switch (funcSig) {
        case 'mat_mul':
            callData += '4e1faab1';
            break;
        case 'mat64_mul':
            callData += '3ff25fd3';
            break;
        case 'power':
            callData += 'c04f01fc';
            break;
        case 'power64':
            callData += '5f0a2aa6';
            break;
        case 'warshall':
            callData += '8cee1741';
            break;
        case 'warshall64':
            callData += '1a92010c';
            break;
        case 'fib':
            callData += 'c6c2ea17';
            break;
        case 'fib64':
            callData += 'fbe56a35';
            break;
        default:
            console.log(`unknown func: ${funcSig}`);
            process.exit(0);
    }
    if (arg1 !== undefined) {
        arg1 = BigInt(arg1);
        callData += arg1.toString(16).padStart(64, '0');
        if (arg2 !== undefined) {
            arg2 = BigInt(arg2);
            callData += arg2.toString(16).padStart(64, '0');
        }
    }
    return callData;
}
let callData = generate(...process.argv.slice(3, 6));
main(process.argv[2], callData).then(console.log).catch(console.log);

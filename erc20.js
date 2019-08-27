#!/usr/bin/env node
'strict';
let main = require('./index');

if (process.argv.length < 5) {
    console.log(`usage: ${process.argv[1]} ewasm-file storage func [args..]`);
    process.exit(0);
}

function generate(funcSig, arg1, arg2, arg3) {
    let callData = ''
    switch (funcSig) {
        case 'constructor':
            callData += '90fa17bb';
            break;
        case 'totalSupply':
            callData += '18160ddd';
            break;
        case 'balanceOf':
            callData += '70a08231';
            break;
        case 'transfer':
            callData += 'a9059cbb';
            break;
        case 'allowance':
            callData += 'dd62ed3e';
            break;
        case 'approve':
            callData += '095ea7b3';
            break;
        case 'transferFrom':
            callData += '23b872dd';
            break;
        case 'increaseAllowance':
            callData += '39509351';
            break;
        case 'decreaseAllowance':
            callData += 'a457c2d7';
            break;
        case '_mint':
            callData += '4e6ec247';
            break;
        case '_burn':
            callData += '6161eb18';
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
            if (arg3 !== undefined) {
                arg3 = BigInt(arg3);
                callData += arg3.toString(16).padStart(64, '0');
            }
        }
    }
    return callData;
}
let callData = generate(...process.argv.slice(4, 8));
main(process.argv[2], callData, process.argv[3]).then(console.log).catch(console.log);

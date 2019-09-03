#!/usr/bin/env node
'strict';
let main = require('./index');

if (process.argv.length != 5) {
    console.log(`usage: ${process.argv[1]} ewasm-file func arg`);
    process.exit(0);
}

function generate(funcSig, arg) {
    let callData = ''
    switch (funcSig) {
        case 'sayHello':
            callData += 'c3a9b1c5';
            break;
        default:
            console.log(`unknown func: ${funcSig}`);
            process.exit(0);
    }
    length = BigInt(arg.length);
    callData += length.toString(16).padStart(64, '0');
    for (const c of arg) {
        callData += c.charCodeAt(0).toString(16).padStart(2, '0');
    }
    return callData;
}
let callData = generate(...process.argv.slice(3, 5));
main(process.argv[2], callData).then(console.log).catch(console.log);

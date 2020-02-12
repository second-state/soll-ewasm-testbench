// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
// RUN: %soll %s
pragma solidity ^0.5.0;

contract Builtin {
  address msgSender;
  uint msgValue;
  bytes msgData;
  address bkCoinbase;
  uint bkDifficulty;
  uint bkGasLimit;
  uint bkBlockNumber;
  uint bkBlockTimestamp;
  bytes32 bkHash;
  uint gasLeft;
  uint txGasPrice;
  address txOrigin;
  bytes32 keccak256Result;
  uint txOriginBalance;
  address this_;
  bytes encodeResult;
  bytes encodePackedResult;

  event Test(address indexed addr, uint256 indexed value, uint256 value2);

  function testMsgSender() public {
    msgSender = msg.sender;
  }

  function testMsgValue() public payable {
    msgValue = msg.value;
  }

  function testMsgData() public {
    msgData = msg.data;
  }

  function testBlockCoinbase() public {
    bkCoinbase = block.coinbase;
  }

  function testBlockDifficulty() public {
    bkDifficulty = block.difficulty;
  }

  function testBlockGasLimit() public {
    bkGasLimit = block.gaslimit;
  }

  function testBlockNumber() public {
    bkBlockNumber = block.number;
  }

  function testBlockTimestamp() public {
    bkBlockTimestamp = block.timestamp;
  }

  function testBlockHash(uint bk) public {
    bkHash = blockhash(bk);
  }

  function testGasLeft() public {
    gasLeft = gasleft();
  }

  function testTxGasPrice() public {
    txGasPrice = tx.gasprice;
  }

  function testTxOrig() public {
    txOrigin = tx.origin;
  }

  function testKeccak256(bytes memory input) public {
    keccak256Result = keccak256(input);
  }

  function testAddressBalance() public {
    txOriginBalance = tx.origin.balance;
  }

  function testThis() public {
    this_ = address(this);
  }

  function testEvent() public {
    emit Test(msg.sender, uint(123), uint(456));
  }
}

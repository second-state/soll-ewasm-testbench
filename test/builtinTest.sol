// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
// RUN: %soll %s
pragma solidity ^0.5.0;

contract BuiltinTest {
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
  uint addmodResult;
  uint mulmodResult;
  bytes32 keccak256Result;
  uint txOriginBalance;
  address this_;


  function TestMsgSender() public {
    msgSender = msg.sender;
  }

  function TestMsgValue() public payable {
    msgValue = msg.value;
  }

  function TestMsgData() public {
    msgData = msg.data;
  }

  function TestBlockCoinbase() public {
    bkCoinbase = block.coinbase;
  }

  function TestBlockDifficulty() public {
    bkDifficulty = block.difficulty;
  }

  function TestBlockGasLimit() public {
    bkGasLimit = block.gaslimit;
  }

  function TestBlockNumber() public {
    bkBlockNumber = block.number;
  }

  function TestBlockTimestamp() public {
    bkBlockTimestamp = block.timestamp;
  }

  function TestBlockHash(uint bk) public {
    bkHash = blockhash(bk);
  }

  function TestGasLeft() public {
    gasLeft = gasleft();
  }

  function TestTxGasPrice() public {
    txGasPrice = tx.gasprice;
  }

  function TestTxOrig() public {
    txOrigin = tx.origin;
  }

  function TestKeccak256(bytes memory input) public {
    keccak256Result = keccak256(input);
  }

  function TestAddressBalance() public {
    txOriginBalance = tx.origin.balance;
  }

  function TestThis() public {
    this_ = address(this);
  }
}

// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
// RUN: %soll %s
pragma solidity ^0.5.0;
contract StringTest {
  string public str1;
  string public str2;
  string public str3;
  string public str4;
  mapping (string => string) private str_map;

  function testStorageStoreString1() public {
    str1 = "SecondState";
  }

  function testStorageStoreString2() public {
    str2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  function testStorageLoadStoreString() public {
    str1 = "SecondState";
    str2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    str3 = str1;
    str4 = str2;
  }

  function testMappingWithString() public {
    str_map["SecondState"] = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
}

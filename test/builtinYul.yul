// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
// RUN: %soll --lang=Yul %s
object "Builtin" {
  code {

    if iszero(lt(calldatasize(), 4))
    {
      let selector := shift_right_224_unsigned(calldataload(0))

      switch selector

      case 0x1
      {
        sstore(0x0, 0x1)
      }

      case 0x2
      {
        mstore(0x80, "Function is not payable")
        if callvalue() { revert(0x80, 23) }
      }

      case 0x3
      {
        mstore(0x60, "abc")
        sstore(0x0, mload(0x60))
        mstore8(0x70, 0x45)
        sstore(0x1, mload(0x60))
      }

      case 0x4
      {
        // Imitate builtin.sol emit event behavior

        mstore(0x60, "Test(address,uint256,uint256)")
        let len := 29
        let event_sig := keccak256(0x60, len)
        mstore(0x80, 456)
        log3(0x80, 32, event_sig, caller(), 123)
      }
    }

    function shift_right_224_unsigned(value) -> newValue {
      newValue := shr(224, value)
    }
  }
  // Unreferenced data is not added to the assembled bytecode.
  data "str" "Yul built-in test"
}

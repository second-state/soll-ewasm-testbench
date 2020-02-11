// SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
// RUN: %soll --lang=Yul %s
object "BuiltinTest" {
  code {
  }
  // Unreferenced data is not added to the assembled bytecode.
  data "str" "Yul built-in test"
}

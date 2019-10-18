(module
  (func $callStaticHook (import "ethereum" "callStatic") (param i32 i32 i32 i32) (result i32))
  (func $getGasLeftHook (import "ethereum" "getGasLeft") (result i32))
  (func $getBlockGasLimitHook (import "ethereum" "getBlockGasLimit") (result i32))
  (func $getBlockNumberHook (import "ethereum" "getBlockNumber") (result i32))
  (func $getBlockTimestampHook (import "ethereum" "getBlockTimestamp") (result i32))
  (func (export "callStatic") (param i64 i32 i32 i32) (result i32)
    get_local 0
    i32.wrap/i64
    get_local 1
    get_local 2
    get_local 3
    call $callStaticHook)
  (func (export "getGasLeft") (result i64)
    call $getGasLeftHook
    i64.extend_u/i32
    )
  (func (export "getBlockGasLimit") (result i64)
    call $getBlockGasLimitHook
    i64.extend_u/i32
    )
  (func (export "getBlockNumber") (result i64)
    call $getBlockNumberHook
    i64.extend_u/i32
    )
  (func (export "getBlockTimestamp") (result i64)
    call $getBlockTimestampHook
    i64.extend_u/i32
    )
)
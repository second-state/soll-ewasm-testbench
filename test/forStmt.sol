pragma solidity ^0.5.0;

contract SafeMath {
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 c = a;
        for (uint256 i = 0; i < b; i += 1) {
            c += 1;
        }

        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IGRCVault {
    function MIN_AMOUNT_LOCK() external view returns (uint256);

    event tokenLock(uint256 indexed amount, address indexed owner);
    event tokenUnlock(uint256 indexed amount, address indexed owner);

    function initialize() external;

    function getGRCTokenAddress() external view returns (address);

    function balanceOf(address _user) external view returns (uint256);

    function lock(address _user, uint _amount) external;

    function unlock(address _user, uint _amount) external;

    function slash(address _user, uint _amount) external;
}

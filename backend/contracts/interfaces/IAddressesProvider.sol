// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IAddressesProvider {
    function getBSDToken() external view returns (address);

    function setBSDToken(address _address) external;

    function getGRCToken() external view returns (address);

    function setGRCToken(address _address) external;

    function getGRCVault() external view returns (address);

    function setGRCVault(address _address) external;
}

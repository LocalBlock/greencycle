// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IGRC is IERC20 {
    function initialize() external;

    function getBSDTokenAddress() external view returns (address);

    function mint(address to, uint256 amount) external;

    function burn(uint256 value) external;

    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AddressesProvider is Ownable {
    // Contants
    bytes32 private constant BSD_TOKEN = "BSD_TOKEN";
    bytes32 private constant GRC_TOKEN = "GRC_TOKEN";
    bytes32 private constant GRC_VAULT = "GRC_VAULT";

    // Variables
    mapping(bytes32 => address) private _addresses;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Returns the address of the BSD token
     * @return The BSD token  address
     **/
    function getBSDToken() external view returns (address) {
        return _addresses[BSD_TOKEN];
    }

    /**
     * @dev Set the address of the BSD token
     **/
    function setBSDToken(address _address) external onlyOwner {
        require(
            _addresses[BSD_TOKEN] == address(0),
            "BSD token address already defined"
        );
        _addresses[BSD_TOKEN] = _address;
    }

    /**
     * @dev Returns the address of the GRC token
     * @return The GRC token  address
     **/
    function getGRCToken() external view returns (address) {
        return _addresses[GRC_TOKEN];
    }

    /**
     * @dev Set the address of the BSD token
     **/
    function setGRCToken(address _address) external onlyOwner {
        require(
            _addresses[GRC_TOKEN] == address(0),
            "GRC token address already defined"
        );
        _addresses[GRC_TOKEN] = _address;
    }

    /**
     * @dev Returns the address of the GRC token
     * @return The GRC token  address
     **/
    function getGRCVault() external view returns (address) {
        return _addresses[GRC_VAULT];
    }

    /**
     * @dev Set the address of the BSD token
     **/
    function setGRCVault(address _address) external onlyOwner {
        require(
            _addresses[GRC_VAULT] == address(0),
            "GRC Vault address already defined"
        );
        _addresses[GRC_VAULT] = _address;
    }
}

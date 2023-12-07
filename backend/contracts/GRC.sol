// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./interfaces/IAddressesProvider.sol";
import "./interfaces/IBSD.sol";

/**
 * @title GRC Token Contract (ERC20)
 * @author localblock@proton.me
 * @notice This contract was design during Alyra school course, Finney promotion, DO NOT USE in Production
 */
contract GRC is ERC20,ERC20Burnable , ERC165 {
    //Errors
    error unauthorizedCaller();

    // Interfaces
    IAddressesProvider AddressesProvider;
    IBSD BSDToken;

    /**
     * @dev Modifier : only ERC721 Contract (BSD)
     */
    modifier onlyBsdContract() {
        if (msg.sender != AddressesProvider.getBSDToken())
            revert unauthorizedCaller();
        _;
    }

    constructor(
        IAddressesProvider _addressesProvider
    ) ERC20("GreenCycle", "GRC") {
        AddressesProvider = _addressesProvider;
    }

    /**
     * @notice Initialize contract with BSD token
     */
    function initialize() external {
        BSDToken = IBSD(AddressesProvider.getBSDToken());
    }

    /**
     * @notice Return BSD contract address
     */
    function getBSDTokenAddress() external view returns (address) {
        return address(BSDToken);
    }

    /**
     * @notice Mint token
     * @dev only BSD Contract
     * @param to to
     * @param amount amount
     */
    function mint(address to, uint256 amount) external onlyBsdContract {
        _mint(to, amount);
    }

    /**
     * @notice ER165 implementation
     * @param interfaceId interface ID
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./interfaces/IAddressesProvider.sol";
import "./interfaces/IBSD.sol";

contract GRC is ERC20,ERC20Burnable , ERC165 {
    //Errors
    error unauthorizedCaller();
    error maximumTransfertAmountReach(uint256 maximumPermitAmount);
    error InsufficientBalance();

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

    function getBSDTokenAddress() external view returns (address) {
        return address(BSDToken);
    }

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

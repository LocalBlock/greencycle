// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "./interfaces/IAddressesProvider.sol";
import "./interfaces/IGRC.sol";

error insufficientLockAmount(uint needed);

/**
 * @title Vault for locking user token
 * @author localblock@proton.me
 * @notice This contract was design during Alyra school course, Finney promotion, DO NOT USE in Production
 */
contract GRCVault {
    // Constants
    uint256 public constant MIN_LOCK_AMOUNT = 10 ether;

    //Errors
    error unauthorizedCaller();

    // Events
    event tokenLock(uint256 indexed amount, address indexed owner);
    event tokenUnlock(uint256 indexed amount, address indexed owner);

    // Interfaces
    IAddressesProvider AddressesProvider;
    IGRC GRCToken;

    // Variables
    mapping(address => uint) private lockVault;

    /**
     * @dev Modifier : only ERC721 Contract (BSD)
     */
    modifier onlyBsdContract() {
        if (msg.sender != AddressesProvider.getBSDToken())
            revert unauthorizedCaller();
        _;
    }

    constructor(IAddressesProvider _addressesProvider) {
        AddressesProvider = _addressesProvider;
    }

    /**
     * @notice Initialize contract with BSD token
     */
    function initialize() external {
        GRCToken = IGRC(AddressesProvider.getGRCToken());
    }

    /**
     * @notice return GRC token Address
     */
    function getGRCTokenAddress() external view returns (address) {
        return address(GRCToken);
    }

    /**
     * @notice Get Amount of locked token
     * @param _user Address
     */
    function balanceOf(address _user) external view returns (uint256) {
        return lockVault[_user];
    }

    /**
     * @notice Lock tokens in vault
     * @dev Only BSD contract
     * @param _user Address
     * @param _amount Amount
     */
    function lock(address _user, uint _amount) external onlyBsdContract {
        if (_amount < MIN_LOCK_AMOUNT)
            revert insufficientLockAmount(MIN_LOCK_AMOUNT);

        GRCToken.transferFrom(_user, address(this), _amount);
        lockVault[_user] = lockVault[_user] + _amount;
        emit tokenLock(_amount, _user);
    }

    /**
     * @notice Unlock tokens in vault
     * @dev Only BSD contract
     * @param _user Address
     * @param _amount Amount
     */
    function unlock(address _user, uint _amount) external onlyBsdContract {
        GRCToken.transfer(_user, _amount);
        lockVault[_user] = lockVault[_user] - _amount;
        emit tokenUnlock(_amount, _user);
    }

    /**
     * @notice Slash a user, burn token
     * @dev Only BSD contract
     * @param _user Address
     * @param _amount Amount
     */
    function slash(address _user, uint _amount) external onlyBsdContract {
        GRCToken.burn(_amount);
        lockVault[_user] = lockVault[_user] - _amount;
    }
}

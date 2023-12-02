// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "./interfaces/IAddressesProvider.sol";
import "./interfaces/IGRC.sol";

error insufficientLockAmount(uint needed);

contract GRCVault {
    // Constants
    uint256 public constant MIN_AMOUNT_LOCK = 10 ether;

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

    function balanceOf(address _user) external view returns (uint256) {
        return lockVault[_user];
    }

    function lock(address _user, uint _amount) external onlyBsdContract {
        if (_amount < MIN_AMOUNT_LOCK)
            revert insufficientLockAmount(MIN_AMOUNT_LOCK);

        GRCToken.transferFrom(_user, address(this), _amount);
        lockVault[_user] = lockVault[_user] + _amount;
        emit tokenLock(_amount, _user);
    }

    function unlock(address _user, uint _amount) external onlyBsdContract {
        GRCToken.transfer(_user, _amount);
        lockVault[_user] = lockVault[_user] - _amount;
        emit tokenUnlock(_amount, _user);
    }

    function slash(address _user, uint _amount) external onlyBsdContract {
        //GRCToken.transfer(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512, _amount); //a voir ou
        GRCToken.burn(_amount);
        lockVault[_user] = lockVault[_user] - _amount;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAddressesProvider.sol";
import "./interfaces/IGRC.sol";
import "./interfaces/IGRCVault.sol";

/**
 * @title NFT for Bordereau de suivi de dechets
 * @author localblock@proton.me
 * @notice This contract was design during Alyra school course, Finney promotion, DO NOT USE in Production
 */
contract BSD is ERC721, ERC721URIStorage, AccessControl {
    // Constants
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RECIPIENT_ROLE = keccak256("RECIPIENT_ROLE");
    uint256 public constant MAX_PROCESS_TIME = 2 minutes; // Actually, reglemention is 3 months
    uint72 public constant ONBOARDING_MINT_AMOUNT = 100 ether;
    uint72 public constant REWARD_MINT_AMOUNT = 5 ether;
    uint72 public constant SLASH_AMOUNT = 10 ether;
    uint256 private nextTokenId;

    // Errors
    error InvalidRecipient();
    error InvalidBSD();
    error externalTransfertForbidden();
    error InsufficientLockAmount(uint needed);

    // Events
    event toRecipient(uint256 indexed tokenId, address indexed recipient);
    event userSlashed(
        address indexed shashedAddress,
        uint256 indexed slashedAmount
    );

    // Interfaces
    IAddressesProvider AddressesProvider;
    IGRC GRCToken;
    IGRCVault GRCVault;

    // Variables
    enum Status {
        Created,
        Shipped,
        Rejected,
        Accepted,
        Processed,
        Claimed
    }

    struct Producer {
        address walletAddress;
    }

    struct Transporter {
        address walletAddress;
        uint256 pickupDate;
        uint256 deliveryDate;
    }
    struct Recipient {
        address walletAddress;
        uint256 wasteDecisionDate;
        uint256 finalDate;
    }

    struct Bsd {
        Status status;
        Producer producer;
        Transporter transporter;
        Recipient recipient;
    }

    mapping(uint256 => Bsd) bsdData;

    constructor(
        IAddressesProvider _addressesProvider
    ) ERC721(unicode"Bordereau de Suivi de Déchets", "BSD") {
        // Deloyer have the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        AddressesProvider = _addressesProvider;
    }

    /**
     * @notice Initialize contract with GRC token
     */
    function initialize() external {
        GRCToken = IGRC(AddressesProvider.getGRCToken());
        GRCVault = IGRCVault(AddressesProvider.getGRCVault());
    }

    /**
     * @notice return GRC token Address
     */
    function getGRCTokenAddress() external view returns (address) {
        return address(GRCToken);
    }

    /**
     * @notice return GRCVault token Address
     */
    function getGRCVaultAddress() external view returns (address) {
        return address(GRCVault);
    }

    function mint(
        string memory _uri,
        address _toRecipient
    ) public onlyRole(PRODUCER_ROLE) {
        if (!isSufficientLockAmount())
            revert InsufficientLockAmount(GRCVault.MIN_LOCK_AMOUNT());
        if (!hasRole(RECIPIENT_ROLE, _toRecipient)) revert InvalidRecipient();
        uint256 _tokenId = nextTokenId++;
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId] = Bsd(
            Status.Created,
            Producer(msg.sender),
            Transporter(address(0), 0, 0),
            Recipient(_toRecipient, 0, 0)
        );

        emit toRecipient(_tokenId, _toRecipient);
    }

    function getBsdData(uint256 _tokenId) external view returns (Bsd memory) {
        return bsdData[_tokenId];
    }

    function transportWaste(
        uint256 _tokenId,
        string memory _uri,
        uint256 _deliveryDate
    ) external onlyRole(TRANSPORTER_ROLE) {
        if (!isSufficientLockAmount())
            revert InsufficientLockAmount(GRCVault.MIN_LOCK_AMOUNT());
        if (bsdData[_tokenId].status != Status.Created) revert InvalidBSD();

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Get ownership from Producer
        // @dev _safeTranfer VS safeTranfertFrom
        // Save 2855gas, because safeTranfertFrom doesn't check if token is allowed, but both check if token be owned by 'from'
        _safeTransfer(ownerOf(_tokenId), msg.sender, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Shipped;
        bsdData[_tokenId].transporter.walletAddress = msg.sender;
        bsdData[_tokenId].transporter.pickupDate = block.timestamp;
        bsdData[_tokenId].transporter.deliveryDate = _deliveryDate;
    }

    function recipientReject(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        //if (!isSufficientLockAmount()) revert InsufficientLockAmount(); //A priori non à reflechir
        if (bsdData[_tokenId].status != Status.Shipped) revert InvalidBSD();
        if (bsdData[_tokenId].recipient.walletAddress != msg.sender)
            revert InvalidBSD();

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Return to producer
        _safeTransfer(
            ownerOf(_tokenId),
            bsdData[_tokenId].producer.walletAddress,
            _tokenId
        );

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Rejected;
        bsdData[_tokenId].recipient.wasteDecisionDate = block.timestamp;

        // Slash tranporter if necessary
        if (isTransporterSlashed(bsdData[_tokenId].transporter.deliveryDate)) {
            address slashedAddress = bsdData[_tokenId]
                .transporter
                .walletAddress;
            GRCVault.slash(slashedAddress, SLASH_AMOUNT);
            emit userSlashed(slashedAddress, SLASH_AMOUNT);
        }
    }

    function recipientAccept(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        //if (!isSufficientLockAmount()) revert InsufficientLockAmount(); //A priori non à reflechir
        if (bsdData[_tokenId].status != Status.Shipped) revert InvalidBSD();

        // Que si le token lui est destiné
        if (bsdData[_tokenId].recipient.walletAddress != msg.sender)
            revert InvalidBSD();

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Get ownership from transporter
        _safeTransfer(ownerOf(_tokenId), msg.sender, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Accepted;
        bsdData[_tokenId].recipient.wasteDecisionDate = block.timestamp;

        // Slash tranporter if necessary
        if (isTransporterSlashed(bsdData[_tokenId].transporter.deliveryDate)) {
            address slashedAddress = bsdData[_tokenId]
                .transporter
                .walletAddress;
            GRCVault.slash(slashedAddress, SLASH_AMOUNT);
            emit userSlashed(slashedAddress, SLASH_AMOUNT);
        }
    }

    function recipientProcess(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        if (!isSufficientLockAmount())
            revert InsufficientLockAmount(GRCVault.MIN_LOCK_AMOUNT());

        // Return to producer
        _safeTransfer(
            msg.sender,
            bsdData[_tokenId].producer.walletAddress,
            _tokenId
        );

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Processed;
        bsdData[_tokenId].recipient.finalDate = block.timestamp;

        // Slash recipient if necessary
        if (isRecipientSlashed(bsdData[_tokenId].recipient.wasteDecisionDate)) {
            address slashedAddress = bsdData[_tokenId].recipient.walletAddress;
            GRCVault.slash(slashedAddress, SLASH_AMOUNT);
            emit userSlashed(slashedAddress, SLASH_AMOUNT);
        }

        // Reward
        GRCToken.mint(
            bsdData[_tokenId].producer.walletAddress,
            REWARD_MINT_AMOUNT
        );
        GRCToken.mint(
            bsdData[_tokenId].transporter.walletAddress,
            REWARD_MINT_AMOUNT
        );
        GRCToken.mint(
            bsdData[_tokenId].recipient.walletAddress,
            REWARD_MINT_AMOUNT
        );
    }

    /**
     * check if address has a know role
     * @param _addr Address
     * @return bool
     */
    function _hasKnownRole(address _addr) internal view returns (bool) {
        return
            hasRole(PRODUCER_ROLE, _addr) ||
            hasRole(TRANSPORTER_ROLE, _addr) ||
            hasRole(RECIPIENT_ROLE, _addr) ||
            hasRole(DEFAULT_ADMIN_ROLE, _addr);
    }

    /**
     * @notice onboarding user give some token
     */
    function onboarding(address _addr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        GRCToken.mint(_addr, ONBOARDING_MINT_AMOUNT);
    }

    function isTransporterSlashed(
        uint256 _deliveryDate
    ) internal view returns (bool) {
        if (block.timestamp > _deliveryDate) return true;
        return false;
    }

    function isRecipientSlashed(
        uint256 _wasteDecisionDate
    ) internal view returns (bool) {
        if (block.timestamp > _wasteDecisionDate + MAX_PROCESS_TIME)
            return true;
        return false;
    }

    function isSufficientLockAmount() internal view returns (bool) {
        if (GRCVault.balanceOf(msg.sender) >= GRCVault.MIN_LOCK_AMOUNT())
            return true;
        return false;
    }

    function deposit(uint _amount) external {
        GRCVault.lock(msg.sender, _amount);
    }

    function withdraw(uint _amount) external {
        GRCVault.unlock(msg.sender, _amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        // Unauthorise external tranfert
        if (!_hasKnownRole(to)) revert externalTransfertForbidden();
        return super._update(to, tokenId, auth);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

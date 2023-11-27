// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title NFT for Bordereau de suivi de dechets
 * @author localblock@proton.me
 * @notice This contract was design during Alyra school course, Finney promotion, DO NOT USE in Production
 */
contract BSD is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RECIPIENT_ROLE = keccak256("RECIPIENT_ROLE");
    uint256 private nextTokenId;

    enum Status {
        Created,
        Shipped,
        Rejected,
        Accepted,
        Processed,
        Claimed
    }

    struct Bsd {
        Status status;
        address producer;
        address transporter;
        address recipient;
    }

    mapping(uint256 => Bsd) bsdData;

    event toRecipient(uint256 indexed tokenId, address indexed recipient);

    constructor() ERC721(unicode"Bordereau de Suivi de Déchets", "BSD") {
        // Deloyer have the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint(
        string memory _uri,
        address _toRecipient
    ) public onlyRole(PRODUCER_ROLE) {
        uint256 _tokenId = nextTokenId++;
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId] = Bsd(
            Status.Created,
            msg.sender,
            address(0),
            _toRecipient
        );

        emit toRecipient(_tokenId, _toRecipient);
    }

    function getTokenIdsOf(address _addr) public view returns (uint256[] memory) {
        uint256 _balanceOfOwner = balanceOf(_addr);
        uint256[] memory _myTokenIds = new uint256[](_balanceOfOwner);
        for (uint256 i = 0; i < _balanceOfOwner; ++i) {
            _myTokenIds[i] = tokenOfOwnerByIndex(_addr, i);
        }
        return _myTokenIds;
    }

    function getBsdData(uint256 _tokenId) external view returns (Bsd memory){
        return bsdData[_tokenId];
    }

    function transportWaste(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(TRANSPORTER_ROLE) {
        // TODO : add Require

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Get ownership from Producer
        _safeTransfer(ownerOf(_tokenId), msg.sender, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Shipped;
        bsdData[_tokenId].transporter = msg.sender;
    }

    function recipientReject(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        // TODO : add Require

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Return to producer
        _safeTransfer(ownerOf(_tokenId), bsdData[_tokenId].producer, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Rejected;
    }

    function recipientAccept(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        // TODO : add Require

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Get ownership from transporter
        _safeTransfer(ownerOf(_tokenId), msg.sender, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Accepted;
    }

    function recipientProcess(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(RECIPIENT_ROLE) {
        // TODO : add Require

        // Return to producer
        _safeTransfer(msg.sender,bsdData[_tokenId].producer, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Processed;
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

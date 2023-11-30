// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title NFT for Bordereau de suivi de dechets
 * @author localblock@proton.me
 * @notice This contract was design during Alyra school course, Finney promotion, DO NOT USE in Production
 */
contract BSD is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RECIPIENT_ROLE = keccak256("RECIPIENT_ROLE");
    uint256 private nextTokenId;

    // Errors
    error InvalidRecipient();
    error InvalidBSD();
    error externalTransfertForbidden();

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
        if (!hasRole(RECIPIENT_ROLE, _toRecipient)) revert InvalidRecipient();
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

    function getBsdData(uint256 _tokenId) external view returns (Bsd memory) {
        return bsdData[_tokenId];
    }

    function transportWaste(
        uint256 _tokenId,
        string memory _uri
    ) external onlyRole(TRANSPORTER_ROLE) {
        // Only created token
        if (bsdData[_tokenId].status != Status.Created) revert InvalidBSD();

        // C'est le cas où il peut y avoir le plus de problèmes dans le sens ou n'importe quelle transporteur peut accepter un BSD minté
        // En theorie il devrait pas y avoir ce comportement
        // S'il ya de l'abus faut slasher direct!
        // ou alors on revient à un systeme de whitelist

        // Get approve for caller
        _approve(msg.sender, _tokenId, address(0));

        // Get ownership from Producer
        // @dev _safeTranfer VS safeTranfertFrom
        // Save 2855gas, because safeTranfertFrom doesn't check if token is allowed, both check if token be owned by 'from'
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
        // Que ceux qui sont shipped
        if (bsdData[_tokenId].status != Status.Shipped) revert InvalidBSD();

        // Et que ceux qui lui sont destinés
        if (bsdData[_tokenId].recipient != msg.sender) revert InvalidBSD();

        // Si il Refuse un BSD de maniere malveillante , par exemple qui n'est pas physiquement arrivé ou de manière sytématique
        // Le producteur decide de le slasher aprés avoir constaté de noumbreux refus par exemple

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
        // Que ceux qui sont shipped
        if (bsdData[_tokenId].status != Status.Shipped) revert InvalidBSD();

        // Que si le token lui est destiné
        if (bsdData[_tokenId].recipient != msg.sender) revert InvalidBSD();

        // Au producteur de slasher ou pas si par exemple il s'est planter

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
        // Ben pas besoin de verifier le token est à lui, donc personne d'autre peut modifier le BSD
        // Retour au cas classique de NFT en somme, et tant mieux pour une fois.
        // Le producteur pourrait eventuellement le slasher, mais il faut une bonne raison!
        // A ce moment, le BSD arrive a son point final et en théorie tout s'est bien passé, en tout c'est notre traca qui dit ca!!
        // Reward pour tout le monde?

        // Return to producer
        _safeTransfer(msg.sender, bsdData[_tokenId].producer, _tokenId);

        // Update Metadata
        _setTokenURI(_tokenId, _uri);

        // Set Bsddata
        bsdData[_tokenId].status = Status.Processed;
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

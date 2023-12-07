// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

interface IBSD is IERC721Metadata {
    event toRecipient(uint256 indexed tokenId, address indexed recipient);

    function initialize() external;

    function getGRCTokenAddress() external view returns (address);

    function getGRCVaultAddress() external view returns (address);

    function mint(string memory _uri, address _toRecipient) external;

    function getBsdData(uint256 _tokenId) external view;

    function transportWaste(uint256 _tokenId, string memory _uri) external;

    function recipientReject(uint256 _tokenId, string memory _uri) external;

    function recipientAccept(uint256 _tokenId, string memory _uri) external;

    function recipientProcess(uint256 _tokenId, string memory _uri) external;

    function onboarding(address _addr) external;

    function deposit(uint _amount) external;

    function withdraw(uint _amount) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);
}

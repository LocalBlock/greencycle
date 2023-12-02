import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BytesLike, ZeroAddress, parseEther } from "ethers";

/**
 * Fixtures to deploy GRC contract
 */
async function deployGRCContract() {
  //Get signers
  const [
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  ] = await ethers.getSigners();

  // Deploy TokenAddressesProvider
  const addressesProviderContract = await ethers.deployContract(
    "AddressesProvider"
  );
  const addressesProviderAddress = await addressesProviderContract.getAddress();

  //Deploy BSD Contract
  const bsdContract = await ethers.deployContract("BSD", [
    addressesProviderAddress,
  ]);

  // Set BSD Token in TokenAddressesProvider
  const bsdTokenAddress = await bsdContract.getAddress();
  await addressesProviderContract.setBSDToken(bsdTokenAddress);

  // Deploy GRC contract
  const grcContract = await ethers.deployContract("GRC", [
    addressesProviderAddress,
  ]);

  // Set GRC Token in TokenAddressesProvider
  const grcTokenAddress = await grcContract.getAddress();
  await addressesProviderContract.setGRCToken(grcTokenAddress);

  // Initialize BSD Contract
  await bsdContract.initialize();

  // Initialize GRC Contract
  await grcContract.initialize();

  // Configure BSD Contract
  // Get roles
  const producerRole = await bsdContract.PRODUCER_ROLE();
  const transporterRole = await bsdContract.TRANSPORTER_ROLE();
  const recipientRole = await bsdContract.RECIPIENT_ROLE();

  // Grant roles
  await bsdContract.grantRole(producerRole, producer);
  await bsdContract.grantRole(producerRole, producer2);
  await bsdContract.grantRole(transporterRole, transporter);
  await bsdContract.grantRole(recipientRole, recipient);
  await bsdContract.grantRole(recipientRole, recipient2);

  //  Onboarding
  await bsdContract.onboarding(producer.address);
  await bsdContract.onboarding(transporter.address);
  await bsdContract.onboarding(recipient.address);

  return {
    bsdContract,
    grcContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  };
}

async function deployGRCContractWithLock() {
  const {
    bsdContract,
    grcContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  } = await loadFixture(deployGRCContract);

  return {
    bsdContract,
    grcContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  };
}

describe("GRC Contract", () => {
  describe("1 - Deployment", () => {
    it("should get BSD address", async () => {
      const { grcContract, bsdContract } = await loadFixture(deployGRCContract);
      expect(await grcContract.getBSDTokenAddress()).to.be.equal(
        await bsdContract.getAddress()
      );
    });
  });
  describe("2 - Mint ", () => {
    it("should revert if caller is not BSD contract", async () => {
      const { grcContract } = await loadFixture(deployGRCContract);
      await expect(
        grcContract.mint(ZeroAddress, parseEther("100"))
      ).to.revertedWithCustomError(grcContract, "unauthorizedCaller");
    });
  });

  describe("8 - Override Functions", () => {
    it("should supportsInterface", async () => {
      const { grcContract } = await loadFixture(deployGRCContract);
      const ERC165ID = "0x01ffc9a7" as BytesLike;
      expect(await grcContract.supportsInterface(ERC165ID)).to.be.true;
    });
  });
});

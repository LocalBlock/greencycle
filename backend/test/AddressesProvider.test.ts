import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ZeroAddress } from "ethers";

async function deployAddressesProvider() {
  //Get signers
  const [deployer, oneAddress] = await ethers.getSigners();
  const addressesProvider = await ethers.deployContract(
    "AddressesProvider"
  );
  const addressesProviderAddress =
    await addressesProvider.getAddress();

  return {
    addressesProvider,
    addressesProviderAddress,
    deployer,
    oneAddress,
  };
}

describe("AddressesProvider Contract", () => {
  describe("1 - Deployment", () => {
    it("should set owner to deployer", async () => {
      const { addressesProvider, deployer } = await loadFixture(
        deployAddressesProvider
      );
      expect(await addressesProvider.owner()).to.be.equal(
        deployer.address
      );
    });
  });
  describe("2 - Set addresses", () => {
    describe("BSD Address", () => {
      it("should revert if not owner", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await expect(
          addressesProvider.connect(oneAddress).setBSDToken(oneAddress)
        ).to.revertedWithCustomError(
          addressesProvider,
          "OwnableUnauthorizedAccount"
        );
      });
      it("should set address", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setBSDToken(oneAddress.address);
        expect(await addressesProvider.getBSDToken()).to.be.equal(
          oneAddress.address
        );
      });
      it("should revert to set again address", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setBSDToken(oneAddress.address);
        await expect(
          addressesProvider.setBSDToken(ZeroAddress)
        ).to.revertedWith("BSD token address already defined");
      });
    });
    describe("GRC Address", () => {
      it("should revert if not owner", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await expect(
          addressesProvider.connect(oneAddress).setGRCToken(oneAddress)
        ).to.revertedWithCustomError(
          addressesProvider,
          "OwnableUnauthorizedAccount"
        );
      });
      it("should set address", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setGRCToken(oneAddress.address);
        expect(await addressesProvider.getGRCToken()).to.be.equal(
          oneAddress.address
        );
      });
      it("should revert to set again", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setGRCToken(oneAddress.address);
        await expect(
          addressesProvider.setGRCToken(ZeroAddress)
        ).to.revertedWith("GRC token address already defined");
      });
    });
    describe("GRC Vault Address", () => {
      it("should revert if not owner", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await expect(
          addressesProvider.connect(oneAddress).setGRCVault(oneAddress)
        ).to.revertedWithCustomError(
          addressesProvider,
          "OwnableUnauthorizedAccount"
        );
      });
      it("should set address", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setGRCVault(oneAddress.address);
        expect(await addressesProvider.getGRCVault()).to.be.equal(
          oneAddress.address
        );
      });
      it("should revert to set again", async () => {
        const { addressesProvider, oneAddress } = await loadFixture(
          deployAddressesProvider
        );
        await addressesProvider.setGRCVault(oneAddress.address);
        await expect(
          addressesProvider.setGRCVault(ZeroAddress)
        ).to.revertedWith("GRC Vault address already defined");
      });
    });
  });
});

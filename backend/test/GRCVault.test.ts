import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BytesLike, ZeroAddress, parseEther } from "ethers";

/**
 * Fixtures to deploy GRC contract
 */
async function deployGRCVaultContract() {
  //Get signers
  const [deployer] = await ethers.getSigners();

  // Deploy TokenAddressesProvider
  const addressesProviderContract = await ethers.deployContract(
    "AddressesProvider"
  );
  const addressesProviderAddress = await addressesProviderContract.getAddress();

  //   //Deploy BSD Contract
  //   const bsdContract = await ethers.deployContract("BSD", [
  //     addressesProviderAddress,
  //   ]);

  //   // Set BSD Token in TokenAddressesProvider
  //   const bsdTokenAddress = await bsdContract.getAddress();
  //   await addressesProviderContract.setBSDToken(bsdTokenAddress);

  // Deploy GRC contract
  const grcContract = await ethers.deployContract("GRC", [
    addressesProviderAddress,
  ]);

  // Set GRC Token in TokenAddressesProvider
  const grcTokenAddress = await grcContract.getAddress();
  await addressesProviderContract.setGRCToken(grcTokenAddress);

  // Deploy Vault contract
  const vaultContract = await ethers.deployContract("GRCVault", [
    addressesProviderAddress,
  ]);

  // Set Vault address in TokenAddressesProvider
  const vaultTokenAddress = await vaultContract.getAddress();
  await addressesProviderContract.setGRCVault(vaultTokenAddress);

  // Initialize GRC Contract
  await grcContract.initialize();

  // Initialize GRC Contract
  await vaultContract.initialize();
  return {
    grcContract,
    vaultContract,
    deployer,

  };
}
describe("GRC Vault Contract", () => {
  describe("1 - Deployment", () => {
    it("should get BSD address", async () => {
      const { vaultContract, grcContract } = await loadFixture(deployGRCVaultContract);
      expect(await vaultContract.getGRCTokenAddress()).to.be.equal(
        await grcContract.getAddress()
      );
    });
  });
  describe("2 - Lock ", () => {
    it("should revert if caller is not BSD contract", async () => {
      const { vaultContract } = await loadFixture(deployGRCVaultContract);
      await expect(
        vaultContract.lock(ZeroAddress, parseEther("100"))
      ).to.revertedWithCustomError(vaultContract, "unauthorizedCaller");
    });
  });

  describe("8 - Unlock", () => {
    it("should revert if caller is not BSD contract", async () => {
        const { vaultContract } = await loadFixture(deployGRCVaultContract);
        await expect(
          vaultContract.unlock(ZeroAddress, parseEther("100"))
        ).to.revertedWithCustomError(vaultContract, "unauthorizedCaller");
      });
  });
  describe("8 - slash", () => {
    it("should revert if caller is not BSD contract", async () => {
        const { vaultContract } = await loadFixture(deployGRCVaultContract);
        await expect(
          vaultContract.slash(ZeroAddress, parseEther("100"))
        ).to.revertedWithCustomError(vaultContract, "unauthorizedCaller");
      });
  });
});

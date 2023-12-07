import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BytesLike, ZeroAddress, parseEther } from "ethers";

// Enum from SmartContract
enum BsdStatus {
  Created,
  Shipped,
  Rejected,
  Accepted,
  Processed,
  Claimed,
}

/**
 * Fixtures to deploy BSD contract
 */
async function deployBSDContract() {
  //Get signers
  const [
    deployer,
    producer,
    transporter,
    recipient,
    producer2,
    recipient2,
    unkownRole,
  ] = await ethers.getSigners();

  // Deploy TokenAddressesProvider
  const addressesProviderContract = await ethers.deployContract(
    "AddressesProvider"
  );
  const addressesProviderAddress =
    await addressesProviderContract.getAddress();

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

  // Deploy Vault contract
  const vaultContract = await ethers.deployContract("GRCVault", [
    addressesProviderAddress,
  ]);

  // Set Vault address in TokenAddressesProvider
  const vaultTokenAddress = await vaultContract.getAddress();
  await addressesProviderContract.setGRCVault(vaultTokenAddress);

  // Initialize BSD Contract
  await bsdContract.initialize();

  // Initialize GRC Contract
  await grcContract.initialize();

  // Initialize GRC Contract
  await vaultContract.initialize();

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
  await bsdContract.onboarding(producer2.address);
  await bsdContract.onboarding(transporter.address);
  await bsdContract.onboarding(recipient.address);
  await bsdContract.onboarding(recipient2.address);

  return {
    bsdContract,
    grcContract,
    vaultContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with tokens lock
 */
async function deployBSDContractWithTokenLock() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  } = await loadFixture(deployBSDContract);

  //Lock tokens
  await grcContract
    .connect(producer)
    .approve(vaultContract.target, parseEther("10"));
  await bsdContract.connect(producer).deposit(parseEther("10"));

  await grcContract
    .connect(producer2)
    .approve(vaultContract.target, parseEther("10"));
  await bsdContract.connect(producer2).deposit(parseEther("10"));

  await grcContract
    .connect(transporter)
    .approve(vaultContract.target, parseEther("10"));
  await bsdContract.connect(transporter).deposit(parseEther("10"));

  await grcContract
    .connect(recipient)
    .approve(vaultContract.target, parseEther("10"));
  await bsdContract.connect(recipient).deposit(parseEther("10"));

  await grcContract
    .connect(recipient2)
    .approve(vaultContract.target, parseEther("10"));
  await bsdContract.connect(recipient2).deposit(parseEther("10"));

  return {
    bsdContract,
    grcContract,
    vaultContract,
    deployer,
    producer,
    producer2,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD minted
 */
async function deployBSDContractWithOneMintedBsd() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    deployer,
    producer,
    transporter,
    recipient,
    unkownRole,
  } = await loadFixture(deployBSDContractWithTokenLock);
  await bsdContract.connect(producer).mint("ipfs://CID_MINTED", recipient);
  return {
    bsdContract,
    grcContract,
    vaultContract,
    deployer,
    producer,
    transporter,
    recipient,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD shipped
 */
async function deployBSDContractWithOneShippedBsd() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  } = await loadFixture(deployBSDContractWithOneMintedBsd);
  await bsdContract
    .connect(transporter)
    .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60);
  return {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD shipped to second recipient
 */
async function deployBSDContractWithOneShippedBsdToSecondRecipient() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  } = await loadFixture(deployBSDContractWithTokenLock);
  await bsdContract.connect(producer).mint("ipfs://CID", recipient2);
  await bsdContract
    .connect(transporter)
    .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60);
  return {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    recipient2,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD Accepted
 */
async function deployBSDContractWithOneAcceptedBsd() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  } = await loadFixture(deployBSDContractWithOneShippedBsd);
  await bsdContract
    .connect(recipient)
    .recipientAccept(0, "ipfs://CID_ACCEPTED");
  return {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD Rejected
 */
async function deployBSDContractWithOneRejectedBsd() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  } = await loadFixture(deployBSDContractWithOneShippedBsd);
  await bsdContract
    .connect(recipient)
    .recipientReject(0, "ipfs://CID_REJECTED");
  return {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  };
}

/**
 * Fixture to deploy BSD contract with 1 BSD processed
 */
async function deployBSDContractWithOneProcessedBsd() {
  const {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  } = await loadFixture(deployBSDContractWithOneAcceptedBsd);
  await bsdContract
    .connect(recipient)
    .recipientProcess(0, "ipfs://CID_PROCESSED");
  return {
    bsdContract,
    grcContract,
    vaultContract,
    producer,
    transporter,
    recipient,
    unkownRole,
  };
}

describe("BSD Contract", () => {
  describe("1 - Deployment", () => {
    it("should set deployer to default admin role", async () => {
      const { bsdContract, deployer } = await loadFixture(deployBSDContract);
      const defaulAdminRole = await bsdContract.DEFAULT_ADMIN_ROLE();
      expect(await bsdContract.hasRole(defaulAdminRole, deployer)).to.be.true;
    });
    it("should get GRC address", async () => {
      const { grcContract, bsdContract } = await loadFixture(deployBSDContract);
      expect(await bsdContract.getGRCTokenAddress()).to.be.equal(
        await grcContract.getAddress()
      );
    });
    it("should get Vault address", async () => {
      const { bsdContract, vaultContract } = await loadFixture(
        deployBSDContract
      );
      expect(await bsdContract.getGRCVaultAddress()).to.be.equal(
        await vaultContract.getAddress()
      );
    });
    describe("Onboarding", () => {
      it("should revert if not admin role", async () => {
        const { bsdContract, unkownRole, deployer } = await loadFixture(
          deployBSDContract
        );
        await expect(
          bsdContract.connect(unkownRole).onboarding(deployer.address)
        ).to.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
    });
  });

  describe("2 - Lock Token", () => {
    describe("Deposit", () => {
      it("should set vault with initial deposit amount", async () => {
        const { bsdContract, grcContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("10")); // approuve Vault
        await bsdContract.connect(producer).deposit(parseEther("10")); // Deposit

        expect(await vaultContract.balanceOf(producer.address)).to.be.equal(
          parseEther("10")
        );
      });
      it("should add amount in vault with a second deposit", async () => {
        const { bsdContract, grcContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("20")); // approuve Vault
        await bsdContract.connect(producer).deposit(parseEther("10")); // Deposit
        await bsdContract.connect(producer).deposit(parseEther("10")); // Deposit

        expect(await vaultContract.balanceOf(producer.address)).to.be.equal(
          parseEther("20")
        );
      });
      it("should emit a tokenlock event", async () => {
        const { bsdContract, grcContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("10")); // approuve Vault
        await expect(bsdContract.connect(producer).deposit(parseEther("10")))
          .to.emit(vaultContract, "tokenLock")
          .withArgs(parseEther("10"), producer.address);
      });
      it("should revert with insufficiant amount", async () => {
        const { bsdContract, grcContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("9")); // approuve Vault
        await expect(bsdContract.connect(producer).deposit(parseEther("9")))
          .to.revertedWithCustomError(vaultContract, "insufficientLockAmount")
          .withArgs(await vaultContract.MIN_LOCK_AMOUNT());
      });
    });
    describe("Withdraw", () => {
      it("should set remaining balance in vault", async () => {
        const { bsdContract, grcContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("20")); // approuve Vault
        await bsdContract.connect(producer).deposit(parseEther("20")); // Deposit
        await bsdContract.connect(producer).withdraw(parseEther("10"));
        expect(await vaultContract.balanceOf(producer.address)).to.be.equal(
          parseEther("10")
        );
      });
      it("should emit a tokenUnlock event", async () => {
        const { grcContract, bsdContract, vaultContract, producer } =
          await loadFixture(deployBSDContract);
        await grcContract
          .connect(producer)
          .approve(vaultContract.target, parseEther("10")); // approuve Vault
        await bsdContract.connect(producer).deposit(parseEther("10"));
        await expect(bsdContract.connect(producer).withdraw(parseEther("10")))
          .to.emit(vaultContract, "tokenUnlock")
          .withArgs(parseEther("10"), producer.address);
      });
    });
  });
  describe("3 - Mint", () => {
    describe("Access Control", () => {
      it("should NOT revert with producer role", async () => {
        const { bsdContract, producer, recipient } = await loadFixture(
          deployBSDContract
        );
        await expect(
          bsdContract.connect(producer).mint("ipfs://CID_MINTED", recipient)
        ).to.not.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("should revert with tranporter role", async () => {
        const { bsdContract, transporter, recipient } = await loadFixture(
          deployBSDContract
        );
        const neededRole = await bsdContract.PRODUCER_ROLE();
        await expect(
          bsdContract.connect(transporter).mint("ipfs://CID_MINTED", recipient)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(transporter.address, neededRole);
      });
      it("should revert with recipient role", async () => {
        const { bsdContract, recipient } = await loadFixture(deployBSDContract);
        const neededRole = await bsdContract.PRODUCER_ROLE();
        await expect(
          bsdContract.connect(recipient).mint("ipfs://CID_MINTED", recipient)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(recipient.address, neededRole);
      });
      it("should revert with unknown role address", async () => {
        const { bsdContract, recipient, unkownRole } = await loadFixture(
          deployBSDContract
        );
        const neededRole = await bsdContract.PRODUCER_ROLE();
        await expect(
          bsdContract.connect(unkownRole).mint("ipfs://CID_MINTED", recipient)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unkownRole.address, neededRole);
      });
    });
    describe("Extra Access Control", () => {
      it("should revert if lock amount is insufficient", async () => {
        const { bsdContract, producer, recipient, vaultContract } =
          await loadFixture(deployBSDContractWithTokenLock);
        await bsdContract.connect(producer).withdraw(parseEther("10"));
        await expect(
          bsdContract.connect(producer).mint("ipfs://CID_MINTED", recipient)
        )
          .to.revertedWithCustomError(bsdContract, "InsufficientLockAmount")
          .withArgs(await vaultContract.MIN_LOCK_AMOUNT());
      });
      it("should revert if recpient address has NOT Recipient role ", async () => {
        const { bsdContract, producer, deployer } = await loadFixture(
          deployBSDContractWithTokenLock
        );
        await expect(
          bsdContract.connect(producer).mint("ipfs://CID_MINTED", deployer)
        ).to.revertedWithCustomError(bsdContract, "InvalidRecipient");
      });
    });

    describe("Result", () => {
      it("should mint a new token to producer", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        expect(await bsdContract.balanceOf(producer)).to.equal(1);
      });
      it("should increment token id", async () => {
        const { bsdContract, producer, recipient } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        //Check token ID from second minted token with event
        await expect(
          bsdContract.connect(producer).mint("ipfs://CID_MINTED", recipient)
        )
          .to.emit(bsdContract, "Transfer")
          .withArgs(ZeroAddress, producer.address, 1);
      });
      it("should set tokenURI", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        expect(await bsdContract.tokenURI(0)).to.equal("ipfs://CID_MINTED");
      });
      it("should set bsdData", async () => {
        const { bsdContract, producer, recipient } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        // Get bsd data
        const bsdData = await bsdContract.getBsdData(0);
        expect(bsdData.status).to.equal(BsdStatus.Created);
        expect(bsdData.producer.walletAddress).to.equal(producer.address);
        expect(bsdData.transporter.walletAddress).to.equal(ZeroAddress);
        expect(bsdData.recipient.walletAddress).to.equal(recipient.address);
      });
      it("should emit event toRecipient", async () => {
        const { bsdContract, producer, recipient } = await loadFixture(
          deployBSDContractWithTokenLock
        );
        await expect(
          bsdContract.connect(producer).mint("ipfs://CID_MINTED", recipient)
        )
          .to.emit(bsdContract, "toRecipient")
          .withArgs(0, recipient.address);
      });
    });
  });
  describe("4 - Transport", () => {
    describe("Access Control Role", () => {
      it("should NOT revert with transport role", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        ).to.not.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("should revert with producer role", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        const neededRole = await bsdContract.TRANSPORTER_ROLE();
        await expect(
          bsdContract
            .connect(producer)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(producer.address, neededRole);
      });
      it("should revert with recipient role", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        const neededRole = await bsdContract.TRANSPORTER_ROLE();
        await expect(
          bsdContract
            .connect(recipient)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(recipient.address, neededRole);
      });
      it("should revert with unknown role", async () => {
        const { bsdContract, unkownRole } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        const neededRole = await bsdContract.TRANSPORTER_ROLE();
        await expect(
          bsdContract
            .connect(unkownRole)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unkownRole.address, neededRole);
      });
    });

    describe("Extra Access Control", () => {
      it("should revert if lock amount is insufficient", async () => {
        const { bsdContract, transporter, vaultContract } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await bsdContract.connect(transporter).withdraw(parseEther("10"));
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        )
          .to.revertedWithCustomError(bsdContract, "InsufficientLockAmount")
          .withArgs(await vaultContract.MIN_LOCK_AMOUNT());
      });
      it("should revert if BSD have not created status (Shipped status case)", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not created status (Accepted status case) ", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not created status (Refused status case)", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not created status (Processed status case)", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
    });
    describe("Result", () => {
      it("should approve transporter to operate token", async () => {
        const { bsdContract, producer, transporter } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transportWaste(0, "ipfs://CID_SHIPPED", (await time.latest()) + 60)
        )
          .to.emit(bsdContract, "Approval")
          .withArgs(producer.address, transporter.address, 0);
      });
      it("should tranfert token to transporter", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        expect(await bsdContract.ownerOf(0)).to.be.equal(transporter.address);
      });
      it("should set tokenURI", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        expect(await bsdContract.tokenURI(0)).to.equal("ipfs://CID_SHIPPED");
      });
      it("should set bsdData to shipped and with transporter address", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Get bsd data
        const bsdData = await bsdContract.getBsdData(0);
        expect(bsdData.status).to.equal(BsdStatus.Shipped);
        expect(bsdData.transporter.walletAddress).to.equal(transporter.address);
        expect(bsdData.transporter.pickupDate).to.equal(await time.latest());
        expect(bsdData.transporter.deliveryDate).to.be.above(
          await time.latest()
        );
      });
    });
  });
  describe("5- Recipient Reject", () => {
    describe("Access Control role", () => {
      it("should NOT revert with recipient role", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.not.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("should revert with producer role", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(producer)
            .recipientReject(0, "ipfs://CID_REJECTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(producer.address, neededRole);
      });
      it("should revert with transporter role", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(transporter)
            .recipientReject(0, "ipfs://CID_REJECTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(transporter.address, neededRole);
      });
      it("should revert with unknown role address", async () => {
        const { bsdContract, unkownRole } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(unkownRole)
            .recipientReject(0, "ipfs://CID_REJECTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unkownRole.address, neededRole);
      });
    });
    describe("Extra Access Control", () => {
      it("should revert if BSD have not shipped status (Created status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Accepted status case) ", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Refused status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Processed status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if recipient is not BSD's recipient", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsdToSecondRecipient
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
    });
    describe("Result", () => {
      it("should approve recipient to operate token", async () => {
        const { bsdContract, transporter, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        )
          .to.emit(bsdContract, "Approval")
          .withArgs(transporter.address, recipient.address, 0);
      });
      it("should tranfert token to producer", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        expect(await bsdContract.ownerOf(0)).to.be.equal(producer.address);
      });
      it("should set tokenURI", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        expect(await bsdContract.tokenURI(0)).to.equal("ipfs://CID_REJECTED");
      });
      it("should set bsdData status to rejected", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        // Get bsd data
        const bsdData = await bsdContract.getBsdData(0);
        expect(bsdData.status).to.equal(BsdStatus.Rejected);
        expect(bsdData.recipient.wasteDecisionDate).to.equal(
          await time.latest()
        );
      });
      it("should slash transporter lock token if delivery past", async () => {
        const { bsdContract, transporter, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Reject transport
        await expect(
          bsdContract
            .connect(recipient)
            .recipientReject(0, "ipfs://CID_REJECTED")
        )
          .to.emit(bsdContract, "userSlashed")
          .withArgs(transporter.address, parseEther("10"));
      });
      it("should change lock token slash transporter if delivery past", async () => {
        const { bsdContract, transporter, recipient,vaultContract } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Reject transport
        await bsdContract.connect(recipient).recipientReject(0, "ipfs://CID_REJECTED")
        expect(await vaultContract.balanceOf(transporter.address)).to.be.equal(0)
      });
      it("should burn slashed token", async () => {
        const { bsdContract, recipient,grcContract,vaultContract } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Reject transport
        await expect(bsdContract.connect(recipient).recipientReject(0, "ipfs://CID_REJECTED")).emit(grcContract,"Transfer").withArgs(vaultContract.target,ZeroAddress,await bsdContract.SLASH_AMOUNT())
      });
    });
  });
  describe("6 - Recipient Accept", () => {
    describe("Access Control role", () => {
      it("should NOT revert with recipient role", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.not.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("should revert with producer role", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(producer)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(producer.address, neededRole);
      });
      it("should revert with transporter role", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(transporter)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(transporter.address, neededRole);
      });
      it("should revert with unknown role address", async () => {
        const { bsdContract, unkownRole } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(unkownRole)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unkownRole.address, neededRole);
      });
    });
    describe("Extra Access Control", () => {
      it("should revert if BSD have not shipped status (Created status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Accepted status case) ", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Refused status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneRejectedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if BSD have not shipped status (Processed status case)", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
      it("should revert if recipient is not BSD's recipient", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsdToSecondRecipient
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        ).to.revertedWithCustomError(bsdContract, "InvalidBSD");
      });
    });
    describe("Result", () => {
      it("should approve recipient to operate token", async () => {
        const { bsdContract, transporter, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        )
          .to.emit(bsdContract, "Approval")
          .withArgs(transporter.address, recipient.address, 0);
      });
      it("should tranfer token to recipient", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        expect(await bsdContract.ownerOf(0)).to.be.equal(recipient.address);
      });
      it("should set tokenURI", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        expect(await bsdContract.tokenURI(0)).to.equal("ipfs://CID_ACCEPTED");
      });
      it("should set bsdData status to accepted", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        // Get bsd data
        const bsdData = await bsdContract.getBsdData(0);
        expect(bsdData.status).to.equal(BsdStatus.Accepted);
        expect(bsdData.recipient.wasteDecisionDate).to.equal(
          await time.latest()
        );
      });
      it("should slash transporter if delivery past", async () => {
        const { bsdContract, transporter, recipient } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Accept transport
        await expect(
          bsdContract
            .connect(recipient)
            .recipientAccept(0, "ipfs://CID_ACCEPTED")
        )
          .to.emit(bsdContract, "userSlashed")
          .withArgs(transporter.address, parseEther("10"));
      });
      it("should change lock token slash transporter if delivery past", async () => {
        const { bsdContract, transporter, recipient,vaultContract } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Accept transport
        await bsdContract.connect(recipient).recipientAccept(0, "ipfs://CID_ACCEPTED")
        expect(await vaultContract.balanceOf(transporter.address)).to.be.equal(0)
      });
      it("should burn slashed token", async () => {
        const { bsdContract, recipient,grcContract,vaultContract } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        await expect(bsdContract.connect(recipient).recipientAccept(0, "ipfs://CID_ACCEPTED")).emit(grcContract,"Transfer").withArgs(vaultContract.target,ZeroAddress,await bsdContract.SLASH_AMOUNT())
      });
    });
  });
  describe("7 - Recipient Process", () => {
    describe("Access Control role", () => {
      it("should NOT revert with recipient role", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        ).to.not.revertedWithCustomError(
          bsdContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("should revert with producer role", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(producer)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(producer.address, neededRole);
      });
      it("should revert with transporter role", async () => {
        const { bsdContract, transporter } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(transporter)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(transporter.address, neededRole);
      });
      it("should revert with unknown role address", async () => {
        const { bsdContract, unkownRole } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        const neededRole = await bsdContract.RECIPIENT_ROLE();
        await expect(
          bsdContract
            .connect(unkownRole)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        )
          .to.revertedWithCustomError(
            bsdContract,
            "AccessControlUnauthorizedAccount"
          )
          .withArgs(unkownRole.address, neededRole);
      });
    });
    describe("Extra Access Control", () => {
      it("should revert if lock amount is insufficient", async () => {
        const { bsdContract, recipient, vaultContract } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        await bsdContract.connect(recipient).withdraw(parseEther("10"));
        await expect(
          bsdContract
            .connect(recipient)
            .recipientProcess(0, "ipfs://CID_SHIPPED")
        )
          .to.revertedWithCustomError(bsdContract, "InsufficientLockAmount")
          .withArgs(await vaultContract.MIN_LOCK_AMOUNT());
      });
      it("should revert if recipient is not BSD owner", async () => {
        const { bsdContract, recipient, recipient2 } = await loadFixture(
          deployBSDContractWithOneShippedBsdToSecondRecipient
        );
        await bsdContract
          .connect(recipient2)
          .recipientAccept(0, "ipfs://CID_ACCEPTED");
        await expect(
          bsdContract
            .connect(recipient)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        )
          .to.revertedWithCustomError(bsdContract, "ERC721IncorrectOwner")
          .withArgs(recipient.address, 0, recipient2.address);
      });
    });
    describe("Result", () => {
      it("should tranfert token to producer", async () => {
        const { bsdContract, producer } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        expect(await bsdContract.ownerOf(0)).to.be.equal(producer.address);
      });
      it("should set tokenURI", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        expect(await bsdContract.tokenURI(0)).to.equal("ipfs://CID_PROCESSED");
      });
      it("should set bsdData status to processed", async () => {
        const { bsdContract } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        // Get bsd data
        const bsdData = await bsdContract.getBsdData(0);
        expect(bsdData.status).to.equal(BsdStatus.Processed);
        expect(bsdData.recipient.finalDate).to.equal(await time.latest());
      });
      it("should slash recepient if procces not done in time", async () => {
        const { bsdContract, recipient } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Reject transport
        await expect(
          bsdContract
            .connect(recipient)
            .recipientProcess(0, "ipfs://CID_PROCESSED")
        )
          .to.emit(bsdContract, "userSlashed")
          .withArgs(recipient.address, parseEther("10"));
      });
      it("should change lock token when slashing Recipient", async () => {
        const { bsdContract, transporter, recipient,vaultContract } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        // Accept transport
        await bsdContract.connect(recipient).recipientProcess(0, "ipfs://CID_PROCESSED")
        expect(await vaultContract.balanceOf(recipient.address)).to.be.equal(0)
      });
      it("should burn slashed token", async () => {
        const { bsdContract, recipient,grcContract,vaultContract } = await loadFixture(
          deployBSDContractWithOneAcceptedBsd
        );
        // Increase time
        await time.increaseTo((await time.latest()) + 120);
        await expect(bsdContract.connect(recipient).recipientProcess(0, "ipfs://CID_PROCESSED")).emit(grcContract,"Transfer").withArgs(vaultContract.target,ZeroAddress,await bsdContract.SLASH_AMOUNT())
      });
      it("should reward users", async () => {
        const { bsdContract, grcContract, producer, transporter, recipient } =
          await loadFixture(deployBSDContractWithOneAcceptedBsd);

        const oldProducerBalance = await grcContract.balanceOf(
          producer.address
        );
        const oldTransporterBalance = await grcContract.balanceOf(
          transporter.address
        );
        const oldRecipientBalance = await grcContract.balanceOf(
          recipient.address
        );
        await bsdContract
          .connect(recipient)
          .recipientProcess(0, "ipfs://CID_PROCESS");

        expect(await grcContract.balanceOf(producer.address)).to.be.equal(
          oldProducerBalance + (await bsdContract.REWARD_MINT_AMOUNT())
        );
        expect(await grcContract.balanceOf(transporter.address)).to.be.equal(
          oldTransporterBalance + (await bsdContract.REWARD_MINT_AMOUNT())
        );
        expect(await grcContract.balanceOf(recipient.address)).to.be.equal(
          oldRecipientBalance + (await bsdContract.REWARD_MINT_AMOUNT())
        );
      });
    });
  });

  describe("8 - Tranfert public functions", () => {
    describe("From producer", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { bsdContract, producer, unkownRole } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract
            .connect(producer)
            .transferFrom(producer.address, unkownRole, 0)
        ).to.revertedWithCustomError(bsdContract, "externalTransfertForbidden");
      });
    });
    describe("From transporter", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { bsdContract, transporter, unkownRole } = await loadFixture(
          deployBSDContractWithOneShippedBsd
        );
        await expect(
          bsdContract
            .connect(transporter)
            .transferFrom(transporter.address, unkownRole, 0)
        ).to.revertedWithCustomError(bsdContract, "externalTransfertForbidden");
      });
    });
    describe("From recipient", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { bsdContract, recipient, unkownRole } = await loadFixture(
          deployBSDContractWithOneProcessedBsd
        );
        await expect(
          bsdContract
            .connect(recipient)
            .transferFrom(recipient.address, unkownRole, 0)
        ).to.revertedWithCustomError(bsdContract, "externalTransfertForbidden");
      });
    });
    describe("to admin", () => {
      it("should transfer to admin", async () => {
        const { bsdContract, producer, deployer } = await loadFixture(
          deployBSDContractWithOneMintedBsd
        );
        await expect(
          bsdContract.connect(producer).transferFrom(producer, deployer, 0)
        ).to.emit(bsdContract, "Transfer");
      });
    });
  });
  describe("9 - Override Functions", () => {
    it("should supportsInterface", async () => {
      const { bsdContract } = await loadFixture(deployBSDContract);
      const ERC165ID = "0x01ffc9a7" as BytesLike;
      expect(await bsdContract.supportsInterface(ERC165ID)).to.be.true;
    });
  });
});

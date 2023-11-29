import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyUint } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BytesLike, ZeroAddress, keccak256 } from "ethers";

// Enum from SmartContract
enum BsdStatus {
  Created,
  Shipped,
  Rejected,
  Accepted,
  Processed,
  Claimed,
}

describe("BSD Contract", () => {
  // Fixture deployement
  async function deployContract() {
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
    const contract = await ethers.deployContract("BSD");

    // Get roles
    const producerRole = await contract.PRODUCER_ROLE();
    const transporterRole = await contract.TRANSPORTER_ROLE();
    const recipientRole = await contract.RECIPIENT_ROLE();

    // Grant roles
    await contract.grantRole(producerRole, producer);
    await contract.grantRole(producerRole, producer2);
    await contract.grantRole(transporterRole, transporter);
    await contract.grantRole(recipientRole, recipient);
    await contract.grantRole(recipientRole, recipient2);

    return {
      contract,
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
   * @returns
   */
  async function deployContractWithOneMintedBsd() {
    const { contract, producer, transporter, recipient, unkownRole } =
      await loadFixture(deployContract);
    await contract.connect(producer).mint("ipfs://CID_MINTED", recipient);
    return { contract, producer, transporter, recipient, unkownRole };
  }

  /**
   * Fixture to deploy BSD contract with 1 BSD shipped
   * @returns
   */
  async function deployContractWithOneShippedBsd() {
    const { contract, producer, transporter, recipient, unkownRole } =
      await loadFixture(deployContractWithOneMintedBsd);
    await contract.connect(transporter).transportWaste(0, "ipfs://CID_SHIPPED");
    return { contract, producer, transporter, recipient, unkownRole };
  }
  /**
   * Fixture to deploy BSD contract with 1 BSD shipped to second recipient
   * @returns
   */
  async function deployContractWithOneShippedBsdToSecondRecipient() {
    const {
      contract,
      producer,
      transporter,
      recipient,
      recipient2,
      unkownRole,
    } = await loadFixture(deployContract);
    await contract.connect(producer).mint("ipfs://CID", recipient2);
    await contract.connect(transporter).transportWaste(0, "ipfs://CID_SHIPPED");
    return {
      contract,
      producer,
      transporter,
      recipient,
      recipient2,
      unkownRole,
    };
  }

  /**
   * Fixture to deploy BSD contract with 1 BSD Accepted
   * @returns
   */
  async function deployContractWithOneAcceptedBsd() {
    const { contract, producer, transporter, recipient, unkownRole } =
      await loadFixture(deployContractWithOneShippedBsd);
    await contract.connect(recipient).recipientAccept(0, "ipfs://CID_ACCEPTED");
    return { contract, producer, transporter, recipient, unkownRole };
  }

  /**
   * Fixture to deploy BSD contract with 1 BSD Rejected
   * @returns
   */
  async function deployContractWithOneRejectedBsd() {
    const { contract, producer, transporter, recipient, unkownRole } =
      await loadFixture(deployContractWithOneShippedBsd);
    await contract.connect(recipient).recipientReject(0, "ipfs://CID_REJECTED");
    return { contract, producer, transporter, recipient, unkownRole };
  }
  /**
   * Fixture to deploy BSD contract with 1 BSD processed
   * @returns
   */
  async function deployContractWithOneProcessedBsd() {
    const { contract, producer, transporter, recipient, unkownRole } =
      await loadFixture(deployContractWithOneAcceptedBsd);
    await contract
      .connect(recipient)
      .recipientProcess(0, "ipfs://CID_PROCESSED");
    return { contract, producer, transporter, recipient, unkownRole };
  }

  describe("1 - Deployment", () => {
    it("should set deployer to default admin role", async () => {
      const { contract, deployer } = await loadFixture(deployContract);
      const defaulAdminRole = await contract.DEFAULT_ADMIN_ROLE();
      expect(await contract.hasRole(defaulAdminRole, deployer)).to.be.true;
    });
  });

  describe("2 - Getter", () => {
    it("should return all tokenId of owner", async () => {
      const { contract, producer, producer2, recipient } = await loadFixture(
        deployContract
      );
      // Mint several BSD
      await contract.connect(producer).mint("ipfs://CID", recipient);
      await contract.connect(producer2).mint("ipfs://CID", recipient);
      await contract.connect(producer).mint("ipfs://CID", recipient);
      await contract.connect(producer2).mint("ipfs://CID", recipient);
      await contract.connect(producer).mint("ipfs://CID", recipient);
      await contract.connect(producer2).mint("ipfs://CID", recipient);

      const producerToken = await contract.getTokenIdsOf(producer);
      const producer2Token = await contract.getTokenIdsOf(producer2);

      expect(producerToken).to.be.eql([0n, 2n, 4n]);
      expect(producer2Token).to.be.eql([1n, 3n, 5n]);
    });
  });

  describe("3 - Functionnality", () => {
    describe("Mint", () => {
      describe("Access Control", () => {
        it("should NOT revert with producer role", async () => {
          const { contract, producer, recipient } = await loadFixture(
            deployContract
          );
          await expect(
            contract.connect(producer).mint("ipfs://CID_MINTED", recipient)
          ).to.not.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
          );
        });
        it("should revert with tranporter role", async () => {
          const { contract, transporter, recipient } = await loadFixture(
            deployContract
          );
          const neededRole = await contract.PRODUCER_ROLE();
          await expect(
            contract.connect(transporter).mint("ipfs://CID_MINTED", recipient)
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(transporter.address, neededRole);
        });
        it("should revert with recipient role", async () => {
          const { contract, recipient } = await loadFixture(deployContract);
          const neededRole = await contract.PRODUCER_ROLE();
          await expect(
            contract.connect(recipient).mint("ipfs://CID_MINTED", recipient)
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(recipient.address, neededRole);
        });
        it("should revert with unknown role address", async () => {
          const { contract, recipient, unkownRole } = await loadFixture(
            deployContract
          );
          const neededRole = await contract.PRODUCER_ROLE();
          await expect(
            contract.connect(unkownRole).mint("ipfs://CID_MINTED", recipient)
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(unkownRole.address, neededRole);
        });
      });
      describe("Extra Access Control", () => {
        it("should revert if recpient address has NOT Recipient role ", async () => {
          const { contract, producer, deployer } = await loadFixture(
            deployContract
          );
          await expect(
            contract.connect(producer).mint("ipfs://CID_MINTED", deployer)
          ).to.revertedWithCustomError(contract, "InvalidRecipient");
        });
      });
      describe("Result", () => {
        it("should mint a new token to producer", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          expect(await contract.balanceOf(producer)).to.equal(1);
        });
        it("should increment token id", async () => {
          const { contract, producer, recipient } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          await contract.connect(producer).mint("ipfs://CID_MINTED", recipient);
          //Check token ID from second minted token
          expect(await contract.tokenByIndex(1)).to.equal(1);
        });
        it("should set tokenURI", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          expect(await contract.tokenURI(0)).to.equal("ipfs://CID_MINTED");
        });
        it("should set bsdData", async () => {
          const { contract, producer, recipient } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          // Get bsd data
          const bsdData = await contract.getBsdData(0);
          expect(bsdData.status).to.equal(BsdStatus.Created);
          expect(bsdData.producer).to.equal(producer.address);
          expect(bsdData.transporter).to.equal(ZeroAddress);
          expect(bsdData.recipient).to.equal(recipient.address);
        });
        it("should emit event toRecipient", async () => {
          const { contract, producer, recipient } = await loadFixture(
            deployContract
          );
          await expect(
            contract.connect(producer).mint("ipfs://CID_MINTED", recipient)
          )
            .to.emit(contract, "toRecipient")
            .withArgs(0, recipient.address);
        });
      });
    });
    describe("Transport", () => {
      describe("Access Control Role", () => {
        it("should NOT revert with transport role", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          ).to.not.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
          );
        });
        it("should revert with producer role", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          const neededRole = await contract.TRANSPORTER_ROLE();
          await expect(
            contract.connect(producer).transportWaste(0, "ipfs://CID_SHIPPED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(producer.address, neededRole);
        });
        it("should revert with recipient role", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          const neededRole = await contract.TRANSPORTER_ROLE();
          await expect(
            contract.connect(recipient).transportWaste(0, "ipfs://CID_SHIPPED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(recipient.address, neededRole);
        });
        it("should revert with unknown role", async () => {
          const { contract, unkownRole } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          const neededRole = await contract.TRANSPORTER_ROLE();
          await expect(
            contract.connect(unkownRole).transportWaste(0, "ipfs://CID_SHIPPED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(unkownRole.address, neededRole);
        });
      });

      describe("Extra Access Control", () => {
        it("should revert if BSD have not created status (Shipped status case)", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not created status (Accepted status case) ", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not created status (Refused status case)", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not created status (Processed status case)", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
      });
      describe("Result", () => {
        it("should approve transporter to operate token", async () => {
          const { contract, producer, transporter } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          await expect(
            contract
              .connect(transporter)
              .transportWaste(0, "ipfs://CID_SHIPPED")
          )
            .to.emit(contract, "Approval")
            .withArgs(producer.address, transporter.address, 0);
        });
        it("should tranfert token to transporter", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          expect(await contract.ownerOf(0)).to.be.equal(transporter.address);
        });
        it("should set tokenURI", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          expect(await contract.tokenURI(0)).to.equal("ipfs://CID_SHIPPED");
        });
        it("should set bsdData to shipped and with transporter address", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          // Get bsd data
          const bsdData = await contract.getBsdData(0);
          expect(bsdData.status).to.equal(BsdStatus.Shipped);
          expect(bsdData.transporter).to.equal(transporter.address);
        });
      });
    });
    describe("Recipient Reject", () => {
      describe("Access Control role", () => {
        it("should NOT revert with recipient role", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.not.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
          );
        });
        it("should revert with producer role", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract.connect(producer).recipientReject(0, "ipfs://CID_REJECTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(producer.address, neededRole);
        });
        it("should revert with transporter role", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(transporter)
              .recipientReject(0, "ipfs://CID_REJECTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(transporter.address, neededRole);
        });
        it("should revert with unknown role address", async () => {
          const { contract, unkownRole } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(unkownRole)
              .recipientReject(0, "ipfs://CID_REJECTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(unkownRole.address, neededRole);
        });
      });
      describe("Extra Access Control", () => {
        it("should revert if BSD have not shipped status (Created status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Accepted status case) ", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Refused status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Processed status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if recipient is not BSD's recipient", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneShippedBsdToSecondRecipient
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
      });
      describe("Result", () => {
        it("should approve recipient to operate token", async () => {
          const { contract, transporter, recipient } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientReject(0, "ipfs://CID_REJECTED")
          )
            .to.emit(contract, "Approval")
            .withArgs(transporter.address, recipient.address, 0);
        });
        it("should tranfert token to producer", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          expect(await contract.ownerOf(0)).to.be.equal(producer.address);
        });
        it("should set tokenURI", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          expect(await contract.tokenURI(0)).to.equal("ipfs://CID_REJECTED");
        });
        it("should set bsdData status to rejected", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          // Get bsd data
          const bsdData = await contract.getBsdData(0);
          expect(bsdData.status).to.equal(BsdStatus.Rejected);
        });
      });
    });
    describe("Recipient Accept", () => {
      describe("Access Control role", () => {
        it("should NOT revert with recipient role", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.not.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
          );
        });
        it("should revert with producer role", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract.connect(producer).recipientAccept(0, "ipfs://CID_ACCEPTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(producer.address, neededRole);
        });
        it("should revert with transporter role", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(transporter)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(transporter.address, neededRole);
        });
        it("should revert with unknown role address", async () => {
          const { contract, unkownRole } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(unkownRole)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(unkownRole.address, neededRole);
        });
      });
      describe("Extra Access Control", () => {
        it("should revert if BSD have not shipped status (Created status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneMintedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Accepted status case) ", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Refused status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneRejectedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if BSD have not shipped status (Processed status case)", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
        it("should revert if recipient is not BSD's recipient", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneShippedBsdToSecondRecipient
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          ).to.revertedWithCustomError(contract, "InvalidBSD");
        });
      });
      describe("Result", () => {
        it("should approve recipient to operate token", async () => {
          const { contract, transporter, recipient } = await loadFixture(
            deployContractWithOneShippedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientAccept(0, "ipfs://CID_ACCEPTED")
          )
            .to.emit(contract, "Approval")
            .withArgs(transporter.address, recipient.address, 0);
        });
        it("should tranfert token to recipient", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          expect(await contract.ownerOf(0)).to.be.equal(recipient.address);
        });
        it("should set tokenURI", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          expect(await contract.tokenURI(0)).to.equal("ipfs://CID_ACCEPTED");
        });
        it("should set bsdData status to accepted", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          // Get bsd data
          const bsdData = await contract.getBsdData(0);
          expect(bsdData.status).to.equal(BsdStatus.Accepted);
        });
      });
    });
    describe("Recipient Process", () => {
      describe("Access Control role", () => {
        it("should NOT revert with recipient role", async () => {
          const { contract, recipient } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          await expect(
            contract
              .connect(recipient)
              .recipientProcess(0, "ipfs://CID_PROCESSED")
          ).to.not.revertedWithCustomError(
            contract,
            "AccessControlUnauthorizedAccount"
          );
        });
        it("should revert with producer role", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(producer)
              .recipientProcess(0, "ipfs://CID_PROCESSED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(producer.address, neededRole);
        });
        it("should revert with transporter role", async () => {
          const { contract, transporter } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(transporter)
              .recipientProcess(0, "ipfs://CID_PROCESSED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(transporter.address, neededRole);
        });
        it("should revert with unknown role address", async () => {
          const { contract, unkownRole } = await loadFixture(
            deployContractWithOneAcceptedBsd
          );
          const neededRole = await contract.RECIPIENT_ROLE();
          await expect(
            contract
              .connect(unkownRole)
              .recipientProcess(0, "ipfs://CID_PROCESSED")
          )
            .to.revertedWithCustomError(
              contract,
              "AccessControlUnauthorizedAccount"
            )
            .withArgs(unkownRole.address, neededRole);
        });
      });
      describe("Extra Access Control", () => {
        it("should revert if recipient is not BSD owner", async () => {
          const { contract, recipient, recipient2 } = await loadFixture(
            deployContractWithOneShippedBsdToSecondRecipient
          );
          await contract
            .connect(recipient2)
            .recipientAccept(0, "ipfs://CID_ACCEPTED");
          await expect(
            contract
              .connect(recipient)
              .recipientProcess(0, "ipfs://CID_PROCESSED")
          )
            .to.revertedWithCustomError(contract, "ERC721IncorrectOwner")
            .withArgs(recipient.address, 0, recipient2.address);
        });
      });
      describe("Result", () => {
        it("should tranfert token to producer", async () => {
          const { contract, producer } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          expect(await contract.ownerOf(0)).to.be.equal(producer.address);
        });
        it("should set tokenURI", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          expect(await contract.tokenURI(0)).to.equal("ipfs://CID_PROCESSED");
        });
        it("should set bsdData status to processed", async () => {
          const { contract } = await loadFixture(
            deployContractWithOneProcessedBsd
          );
          // Get bsd data
          const bsdData = await contract.getBsdData(0);
          expect(bsdData.status).to.equal(BsdStatus.Processed);
        });
      });
    });
  });
  describe("4 - Tranfert public functions", () => {
    describe("From producer", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { contract, producer } = await loadFixture(
          deployContractWithOneMintedBsd
        );
        // Random adress from REMIX
        const unkownAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
        await expect(
          contract
            .connect(producer)
            .transferFrom(producer.address, unkownAddress, 0)
        ).to.revertedWithCustomError(contract, "externalTransfertForbibben");
      });
    });
    describe("From transporter", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { contract, transporter } = await loadFixture(
          deployContractWithOneShippedBsd
        );
        // Random adress from REMIX
        const unkownAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
        await expect(
          contract
            .connect(transporter)
            .transferFrom(transporter.address, unkownAddress, 0)
        ).to.revertedWithCustomError(contract, "externalTransfertForbibben");
      });
    });
    describe("From recipient", () => {
      it("should revert if tranfert is made to unknow role address", async () => {
        const { contract, recipient } = await loadFixture(
          deployContractWithOneProcessedBsd
        );
        // Random adress from REMIX
        const unkownAddress = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
        await expect(
          contract
            .connect(recipient)
            .transferFrom(recipient.address, unkownAddress, 0)
        ).to.revertedWithCustomError(contract, "externalTransfertForbibben");
      });
    });
  });
  describe("5 - Override Functions", () => {
    it("supportsInterface", async () => {
      const { contract } = await loadFixture(deployContract);
      const ERC165ID = "0x01ffc9a7" as BytesLike;
      expect(await contract.supportsInterface(ERC165ID)).to.be.true;
    });
  });
});

import { access, mkdir, writeFile } from "fs/promises";
import { ethers, artifacts, network } from "hardhat";
import defaultUsersDev from "../../frontend/data/defaultUsersDev.json";
import defaultUsersProd from "../../frontend/data/defaultUsersProd.json";
import { Addressable } from "ethers";
/**
 * Deploy Script for BSD contract
 * @see https://misc.flogisoft.com/bash/tip_colors_and_formatting for color bash
 */

// Edit these variables if necessary
const bsdContractName = "BSD";
const grcContractName = "GRC";
const grcVaultContractName = "GRCVault";
const addressesProviderContractName = "AddressesProvider";
const exportContractPath = "../frontend/contracts/";

type JSONContract = {
  contractAddress: string | Addressable;
  transactionHash: string;
  blockNumber: number | null;
  abi: any[];
};

async function exportContractConfig(
  contractName: string,
  myJsonContract: JSONContract
) {
  // Write TS file
  try {
    await access(exportContractPath);
  } catch (error) {
    //Directory not exist, need to create it
    try {
      await mkdir(exportContractPath, { recursive: true });
      console.log("Directory created :", exportContractPath);
    } catch (error) {
      console.log(error);
    }
  }
  await writeFile(
    `${exportContractPath}${contractName}.ts`,
    `export const ${contractName.toLowerCase()}ContractConfig=` +
      JSON.stringify(myJsonContract) +
      " as const"
  );
  console.log(
    `${contractName} deployement configuration exported to : \x1B[33m${exportContractPath}${contractName}.ts\x1B[0m`
  );
}

/**
 * Sleep function 
 * @param ms Milliseconds
 */
const sleep = (ms:number) => new Promise(r => setTimeout(r, ms))

async function main() {
  /**
   * ADDRESS PROVIDER CONTRACT
   */
  console.log("\x1B[35m[->TOKEN ADDRESS PROVIDER CONTRACT<-]\x1B[0m");
  const addressesProviderContract = await ethers.deployContract(addressesProviderContractName);
  console.log(
    `${addressesProviderContractName} deployed to ${addressesProviderContract.target} on \x1B[33m${network.name}\x1B[0m`
  );
  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(
      `Command : \x1B[96myarn hardhat verify --network ${network.name} ${addressesProviderContract.target}\x1B[0m`
    );
  }

  /**
   * BSD CONTRACT
   */
  console.log("\x1B[35m[->BSD CONTRACT<-]\x1B[0m");
  const bsdContract = await ethers.deployContract(bsdContractName, [
    addressesProviderContract.target,
  ]);
  await bsdContract.waitForDeployment();
  console.log(
    `${bsdContractName} deployed to ${bsdContract.target} on \x1B[33m${network.name}\x1B[0m`
  );
  // Set BSD Token in TokenAddressesProvider
  await addressesProviderContract.setBSDToken(bsdContract.target);
  console.log(`${bsdContractName} address set in TokenAddressesProvider`);

  // Export contract deployement configuration to frontend TS file with const assertion compatible
  const bsdDeployTx = bsdContract.deploymentTransaction()!;
  const bsdJsonContract = {
    contractAddress: bsdContract.target,
    transactionHash: bsdDeployTx.hash,
    blockNumber: bsdDeployTx.blockNumber,
    abi: (await artifacts.readArtifact(bsdContractName)).abi,
  };
  await exportContractConfig(bsdContractName, bsdJsonContract);

  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(
      `Command : \x1B[96myarn hardhat verify --network ${network.name} ${bsdContract.target} ${addressesProviderContract.target}\x1B[0m`
    );
  }

  /**
   * GRC CONTRACT
   */
  console.log("\x1B[35m[->GRC TOKEN CONTRACT<-]\x1B[0m");
  const grcContract = await ethers.deployContract(grcContractName, [
    addressesProviderContract.target,
  ]);
  await grcContract.waitForDeployment();
  console.log(
    `${grcContractName} deployed to ${grcContract.target} on \x1B[33m${network.name}\x1B[0m`
  );
  // Set BSD Token in TokenAddressesProvider
  await addressesProviderContract.setGRCToken(grcContract.target);
  console.log(`${grcContractName} address set in TokenAddressesProvider`);

  // Export contract deployement configuration to frontend TS file with const assertion compatible
  const grcDeployTx = grcContract.deploymentTransaction()!;
  const grcJsonContract = {
    contractAddress: grcContract.target,
    transactionHash: grcDeployTx.hash,
    blockNumber: grcDeployTx.blockNumber,
    abi: (await artifacts.readArtifact(grcContractName)).abi,
  };
  await exportContractConfig(grcContractName, grcJsonContract);

  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(
      `Command : \x1B[96myarn hardhat verify --network ${network.name} ${grcContract.target} ${addressesProviderContract.target}\x1B[0m`
    );
  }

  /**
   * GRC Vault CONTRACT
   */
  console.log("\x1B[35m[->GRC Vault CONTRACT<-]\x1B[0m");
  const grcVaultContract = await ethers.deployContract(grcVaultContractName, [
    addressesProviderContract.target,
  ]);
  await grcVaultContract.waitForDeployment();
  console.log(
    `${grcVaultContractName} deployed to ${grcVaultContract.target} on \x1B[33m${network.name}\x1B[0m`
  );
  // Set GRC vault in AddressesProvider
  await addressesProviderContract.setGRCVault(grcVaultContract.target);
  console.log(`${grcVaultContractName} address set in AddressesProvider`);

  // Export contract deployement configuration to frontend TS file with const assertion compatible
  const grcVaultDeployTx = grcVaultContract.deploymentTransaction()!;
  const grcVaultJsonContract = {
    contractAddress: grcVaultContract.target,
    transactionHash: grcVaultDeployTx.hash,
    blockNumber: grcVaultDeployTx.blockNumber,
    abi: (await artifacts.readArtifact(grcVaultContractName)).abi,
  };
  await exportContractConfig(grcVaultContractName, grcVaultJsonContract);

  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(
      `Command : \x1B[96myarn hardhat verify --network ${network.name} ${grcVaultContract.target} ${addressesProviderContract.target}\x1B[0m`
    );
  }
  console.log("Wait 4sec before initialisation");
  await sleep(4000);
  /**
   * CONTRACTS INITIALISATION
   */
  console.log("\x1B[35m[->INITIALISATION<-]\x1B[0m");
  // Initialize BSD Contract
  await bsdContract.initialize();
  console.log(`BSD contract \x1B[32minitialized\x1B[0m`);

  // Initialize GRC Contract
  await grcContract.initialize();
  console.log(`GRC contract \x1B[32minitialized\x1B[0m`);

  // Initialize GRC Contract
  await grcVaultContract.initialize();
  console.log(`GRCVault contract \x1B[32minitialized\x1B[0m`);

  /**
   * CONFIGURATION
   */
  console.log("\x1B[35m[->CONFIGURATION<-]\x1B[0m");
  if (network.name === "localhost") {
    // Producer
    const producerRole = await bsdContract.PRODUCER_ROLE();
    await bsdContract.grantRole(
      producerRole,
      defaultUsersDev.producers[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mProducer\x1B[0m to",
      defaultUsersDev.producers[0].walletAddress
    );
    await bsdContract.onboarding(defaultUsersDev.producers[0].walletAddress);
    console.log(
      `Mint GRC token to \x1B[36m${defaultUsersDev.producers[0].walletAddress}\x1B[0m`
    );

    // Transporter
    const transporterRole = await bsdContract.TRANSPORTER_ROLE();
    await bsdContract.grantRole(
      transporterRole,
      defaultUsersDev.transporters[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mTransporter\x1B[0m to",
      defaultUsersDev.transporters[0].walletAddress
    );
    await bsdContract.onboarding(defaultUsersDev.transporters[0].walletAddress);
    console.log(
      `Mint GRC token to \x1B[36m${defaultUsersDev.transporters[0].walletAddress}\x1B[0m`
    );

    // Recipient
    const recipientRole = await bsdContract.RECIPIENT_ROLE();
    await bsdContract.grantRole(
      recipientRole,
      defaultUsersDev.recipients[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mRecipient\x1B[0m to",
      defaultUsersDev.recipients[0].walletAddress
    );
    await bsdContract.onboarding(defaultUsersDev.recipients[0].walletAddress);
    console.log(
      `Mint GRC token to \x1B[36m${defaultUsersDev.recipients[0].walletAddress}\x1B[0m`
    );
  }
  if (network.name === "mumbai") {
    // Producer
    const producerRole = await bsdContract.PRODUCER_ROLE();
    for await (const producer of defaultUsersProd.producers) {
      await bsdContract.grantRole(producerRole, producer.walletAddress);
      console.log(
        "Grant role \x1B[36mProducer\x1B[0m to",
        producer.walletAddress
      );
      await bsdContract.onboarding(producer.walletAddress);
      console.log(`Mint GRC token to \x1B[36m${producer.walletAddress}\x1B[0m`);
    }

    // Transporter
    const transporterRole = await bsdContract.TRANSPORTER_ROLE();
    for await (const transporter of defaultUsersProd.transporters) {
      await bsdContract.grantRole(transporterRole, transporter.walletAddress);
      console.log(
        "Grant role \x1B[36mTransporter\x1B[0m to",
        transporter.walletAddress
      );
      await bsdContract.onboarding(transporter.walletAddress);
      console.log(
        `Mint GRC token to \x1B[36m${transporter.walletAddress}\x1B[0m`
      );
    }

    // Recipient
    const recipientRole = await bsdContract.RECIPIENT_ROLE();
    for await (const recipient of defaultUsersProd.recipients) {
      await bsdContract.grantRole(recipientRole, recipient.walletAddress);
      console.log(
        "Grant role \x1B[36mRecipient\x1B[0m to",
        recipient.walletAddress
      );
      await bsdContract.onboarding(recipient.walletAddress);
      console.log(
        `Mint GRC token to \x1B[36m${recipient.walletAddress}\x1B[0m`
      );
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

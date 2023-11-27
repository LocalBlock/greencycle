import { access, mkdir, writeFile } from "fs/promises";
import { ethers, artifacts, network } from "hardhat";
import defaultUsersDev from "../../frontend/data/defaultUsersDev.json";
import defaultUsersProd from "../../frontend/data/defaultUsersProd.json";
/**
 * Deploy Script for BSD contract
 * @see https://misc.flogisoft.com/bash/tip_colors_and_formatting for color bash
 */

// Edit these variables if necessary
const contractName = "BSD";
const exportContractPath = "../frontend/contracts/";

async function main() {
  console.log("\x1B[35m[Deployement]\x1B[0m");
  const contract = await ethers.deployContract(contractName);
  await contract.waitForDeployment();
  console.log(
    `${contractName} deployed to ${contract.target} on \x1B[33m${network.name}\x1B[0m`
  );

  // Export contract deployement configuration to frontend TS file with const assertion compatible
  const { hash, blockNumber } = contract.deploymentTransaction()!;
  const myJsonContract = {
    contractAddress: contract.target,
    transactionHash: hash,
    blockNumber: blockNumber,
    abi: (await artifacts.readArtifact(contractName)).abi,
  };

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

  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(
      `Command : \x1B[96myarn hardhat verify --network ${network.name} ${contract.target}\x1B[0m`
    );
  }

  console.log("\x1B[35m[Configuration]\x1B[0m");
  // Grant role to defaultusers
  if (network.name === "localhost") {
    // In local blockchain only first user for each role

    // Producer
    const producerRole = await contract.PRODUCER_ROLE();
    await contract.grantRole(
      producerRole,
      defaultUsersDev.producers[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mProducer\x1B[0m to",
      defaultUsersDev.producers[0].walletAddress
    );

    // Transporter
    const transporterRole = await contract.TRANSPORTER_ROLE();
    await contract.grantRole(
      transporterRole,
      defaultUsersDev.transporters[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mTransporter\x1B[0m to",
      defaultUsersDev.transporters[0].walletAddress
    );

    // Recipient
    const recipientRole = await contract.RECIPIENT_ROLE();
    await contract.grantRole(
      recipientRole,
      defaultUsersDev.recipients[0].walletAddress
    );
    console.log(
      "Grant role \x1B[36mRecipient\x1B[0m to",
      defaultUsersDev.recipients[0].walletAddress
    );
  }
  if (network.name === "mumbai") {
    // Producer
    const producerRole = await contract.PRODUCER_ROLE();
    for await (const producer of defaultUsersProd.producers) {
      await contract.grantRole(producerRole, producer.walletAddress);
      console.log(
        "Grant role \x1B[36mProducer\x1B[0m to",
        producer.walletAddress
      );
    }

    // Transporter
    const transporterRole = await contract.TRANSPORTER_ROLE();
    for await (const transporter of defaultUsersProd.transporters) {
      await contract.grantRole(transporterRole, transporter.walletAddress);
      console.log(
        "Grant role \x1B[36mTransporter\x1B[0m to",
        transporter.walletAddress
      );
    }

    // Recipient
    const recipientRole = await contract.RECIPIENT_ROLE();
    for await (const recipient of defaultUsersProd.recipients) {
      await contract.grantRole(recipientRole, recipient.walletAddress);
      console.log(
        "Grant role \x1B[36mRecipient\x1B[0m to",
        recipient.walletAddress
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

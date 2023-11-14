import { access, mkdir, writeFile } from "fs/promises";
import { ethers, artifacts, network } from "hardhat";

/**
 * Deploy Script for Voting contract
 * @see https://misc.flogisoft.com/bash/tip_colors_and_formatting for color bash
 */

// Edit these variables if necessary
const contractName = "Voting"
const exportContractPath = "../frontend/contracts/"

async function main() {
  console.log("\x1B[35m[Deployement]\x1B[0m");
  const contract = await ethers.deployContract(contractName);
  await contract.waitForDeployment();
  console.log(`${contractName} deployed to ${contract.target} on \x1B[33m${network.name}\x1B[0m`);

  // Export contract deployement configuration to frontend TS file with const assertion compatible 
  const { hash, blockNumber } = contract.deploymentTransaction()!
  const myJsonContract = {
    contractAddress: contract.target,
    transactionHash: hash,
    blockNumber: blockNumber,
    abi: (await artifacts.readArtifact(contractName)).abi
  }
  // Write TS file
  try {
    await access(exportContractPath)
  } catch (error) {
    //Directory not exist, need to create it
    try {
      await mkdir(exportContractPath, { recursive: true })
      console.log("Directory created :", exportContractPath);
    } catch (error) {
      console.log(error);
    }
  }
  await writeFile(`${exportContractPath}${contractName}.ts`, `export const ${contractName.toLowerCase()}ContractConfig=` + JSON.stringify(myJsonContract) + " as const")
  console.log(`${contractName} deployement configuration exported to : \x1B[33m${exportContractPath}${contractName}.ts\x1B[0m`);

  // Hardat verify helper
  if (network.name != "localhost") {
    console.log(`\x1B[32m[Verify your contract]\x1B[0m`);
    console.log(`Command : \x1B[96myarn hardat verify --network ${network.name} ${contract.target}\x1B[0m`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

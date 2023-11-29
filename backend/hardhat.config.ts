import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer"

//Secrets
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },

  },
  // /!\  Permet de configurer la vérifications sur Etherscan
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    coinmarketcap: COINMARKETCAP_API_KEY,
    currency: "EUR",
    token:"MATIC",
    gasPriceApi:"https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    enabled: false,
  },
  solidity: "0.8.20",
};

export default config;

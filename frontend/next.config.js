/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // For supporting docker in production
  // webpack: (config) => {
  //   config.externals.push("pino-pretty"); //prevent Module not found: Can't resolve 'pino-pretty' @see https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  //   return config;
  // },
};

module.exports = nextConfig;

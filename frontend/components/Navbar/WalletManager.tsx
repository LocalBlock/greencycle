import {
  Badge,
  Button,
  useToast,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Flex,
  IconButton,
  useClipboard,
  SkeletonText,
  Tooltip,
  Box,
} from "@chakra-ui/react";
import {
  Address,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useBalance,
} from "wagmi";
import Image from "next/image";
import { FaCopy, FaCircleCheck, FaWallet, FaCircleInfo } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import { RoleContext } from "@/contexts/RoleProvider";
import { getGrcTokenLock, getBalanceOf } from "@/utils/grc";
import Lock from "../Grc/Lock";
import Unlock from "../Grc/Unlock";
import { ConstantsContext } from "@/contexts/ConstantsProvider";

function shortAddress(address: Address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}
function shortBalance(balance: string | undefined) {
  if (!balance) return "0";
  const temp = balance.split(".");
  if (temp.length > 1) {
    return temp[0] + "." + temp[1].slice(0, 5); // X characters after decimal
  } else {
    return temp[0];
  }
}

function ConnectedWallet() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const balance = useBalance({ address, staleTime: 60_000 });
  const { disconnect } = useDisconnect();
  const { onCopy, hasCopied } = useClipboard(address!);
  const role = useContext(RoleContext);
  const [grcToken, setGrcToken] = useState("");
  const [grcTokenLock, setGrcTokenLock] = useState("");
  const constants = useContext(ConstantsContext);

  useEffect(() => {
    const fetchGRCBalance = async () => {
      setGrcToken(await getBalanceOf(address!));
      setGrcTokenLock(await getGrcTokenLock(address!));
    };

    fetchGRCBalance();

    window.addEventListener("grcLock", fetchGRCBalance);
    window.addEventListener("grcUnlock", fetchGRCBalance);
    return () => {
      window.removeEventListener("grcLock", fetchGRCBalance); //Cleanup
      window.removeEventListener("grcUnlock", fetchGRCBalance); //Cleanup
    };
  }, [address]);

  return (
    <Popover placement={"bottom-end"}>
      <PopoverTrigger>
        <Button leftIcon={<FaWallet />}>
          {shortAddress(address as Address)}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          <Text>{shortAddress(address as Address)}</Text>
          <SkeletonText
            isLoaded={!balance.isFetching}
            noOfLines={1}
            width={"30"}
            skeletonHeight={6}
          >
            <b>
              {shortBalance(balance.data?.formatted)} {balance.data?.symbol}
            </b>
          </SkeletonText>

          <Flex alignItems={"center"}>
            Connected to {chain?.name}&nbsp;
            {chain?.testnet ? (
              <Badge colorScheme="yellow">Testnet</Badge>
            ) : chain?.name === "Hardhat" ? (
              <Badge colorScheme="purple">hardhat</Badge>
            ) : (
              <Badge colorScheme="blue">Mainnet</Badge>
            )}
          </Flex>
        </PopoverHeader>
        <PopoverBody>
          <Text>Profil : {role ?? "Inconnu"}</Text>
          <Text>
            GreenCycle Token : <b>{grcToken} GRC</b>
          </Text>
          <Flex>
            <Text>GRC bloqué</Text>
            &nbsp;:&nbsp;
            <Text color={Number(grcTokenLock) < constants?.vault.minLockAmount!? "red" : "orange.500"}>
              <b>{grcTokenLock} GRC</b>
            </Text>
            &nbsp;
            <Tooltip label={"Montant minimum : "+constants?.vault.minLockAmount} placement="top">
              <Box>
                <FaCircleInfo />
              </Box>
            </Tooltip>
          </Flex>
          <Flex justifyContent={"center"} mt={2} gap={2}>
            <Lock currentLockAmount={grcTokenLock}/>
            <Unlock currentLockAmount={grcTokenLock}/>

          </Flex>
        </PopoverBody>
        <PopoverFooter>
          <Flex alignItems={"center"} gap={2}>
            <IconButton
              icon={hasCopied ? <FaCircleCheck /> : <FaCopy />}
              size={"xs"}
              aria-label="copy"
              onClick={onCopy}
            />
            <Button size={"xs"} onClick={() => disconnect()}>
              Disconnect
            </Button>

          </Flex>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function ConnectWallet() {
  const { connect, connectors, isLoading } = useConnect();
  const metatmaskConnector = connectors[0];
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const toast = useToast();

  const onConnect = () => {
    if (!metatmaskConnector.ready) {
      toast({
        title: "Error",
        description: (
          <>
            <Text>Metamask is not installed</Text>
            <Text>Install metamask extension browser first</Text>
          </>
        ),
        status: "error",
      });
      return;
    }
    connect({ connector: metatmaskConnector });
  };

  return isConnected ? (
    <Button onClick={() => disconnect()}>{address}</Button>
  ) : (
    <Button
      isLoading={isLoading}
      loadingText={"Connecting..."}
      onClick={onConnect}
    >
      <Image src="/metamask.svg" alt="Metamask" width={20} height={20} />
      &nbsp;Connect Wallet
    </Button>
  );
}

export default function WalletManager() {
  const { isConnected } = useAccount();
  return isConnected ? <ConnectedWallet /> : <ConnectWallet />;
}

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
import { FaCopy, FaCircleCheck, FaWallet } from "react-icons/fa6";
import { useContext } from "react";
import { RoleContext } from "@/contexts/role-provider";

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
          <Text>GRC token : Soon™ 😏</Text>
        </PopoverBody>
        <PopoverFooter>
          <IconButton
            icon={hasCopied ? <FaCircleCheck /> : <FaCopy />}
            size={"xs"}
            aria-label="copy"
            onClick={onCopy}
          />{" "}
          <Button size={"xs"} onClick={() => disconnect()}>
            Disconnect
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

function ConnectWallet() {
  const { connect, connectors, isLoading } =
    useConnect();
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

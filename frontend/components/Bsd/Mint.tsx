import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Image,
  Box,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { bsdContractConfig } from "@/contracts/BSD";
import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import TxStepper from "@/components/Bsd/TxStepper";
import { useState } from "react";
import { Producer, Recipient, TxSteps, Waste } from "@/types/types";
import { initMetadata, uploadToIpfs } from "@/utils/metadata";
import QRCode from "qrcode";
import { usePublicClient } from "wagmi";
import NextLink from 'next/link'

type Props = {
  isButtondisabled: boolean;
  waste: Waste;
  producer: Producer;
  recipient: Recipient;
};

const steps: TxSteps = [
  { status: "idle", description: "Confirmer l'action" },
  { status: "ipfs", description: "Upload sur IPFS" },
  { status: "loading", description: "Transaction en attente" },
  { status: "success", description: "Transaction completée" },
];

export default function Mint({
  isButtondisabled,
  waste,
  producer,
  recipient,
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cid, setCid] = useState("");
  const [tokenId, setTokenId] = useState<Number>();
  const [status, setStatus] = useState<
    "idle" | "error" | "ipfs" | "success" | "loading"
  >("idle");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ title: "", description: "" });
  const [qrCode, setQrCode] = useState("");
  const publicClient = usePublicClient();

  const mint = async () => {
    try {
      // Update metadata
      const newMetadata = initMetadata(producer, recipient, waste);

      // Upload to ipfs
      setStatus("ipfs");
      const cid = await uploadToIpfs(newMetadata!);
      setCid(cid);

      // Prepare Transaction
      setStatus("loading");
      const { request } = await prepareWriteContract({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        functionName: "mint",
        args: ["ipfs://" + cid, newMetadata.recipient.walletAddress],
      });

      // Write transaction
      const { hash } = await writeContract(request);

      // Wait for transaction
      const data = await waitForTransaction({
        hash,
      });

      // Get event (not really necessary, preference for clear code)
      const logs = await publicClient.getContractEvents({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        eventName: "MetadataUpdate",
        blockHash: data.blockHash,
      });

      // Find corresponding log from mint transaction for tokenId
      const eventLogfromMint = logs.find(
        (log) => log.transactionHash === hash
      )!;
      const newTokenId = Number(eventLogfromMint.args._tokenId);
      setTokenId(newTokenId);

      // Set QrCode
      setQrCode(await QRCode.toDataURL(newTokenId.toString(), { width: 150 }));

      // Finish
      setStatus("success");
    } catch (error) {
      setIsError(true);
      setStatus("error");
      if (error instanceof BaseError) {
        const revertError = error.walk(
          (error) => error instanceof ContractFunctionRevertedError
        );
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? "";
          // do something with `errorName`
          console.log("Revert");
          setError({ title: errorName, description: revertError.shortMessage });
          console.log(revertError);
        } else {
          console.log("Base error");
          setError({ title: error.name, description: error.shortMessage });
        }
      } else {
        console.log("Unknown error");
        const unknownError = error as Error;
        setError({
          title: unknownError.name,
          description: unknownError.message,
        });
      }
    }
  };
  //console.log("[Render] Mint", bsdMetaData);
  return (
    <>
      <Button isDisabled={isButtondisabled} onClick={onOpen}>
        Créer un BSD
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsError(false);
          setStatus("idle");
          setQrCode("");
        }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mint BSD</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDirection={"column"} gap={4}>
              {isError && (
                <Alert status="error" flexDirection={"column"}>
                  <Flex>
                    <AlertIcon />
                    <AlertTitle>{error.title}</AlertTitle>
                  </Flex>
                  <AlertDescription>{error.description}</AlertDescription>
                </Alert>
              )}
              <TxStepper status={status} steps={steps}/>
              {qrCode && (
                <Flex direction={"column"} gap={5}>
                  <Alert status="success">
                    <AlertIcon />
                    <AlertTitle>Bsd Créé</AlertTitle>
                  </Alert>
                  <Box margin={"auto"}>
                  <Tooltip label='Cliquez pour scanner'>
                  <Link as={NextLink} href={`/bsd/${tokenId}`} scroll={false}>
                    <Image src={qrCode} boxSize={"150px"} alt="test" /></Link></Tooltip>
                  </Box>
                </Flex>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              hidden={
                status === "idle" || status === "ipfs" || status === "loading"
              }
              mr={3}
              onClick={() => {
                onClose();
                setIsError(false);
                setStatus("idle");
                setQrCode("");
              }}
            >
              Close
            </Button>
            <Button
              hidden={status === "success" || status === "error"}
              isDisabled={isError}
              isLoading={status === "loading" || status === "ipfs"}
              onClick={mint}
            >
              Mint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

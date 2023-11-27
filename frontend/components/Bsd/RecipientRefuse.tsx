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
  FormControl,
  FormLabel,
  Input,
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
import { Bsd } from "@/types/types";
import { updateMetadataRecipientReject, uploadToIpfs } from "@/utils/metadata";

type Props = {
  bsd: Bsd;
};

export default function Transport({ bsd }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState<
    "idle" | "error" | "ipfs" | "success" | "loading"
  >("idle");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ title: "", description: "" });
  const [reason, setReason] = useState("");

  const reject = async () => {
    try {
      // Update Metadata
      const newMetadata = updateMetadataRecipientReject(bsd.metadata, reason);

      //Upload to ipfs
      setStatus("ipfs");
      const cid = await uploadToIpfs(newMetadata);
      setCid(cid);
      
      // Prepare Transaction
      setStatus("loading");
      const { request } = await prepareWriteContract({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        functionName: "recipientReject",
        args: [BigInt(bsd.id), "ipfs://" + cid],
      });

      // Write transaction
      const { hash } = await writeContract(request);

      // Wait for transaction
      const data = await waitForTransaction({
        hash,
      });

      // Finish
      setStatus("success");

      // Emit event
      setTimeout(() => {
        const event = new CustomEvent("recipientRejected");
        console.log("Emit event : recipientRejected");
        window.dispatchEvent(event);

      },3000)
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
  return (
    <>
      <Button onClick={onOpen} colorScheme="red">
        Refuser
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsError(false);
          setStatus("idle");
        }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Refuser un déchet</ModalHeader>
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
              <TxStepper status={status} />
              {status != "success" && (
                <FormControl isRequired>
                  <FormLabel>Raison</FormLabel>
                  <Input
                    placeholder="Indiquez la raison du refu"
                    onChange={(e) => setReason(e.target.value)}
                  />
                </FormControl>
              )}
              {status === "success" && (
                <Flex direction={"column"} gap={5}>
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertTitle>Déchet refusé</AlertTitle>
                    <AlertDescription>
                      Cette fenêtre va se fermer dans 3 secondes
                    </AlertDescription>
                  </Alert>
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
              }}
            >
              Close
            </Button>
            <Button
              hidden={status === "success" || status === "error"}
              isDisabled={isError}
              isLoading={status === "loading" || status === "ipfs"}
              onClick={reject}
            >
              Refuser le dechet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

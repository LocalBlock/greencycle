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
  InputGroup,
  InputRightAddon,
  FormHelperText,
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
import { Bsd, TxSteps } from "@/types/types";
import { updateMetadataRecipientAccept, uploadToIpfs } from "@/utils/metadata";

type Props = {
  bsd: Bsd;
};

const steps: TxSteps = [
  { status: "idle", description: "Confirmer l'action" },
  { status: "ipfs", description: "Upload sur IPFS" },
  { status: "loading", description: "Transaction en attente" },
  { status: "success", description: "Transaction completée" },
];

export default function Transport({ bsd }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState<
    "idle" | "error" | "ipfs" | "success" | "loading"
  >("idle");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ title: "", description: "" });
  const [quantity, setQuantity] = useState(0);

  const accept = async () => {
    try {
      // Update Metadata
      const newMetadata = updateMetadataRecipientAccept(bsd.metadata, quantity);

      //Upload to ipfs
      setStatus("ipfs");
      const cid = await uploadToIpfs(newMetadata);
      setCid(cid);

      // Prepare Transaction
      setStatus("loading");
      const { request } = await prepareWriteContract({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        functionName: "recipientAccept",
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
        const event = new CustomEvent("recipientAccepted");
        console.log("Emit event : recipientAccepted");
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
      <Button onClick={onOpen} colorScheme="green">
        Accepter
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
          <ModalHeader>Accepter un déchet</ModalHeader>
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
              {status != "success" && (
                <FormControl isRequired>
                  <FormLabel>Quantité</FormLabel>
                  <InputGroup width={180}>
                    <Input
                      maxWidth={20}
                      type="number"
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <InputRightAddon children="tonne(s)" />
                  </InputGroup>
                  <FormHelperText>Indiquez la quantité recu</FormHelperText>
                </FormControl>
              )}
              {status === "success" && (
                <Flex direction={"column"} gap={5}>
                  <Alert status="success">
                    <AlertIcon />
                    <AlertTitle>Déchet accepté</AlertTitle>
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
              isDisabled={isError || quantity === 0}
              isLoading={status === "loading" || status === "ipfs"}
              onClick={accept}
            >
              Accepter le dechet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

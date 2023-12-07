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
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Text,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { BaseError, ContractFunctionRevertedError, parseEther } from "viem";

import {
  prepareWriteContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import TxStepper from "@/components/Bsd/TxStepper";
import { useState } from "react";

import { bsdContractConfig } from "@/contracts/BSD";

import { FaUnlock } from "react-icons/fa6";

import { TxSteps } from "@/types/types";

const steps: TxSteps = [
  { status: "idle", description: "Confirmer l'action" },
  { status: "loading", description: "Transaction en attente" },
  { status: "success", description: "Transaction completée" },
];

export default function Lock({
  currentLockAmount,
}: {
  currentLockAmount: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [status, setStatus] = useState<
    "idle" | "error" | "approve" | "success" | "loading"
  >("idle");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ title: "", description: "" });

  const [unlockAmount, setUnlockAmount] = useState(0);

  const unlock = async () => {
    try {
      // Prepare lock Transaction
      const withdrawPrepare = await prepareWriteContract({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        functionName: "withdraw",
        args: [parseEther(unlockAmount.toString())],
      });

      // Write approve transaction
      const withdrawWrite = await writeContract(withdrawPrepare.request);
      // Wait for transaction
      const withdrawTX = await waitForTransaction({ hash: withdrawWrite.hash });

      // Send event
      const event = new CustomEvent("grcUnlock");
      console.log("Emit event : grcUnlock");
      window.dispatchEvent(event);

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
        console.log(error);
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
      <Button
        size={"xs"}
        onClick={onOpen}
        colorScheme={"green"}
        leftIcon={<FaUnlock />}
      >
        Débloquer des GRC
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
          <ModalHeader>Débloquer des GRC</ModalHeader>
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
              <TxStepper status={status} steps={steps} />
              {status != "success" && (
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    GRC Bloqué : <b>{currentLockAmount}</b> GRC
                  </AlertDescription>
                </Alert>
              )}
              {status != "success" && (
                <FormControl isRequired>
                  <FormLabel>Montant</FormLabel>
                  <InputGroup width={180}>
                    <Input
                      maxWidth={20}
                      type="number"
                      max={Number(currentLockAmount)}
                      onChange={(e) => setUnlockAmount(Number(e.target.value))}
                    />
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <InputRightAddon children="GRC" />
                  </InputGroup>
                  <FormHelperText>
                    Indiquez la nombre de GRC que vous voulez débloquer
                  </FormHelperText>
                </FormControl>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              hidden={
                status === "idle" ||
                status === "approve" ||
                status === "loading"
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
              isLoading={status === "loading" || status === "approve"}
              onClick={unlock}
            >
              Débloquer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

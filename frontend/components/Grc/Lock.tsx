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
import { useContext, useState } from "react";

import { bsdContractConfig } from "@/contracts/BSD";
import { grcContractConfig } from "@/contracts/GRC";
import { grcvaultContractConfig } from "@/contracts/GRCVault";

import { FaLock } from "react-icons/fa6";
import { ConstantsContext } from "@/contexts/ConstantsProvider";
import { TxSteps } from "@/types/types";

const steps: TxSteps = [
  { status: "idle", description: "Confirmer l'action" },
  { status: "approve", description: "Approbation en attente" },
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

  const [lockAmount, setLockAmount] = useState(0);
  const constants = useContext(ConstantsContext);

  const lock = async () => {
    try {
      // Prepare approve transaction
      setStatus("approve");
      const approvePrepare = await prepareWriteContract({
        address: grcContractConfig.contractAddress,
        abi: grcContractConfig.abi,
        functionName: "approve",
        args: [
          grcvaultContractConfig.contractAddress,
          parseEther(lockAmount.toString()),
        ],
      });

      // Write approve transaction
      const approveWrite = await writeContract(approvePrepare.request);

      // Wait for transaction
      const approveTX = await waitForTransaction({ hash: approveWrite.hash });

      // Prepare lock Transaction
      setStatus("loading");
      const depositPrepare = await prepareWriteContract({
        address: bsdContractConfig.contractAddress,
        abi: bsdContractConfig.abi,
        functionName: "deposit",
        args: [parseEther(lockAmount.toString())],
      });

      // Write approve transaction
      const depositWrite = await writeContract(depositPrepare.request);
      // Wait for transaction
      const depositTX = await waitForTransaction({ hash: depositWrite.hash });

      // Send event
      const event = new CustomEvent("grcLock");
      console.log("Emit event : grcLock");
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
        colorScheme={"red"}
        leftIcon={<FaLock />}
      >
        Bloquer des GRC
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
          <ModalHeader>Bloquer des GRC</ModalHeader>
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
                <Alert status="warning" flexDirection={"column"}>
                  <Flex>
                    <AlertIcon />
                    <AlertTitle>Attention</AlertTitle>
                  </Flex>
                  <AlertDescription>
                    <UnorderedList>
                      <ListItem>
                        Vous devez approuver le transfert de GRC.
                      </ListItem>
                      <ListItem>
                        Vos GRC seront envoyés dans un coffre.
                      </ListItem>
                      <ListItem>
                        Vous pouvez les récupérer à n&apos;importe quel moment.
                      </ListItem>
                      <ListItem>
                        Le mininum requis est{" "}
                        <b>{constants?.vault.minLockAmount}</b> GRC.
                      </ListItem>
                      <ListItem>
                        GRC Bloqué : <b>{currentLockAmount}</b> GRC.
                      </ListItem>
                    </UnorderedList>
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
                      min={
                        constants?.vault.minLockAmount! -
                        Number(currentLockAmount)
                      }
                      onChange={(e) => setLockAmount(Number(e.target.value))}
                    />
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <InputRightAddon children="GRC" />
                  </InputGroup>
                  <FormHelperText>
                    Indiquez la nombre de GRC que vous voulez bloquer
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
              onClick={lock}
            >
              Bloquer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

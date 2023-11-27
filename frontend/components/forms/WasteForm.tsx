import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Flex,
  InputGroup,
  InputRightAddon,
  RadioGroup,
  Stack,
  Radio,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  IconButton,
  Box,
  Tooltip,
  Heading,
} from "@chakra-ui/react";
import wasteCodes from "@/data/wasteCodes.json";
import { Waste } from "@/types/types";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IconContext } from "react-icons";
import { FiPackage } from "react-icons/fi";

type Props = {
  waste: Waste;
  setWasteData: (waste: Waste) => void;
};

export default function WasteForm({ waste, setWasteData }: Props) {
  const [packagingForm, setPackagingForm] = useState<
    Waste["packagingInfos"][number]
  >({ quantity: 0, type: "" });
  return (
    <VStack
      borderStyle={"solid"}
      borderWidth={"medium"}
      borderRadius={10}
      p={2}
    >
      <Heading as={"h4"} size={"md"} mb={1}>
        Déchet
      </Heading>
      <FormControl isRequired>
        <FormLabel>Code déchet</FormLabel>
        <Select
          placeholder="Sélectionnez une valeur"
          onChange={(e) => setWasteData({ ...waste, code: e.target.value })}
        >
          {wasteCodes.map((wasteCode) => (
            <option key={wasteCode.code} value={wasteCode.code}>
              {wasteCode.code} - {wasteCode.description}
            </option>
          ))}
        </Select>
      </FormControl>
      <Flex width={"100%"} gap={2}>
        <FormControl isRequired flex={2}>
          <FormLabel>Dénomination des déchets</FormLabel>
          <Input
            onChange={(e) => setWasteData({ ...waste, name: e.target.value })}
          />
        </FormControl>
        <FormControl isRequired flex={1}>
          <FormLabel>Consistence</FormLabel>
          <Select
            placeholder="Consistence"
            onChange={(e) =>
              setWasteData({
                ...waste,
                consistence: e.target.value as Waste["consistence"],
              })
            }
          >
            <option key={0}>Solide</option>
            <option key={1}>Liquide</option>
            <option key={2}>Gazeux</option>
          </Select>
        </FormControl>
      </Flex>
      <FormControl isRequired>
        <FormLabel>Conditionnement</FormLabel>
        <Flex alignItems={"center"} gap={2}>
          <NumberInput
            min={1}
            maxWidth={20}
            onChange={(valueString, valueNumber) =>
              setPackagingForm({
                quantity: valueNumber,
                type: packagingForm.type as Waste["packagingInfos"][number]["type"],
              })
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <RadioGroup
            onChange={(value) =>
              setPackagingForm({
                quantity: packagingForm.quantity,
                type: value as Waste["packagingInfos"][number]["type"],
              })
            }
          >
            <Stack direction="row">
              <Radio value="Benne">Benne</Radio>
              <Radio value="Citerne">Citerne</Radio>
              <Radio value="Grv">Grv</Radio>
              <Radio value="Fût">Fût</Radio>
            </Stack>
          </RadioGroup>
          <IconButton
            icon={<FaPlus />}
            size={"sm"}
            isDisabled={
              packagingForm.quantity === 0 || packagingForm.type === ""
            }
            onClick={() =>
              setWasteData({
                ...waste,
                packagingInfos: [
                  ...waste.packagingInfos,
                  {
                    quantity: packagingForm.quantity,
                    type: packagingForm.type,
                  },
                ],
              })
            }
            aria-label="Ajouter un conditionnement"
            colorScheme="blue"
          />
          <IconContext.Provider value={{ size: "1.5em" }}>
            {waste.packagingInfos.map((packaging, index1) => (
              <Tooltip
                key={index1}
                label={`${packaging.quantity} ${packaging.type}`}
              >
                <Box
                  onClick={() =>
                    setWasteData({
                      ...waste,
                      packagingInfos: waste.packagingInfos.filter(
                        (value, index) => index != index1
                      ),
                    })
                  }
                >
                  <FiPackage />
                </Box>
              </Tooltip>
            ))}
          </IconContext.Provider>
        </Flex>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Quantité</FormLabel>
        <Flex alignItems={"center"} gap={2}>
          <InputGroup width={180}>
            <Input
              type="number"
              maxWidth={20}
              onChange={(e) =>
                setWasteData({ ...waste, quantity: Number(e.target.value) })
              }
            />
            {/* eslint-disable-next-line react/no-children-prop */}
            <InputRightAddon children="tonne(s)" />
          </InputGroup>
          <RadioGroup
            onChange={(value) =>
              setWasteData({ ...waste, quantityType: value })
            }
          >
            <Stack direction="row">
              <Radio value="Réelle">Réelle</Radio>
              <Radio value="Estimée">Estimée</Radio>
            </Stack>
          </RadioGroup>
        </Flex>
      </FormControl>
    </VStack>
  );
}

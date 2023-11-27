import {
  Box,
  Center,
  Step,
  StepIcon,
  StepIndicator,
  StepSeparator,
  StepStatus,
  Stepper,
  Text,
  useSteps,
  Spinner,
} from "@chakra-ui/react";
import { FaExclamation } from "react-icons/fa6";
import { IconContext } from "react-icons";

// Title and description are not use
const steps = [
  { title: "First", description: "Submit Transaction" },
  { title: "Second", description: "Upload to ipfs" },
  { title: "Third", description: "Transaction pending" },
  { title: "fourth", description: "Transaction complete" },
];

const stepStatusOkIcon = <StepIcon />;
const stepStatusNokIcon = (
  <IconContext.Provider value={{ color: "red" }}>
    <FaExclamation />
  </IconContext.Provider>
);

export default function TxStepper({
  status,
}: {
  status: "error" | "success" | "idle" | "loading" | "ipfs";
}) {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  let activeStepDescription: JSX.Element;

  switch (status) {
    case "idle":
      {
        activeStep != 0 && setActiveStep(0);
        activeStepDescription = <Text>Confirmer l&apos;action</Text>;
      }
      break;
    case "ipfs":
      {
        activeStep != 1 && setActiveStep(1);
        activeStepDescription = (
          <Center>
            <Text>IPFS to Upload&nbsp;</Text>
            <Spinner size={"sm"} />
          </Center>
        );
      }
      break;
    case "loading":
      {
        activeStep != 2 && setActiveStep(2);
        activeStepDescription = (
          <Center>
            <Text>Transaction in progress&nbsp;</Text>
            <Spinner size={"sm"} />
          </Center>
        );
      }
      break;
    case "error":
      {
        activeStep != 3 && setActiveStep(3);
        activeStepDescription = (
          <Box>
            <Text align={"center"} color={"red"}>
              Transaction failed
            </Text>
          </Box>
        );
      }
      break;
    case "success":
      {
        activeStep != 4 && setActiveStep(4);
        activeStepDescription = (
          <Box>
            <Text align={"end"} color={"green"}>
              Transaction completed
            </Text>
          </Box>
        );
      }
      break;
  }

  //console.log(activeStep, status);
  return (
    <Box margin={2}>
      <Stepper size="sm" index={activeStep} gap="0" marginBottom={2}>
        {steps.map((step, index) => (
          // @ts-ignore
          <Step key={index} gap="0">
            <StepIndicator>
              <StepStatus
                complete={
                  index === 2 && activeStep === 3 && status === "error"
                    ? stepStatusNokIcon
                    : stepStatusOkIcon
                }
              />
            </StepIndicator>
            {/* @ts-ignore */}
            <StepSeparator _horizontal={{ ml: "0" }} />
          </Step>
        ))}
      </Stepper>
      {activeStepDescription}
    </Box>
  );
}

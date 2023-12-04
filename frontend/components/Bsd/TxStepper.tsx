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
  Heading,
} from "@chakra-ui/react";
import { FaExclamation } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { TxSteps } from "@/types/types";

const stepStatusOkIcon = <StepIcon />;
const stepStatusNokIcon = (
  <IconContext.Provider value={{ color: "red" }}>
    <FaExclamation />
  </IconContext.Provider>
);

export default function TxStepper({
  status,
  steps,
}: {
  status: TxSteps[number]["status"] | "error";
  steps: TxSteps;
}) {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const computeStep = steps.findIndex((step) => step.status === status);

  let activeStepDescription: JSX.Element;

  if (computeStep != -1) {
    activeStep != computeStep && setActiveStep(computeStep);
    activeStepDescription = (
      <Center>
        <Text color={status === "success" ? "green" : "initial"}>
          {steps[activeStep].description}&nbsp;
        </Text>
        {(status === "approve" || status === "loading") && (
          <Spinner size={"sm"} />
        )}
      </Center>
    );
  } else {
    activeStepDescription = <Center><Text color={"red"}>Transaction failed</Text></Center>;
    activeStep != steps.length && setActiveStep(steps.length);
  }

  return (
    <Box margin={2}>
      <Heading size={"md"} mb={2}>
        Statut de la transaction
      </Heading>
      <Stepper size="sm" index={activeStep} gap="0" marginBottom={2}>
        {steps.map((step, index) => {
          if (index + 1 == steps.length) return null; // don't display last step

          return (
            // @ts-ignore
            <Step key={index} gap="0">
              <StepIndicator>
                <StepStatus
                  complete={
                    activeStep === steps.length &&
                    index === steps.length - 2 &&
                    status === "error"
                      ? stepStatusNokIcon
                      : stepStatusOkIcon
                  }
                />
              </StepIndicator>
              {/* @ts-ignore */}
              <StepSeparator _horizontal={{ ml: "0" }} />
            </Step>
          );
        })}
      </Stepper>
      {activeStepDescription}
    </Box>
  );
}

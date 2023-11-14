import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export default function Countdown({ targetDate }: { targetDate: string }) {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  const getReturnValues = (countDown: number) => {
    // calculate time left
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

    return [days, hours, minutes, seconds];
  };
  const [days, hours, minutes, seconds] = getReturnValues(countDown);

  return (
    <Flex alignItems={"center"} gap={4}>
      <Box>
        <Text>
          <b>{days}</b>
        </Text>
        <span>days</span>
      </Box>
      :
      <Box>
        <Text>
          <b>{hours}</b>
        </Text>
        <span>hours</span>
      </Box>
      :
      <Box>
        <Text>
          <b>{minutes}</b>
        </Text>
        <span>minutes</span>
      </Box>
      :
      <Box>
        <Text>
          <b>{seconds}</b>
        </Text>
        <span>seconds</span>
      </Box>
    </Flex>
  );
}

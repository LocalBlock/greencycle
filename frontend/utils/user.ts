import { Address } from "viem";
import defaultUsersDev from "@/data/defaultUsersDev.json";
import defaultUsersProd from "@/data/defaultUsersProd.json";
import { Producer, Recipient, Roles, Transporter } from "@/types/types";

export function getRole(address: Address | undefined) {
  switch (process.env.NODE_ENV) {
    case "test":
    case "development":
      {
        if (
          defaultUsersDev.producers.some(
            (producer) => producer.walletAddress === address
          )
        )
          return "producer" as Roles;
        if (
          defaultUsersDev.transporters.some(
            (transporter) => transporter.walletAddress === address
          )
        )
          return "transporter" as Roles;
        if (
          defaultUsersDev.recipients.some(
            (recipient) => recipient.walletAddress === address
          )
        )
          return "recipient" as Roles;
      }

      break;
    case "production":
      if (
        defaultUsersProd.producers.some(
          (producer) => producer.walletAddress === address
        )
      )
        return "producer" as Roles;
      if (
        defaultUsersProd.transporters.some(
          (transporter) => transporter.walletAddress === address
        )
      )
        return "transporter" as Roles;
      if (
        defaultUsersProd.recipients.some(
          (recipient) => recipient.walletAddress === address
        )
      )
        return "recipient" as Roles;

      break;
  }
}

export function getUserData(address: Address) {
  const role = getRole(address);

  let result: Producer | Transporter | Recipient|undefined;

  if (role === "producer") result = getProducer(address);
  if (role === "transporter") result = getTransporter(address);
  if (role === "recipient") result = getRecipient(address);

  return result;
}

export function getProducer(address: Address) {
  const { producers } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = producers.find((role) => role.walletAddress === address);
  if (result) return result as Producer;
  return undefined;
}

export function getTransporter(address: Address) {
  const { transporters } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = transporters.find((role) => role.walletAddress === address);
  if (result) return result as Transporter;
  return undefined;
}

export function getRecipient(address: Address) {
  const { recipients } =
    process.env.NODE_ENV === "development" ? defaultUsersDev : defaultUsersProd;
  const result = recipients.find((role) => role.walletAddress === address);
  if (result) return result as Recipient;
  return undefined;
}



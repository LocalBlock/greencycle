"use client";

import { Roles } from "@/types/types";
import { getRole } from "@/utils/user";
import { createContext, useState } from "react";
import { useAccount } from "wagmi";

export const RoleContext = createContext<Roles | undefined>(undefined);

export default function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();

  return (
    <RoleContext.Provider value={getRole(address)}>
      {children}
    </RoleContext.Provider>
  );
}

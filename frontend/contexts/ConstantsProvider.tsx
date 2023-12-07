"use client";

import { ContractConstants } from "@/types/types";
import { getContractConstants } from "@/utils/constants";
import { createContext, useEffect, useState } from "react";

export const ConstantsContext = createContext<ContractConstants | undefined>(undefined);

export default function ConstantsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [constants,setConstants]=useState<ContractConstants|undefined>(undefined)
  useEffect(()=>{
    const fetchConstants=async()=>{
      setConstants(await getContractConstants())
    }
    fetchConstants()
  },[])

  return (
    <ConstantsContext.Provider value={constants}>
      {children}
    </ConstantsContext.Provider>
  );
}
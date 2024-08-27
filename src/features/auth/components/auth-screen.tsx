"use client"

import React from 'react'
import { SignInFlow } from "@/features/auth/types";
import { useState } from "react";
import { SignInCard } from "./sign-in-card";
import { SignOutCard } from "./sign-out-card";

export const AuthScreen = () => {
    const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <div className="h-full flex items-center justify-center bg-[#5C3B58]">
        <div className="md:h-auto md:w-[420px]">
            {state === "signIn" ? <SignInCard setState={setState} /> : <SignOutCard setState={setState} />}
        </div>
    </div>
  )
}


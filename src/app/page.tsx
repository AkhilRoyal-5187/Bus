// src/app/page.tsx
"use client";

import Image from 'next/image';
import LoginCards from "./components/loginCards";
import { SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import React from "react";

export default function Home() {
  return (
    <div className="relative grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-20 gap-8 sm:p-8 sm:pb-20 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
       
       <div className="absolute top-4 right-4 z-10">
            <SignedOut>
                <SignUpButton mode="modal">
                    <button className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 shadow-md transition-colors duration-200">
                        Sign Up
                    </button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
       </div>

       <img
        src="https://w7.pngwing.com/pngs/114/613/png-transparent-guntur-vijayawada-bus-nellore-andhra-pradesh-state-road-transport-corporation-bus.png"
        alt="Bus Pass Logo"
        width={168}
        height={168}
        className="rounded-full object-cover mt-auto mb-4 sm:w-40 sm:h-40"
        
       />
      
        <div className="flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl gap-8 sm:gap-16">
          <LoginCards 
          imageSrc="https://cdn-icons-gif.flaticon.com/17093/17093008.gif"
          label= "Student login"
          redirectTO="/student" 
          />
          <LoginCards 
          imageSrc= "https://cdn-icons-gif.flaticon.com/18863/18863653.gif"
          label = "Admin login"
          redirectTO="/admin"
          />
        </div>
        
    </div>
  );
}

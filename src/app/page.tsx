"use client";

import LoginCards from "./components/loginCards";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-20 gap-8 sm:p-8 sm:pb-20 sm:gap-16 font-[family-name:var(--font-geist-sans)] bg-black"
    >
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/signup')}
          className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 shadow-md transition-colors duration-200"
        >
          Sign Up
        </motion.button>
      </div>

      <motion.img
        src="https://images.tv9telugu.com/wp-content/uploads/2023/08/apsrtc.jpg"
        alt="Bus Pass Logo"
        width={168}
        height={168}
        className="rounded-[100px] object-cover mt-auto mb-4 sm:w-40 sm:h-40"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.2 }}
      />

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl gap-8 sm:gap-10 text-white mt-[-100px]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <LoginCards
            imageSrc="https://cdn-icons-gif.flaticon.com/17093/17093008.gif"
            label="Student login"
            redirectTO="/student"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <LoginCards
            imageSrc="https://cdn-icons-gif.flaticon.com/18863/18863653.gif"
            label="Admin login"
            redirectTO="/admin"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

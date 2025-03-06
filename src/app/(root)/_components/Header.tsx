/* eslint-disable */
"use client";

import Link from "next/link";
import { Blocks, Code2, Sparkles } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import RunButton from "./RunButton";
import HeaderProfileBtn from "./HeaderProfileBtn";
import InputField from "./InputField";

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10"
    >
      <div
        className="flex flex-col lg:flex-row items-center justify-between 
        bg-[#0a0a0f]/80 backdrop-blur-xl p-4 lg:p-6 mb-4 rounded-lg 
        border border-white/10 shadow-lg space-y-4 lg:space-y-0"
      >
        {/* Logo and Navigation (Hidden on Phones) */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative">
            <motion.div
              whileHover={{ rotate: 6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1
              ring-white/10 group-hover:ring-white/20 transition-all"
            >
              <Blocks className="size-6 text-blue-400" />
            </motion.div>

            <div className="flex flex-col">
              <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                CodED
              </span>
              <span className="block text-xs text-blue-400/60 font-medium">
                Interactive Code Editor
              </span>
            </div>
          </Link>


        </div>

        {/* Right Side Controls (Stacked on Phones) */}
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Theme and Language Selectors */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <ThemeSelector />
            <LanguageSelector />
          </div>

          {/* Input Field (Full Width on Phones) */}
          <div className="w-full lg:w-auto">
            <InputField />
          </div>

          {/* Run Button (Hidden if Not Signed In) */}
          <SignedIn>
            <div className="w-full lg:w-auto">
              <RunButton />
            </div>
          </SignedIn>

          {/* Profile Button (Full Width on Phones) */}
          <div className="w-full lg:w-auto pl-0 lg:pl-3 border-l-0 lg:border-l border-gray-800">
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
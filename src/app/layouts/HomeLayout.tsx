"use client";
import React, { useEffect } from "react";

import { motion } from "framer-motion";
import AOS from "aos";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/core/providers/theme-provider";
import QueryClientProvider from "@/core/providers/query-provider";

const HomeLayout = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      delay: 50,
    });
  }, []);
  return (
    <QueryClientProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <>
          <div className="flex flex-col justify-center lg:flex-row lg:gap-5 lg:pt-10">
            {/* Sidebar */}

            <Sidebar />

            {/* Content */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="lg:max-w-[854px] p-2 lg:p-0 lg:mt-8 w-full lg:min-h-screen no-scrollbar"
            >
              <div className="mb-10 mt-24 md:mt-0 transition-all scroll-smooth duration-300  aos-init aos-animate">
                <Outlet />
              </div>
            </motion.div>
          </div>
          <Footer />
        </>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default HomeLayout;

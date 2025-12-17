import { useEffect } from "react";

import { motion } from "framer-motion";
import AOS from "aos";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

import QueryClientProvider from "@/core/providers/query-provider";
import { ThemeCustomizer } from "@/components/shared/ThemeCustomizer";

const HomeLayout = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      delay: 50,
    });
  }, []);
  return (
    <QueryClientProvider>
      <>
        <div className="flex flex-col justify-center lg:flex-row lg:gap-5 lg:pt-10 relative">
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
        <div className="fixed bottom-4 right-4">
          <ThemeCustomizer />
        </div>
      </>
    </QueryClientProvider>
  );
};

export default HomeLayout;

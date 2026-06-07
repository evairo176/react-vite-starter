import { useEffect } from "react";

import { motion } from "framer-motion";
import AOS from "aos";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { Outlet } from "@tanstack/react-router";

import QueryClientProvider from "@/core/providers/query-provider";
import BackToTop from "@/components/shared/BackToTop";

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
        {/* Single navigation: the Sidebar (with profile + menu) is the only
            navbar on the public site. The StickyHeader was removed to avoid a
            duplicate top navigation. */}
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
        <BackToTop />
      </>
    </QueryClientProvider>
  );
};

export default HomeLayout;

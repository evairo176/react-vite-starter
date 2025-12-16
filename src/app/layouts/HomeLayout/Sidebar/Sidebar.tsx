"use client";

import { Separator } from "@/components/ui/separator";

import { AnimatePresence, motion } from "framer-motion";

import AOS from "aos";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import ModeToggle from "../ModeToggle";
import Profile from "../Profile";
import { MENU } from "../constant";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "react-router-dom";
import MenuOpen from "../MenuOpen";

const Sidebar = () => {
  //   const { isOpen } = useAppSelector((state) => state.menuReducer);
  const isMobile = useIsMobile();
  // const imageSize = isMobile ? 40 : 100;
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();

  const pathname = location.pathname;

  useEffect(() => {
    AOS.init({
      duration: 800,
      delay: 50,
    });

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    // <div className="sticky top-0 left-0 w-full lg:w-64 bg-white shadow-sm p-4">
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sticky transition-all duration-300 top-0 z-10 flex flex-col lg:py-8 lg:h-full"
    >
      <div className="z-20 fixed bg-card text-card-foreground shadow lg:shadow-none  w-full lg:w-64 p-5 md:relative lg:p-0">
        <div className={`flex flex-row lg:flex-col justify-between  space-y-1`}>
          <Profile isOpen={isOpen} />
          <div
            className={`flex items-center lg:hidden gap-5 mt-2 ${
              isOpen
                ? "!items-end flex-col-reverse justify-between h-[120px] pb-1"
                : "flex row"
            } `}
          >
            <div className="flex flex-row items-center gap-2">
              <ModeToggle />
              <div className={`${isOpen ? "block" : "hidden"}`}></div>
            </div>
            <MenuOpen expandMenu={isOpen} setExpandMenu={(e) => setIsOpen(e)} />
          </div>
        </div>

        {isMobile && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col md:hidden space-y-1 lg:mt-4 h-screen"
              >
                <Separator className="mt-4" />
                {MENU.map((row, key) => {
                  return (
                    <Button
                      variant={pathname === row.url ? "secondary" : "ghost"}
                      className={` flex items-center justify-start gap-4 hover:lg:rounded-lg lg:hover:scale-105 lg:hover:gap-3 lg:transition-all lg:duration-300`}
                      key={key}
                      asChild
                      aria-label={row.title}
                    >
                      <Link to={row.url}>
                        {row.icon} {row.title}
                      </Link>
                    </Button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hidden md:block "
        >
          <div className="flex flex-row md:flex-col space-y-1 lg:mt-4">
            <Separator className="mt-4" />
            {MENU.map((row, key) => {
              return (
                <Button
                  variant={pathname === row.url ? "secondary" : "ghost"}
                  className="relative flex items-center justify-start gap-4 hover:lg:rounded-lg lg:hover:scale-105 lg:hover:gap-3 lg:transition-all lg:duration-300"
                  key={key}
                  aria-label={row.title}
                  asChild
                >
                  <Link to={row.url}>
                    {row.icon} {row.title}
                    {pathname === row.url && (
                      <motion.span
                        className="bg-muted rounded-md"
                        layoutId="activeSection"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      ></motion.span>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;

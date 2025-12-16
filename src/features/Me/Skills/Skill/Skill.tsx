"use client";

import { STACKS } from "@/app/layouts/HomeLayout/constant";
import { motion } from "framer-motion";

type Props = {};

const Skill = () => {
  const fadeIn = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: (key: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.05 * key,
      },
    }),
  };

  return (
    <ul className="flex flex-wrap justify-center gap-2 text-lg">
      {STACKS?.map((row, key: number) => {
        return (
          <motion.li
            className="flex  items-center gap-2 bg-muted rounded-xl px-5 py-3"
            key={key}
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: true,
            }}
            custom={key}
          >
            {row.icon}
            {row.name}
          </motion.li>
        );
      })}
    </ul>
  );
};

export default Skill;

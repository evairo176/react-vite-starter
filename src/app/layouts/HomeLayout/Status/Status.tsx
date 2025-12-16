import { motion } from "framer-motion";
import { useTheme } from "@/core/providers/theme-provider";

const Status = () => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 42, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`absolute ${
        theme === "light"
          ? "inverted-border-radius"
          : "inverted-border-radius-dark"
      } z-10 left-0 py-2 pr-2 rounded-br-xl bg-background dark:bg-background`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        data-testid="available-hire"
        className="flex relative items-center gap-2 bg-background rounded-xl py-1 px-2 border dark:border-neutral-700"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="h-2 w-2 rounded-full bg-green-400"
        />
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          Hire Me
        </span>
      </motion.div>
    </motion.div>
  );
};

export default Status;

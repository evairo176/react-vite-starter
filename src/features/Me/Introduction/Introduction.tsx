import { PiCoffeeBold } from "react-icons/pi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Introduction = () => {
  return (
    <section className="p-4 lg:p-8 rounded-md border bg-card text-card-foreground">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 text-2xl lg:text-3xl font-medium font-sora">
          <h1>Hi, Saya Dicki</h1>
          <motion.div
            animate={{ rotate: 20 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.5,
              ease: "easeInOut",
              type: "tween",
            }}
          >
            👋
          </motion.div>
        </div>
        <Button variant={"secondary"} aria-label="donation">
          <PiCoffeeBold className="w-[25px] h-[25px]" />
        </Button>
      </div>
      <div className="space-y-4">
        <ul className="flex flex-col lg:flex-row gap-1 lg:gap-8 ml-5 list-disc text-neutral-700 dark:text-neutral-400">
          <li>Developer Full-Stack</li>
          <li>
            Lokasi di Indramayu, Jawa Barat <span className="ml-1">🇮🇩</span>
          </li>
        </ul>
        <p className="leading-[1.8] md:leading-loose text-neutral-800 dark:text-neutral-300">
          Saya adalah seorang Fullstack Developer berusia 23 tahun dengan
          pengalaman lebih dari 1,5 tahun. Keahlian saya mencakup pengembangan
          aplikasi web dan mobile menggunakan React, TypeScript, dan Laravel.
          Saya memiliki fokus kuat terhadap pengembangan end-to-end, mulai dari
          desain antarmuka hingga pengembangan backend, sehingga memastikan
          pengalaman pengguna yang mulus dan efisien. Dengan keinginan untuk
          terus belajar dan berinovasi, saya siap untuk memberikan kontribusi
          positif dalam proyek pengembangan perangkat lunak.
        </p>
      </div>
    </section>
  );
};

export default Introduction;

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
        <p className="leading-[1.8] md:leading-loose text-neutral-800 dark:text-neutral-300 text-justify">
          Saya merupakan seorang Full-Stack Developer dengan pengalaman dalam
          merancang, mengembangkan, dan memelihara aplikasi berbasis web secara
          menyeluruh, mencakup pengelolaan database, pengembangan backend dan
          frontend, serta integrasi sistem. Saya memiliki kompetensi dalam
          menggunakan berbagai teknologi seperti Next.js, React, Express,
          Laravel, dan .NET, serta basis data SQL dan NoSQL untuk mendukung
          pengembangan sistem yang andal dan terstruktur. Dengan komitmen
          terhadap kualitas kode, keamanan aplikasi, dan efisiensi sistem, saya
          terbiasa mengimplementasikan solusi teknologi yang selaras dengan
          kebutuhan bisnis dan standar pengembangan perangkat lunak profesional.
        </p>
      </div>
    </section>
  );
};

export default Introduction;

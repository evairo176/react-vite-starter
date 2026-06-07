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
          <li>Senior Fullstack Developer</li>
          <li>.NET · React/Next.js · Node.js · Golang</li>
          <li>
            Lokasi di Indramayu, Jawa Barat <span className="ml-1">🇮🇩</span>
          </li>
        </ul>
        <p className="leading-[1.8] md:leading-loose text-neutral-800 dark:text-neutral-300 text-justify">
          Saya seorang Senior Fullstack Developer dengan pengalaman lebih dari 5
          tahun membangun aplikasi yang skalabel dan data-intensive di lingkungan
          enterprise maupun plantation-tech. Core stack saya meliputi .NET,
          React/Next.js, Golang, dan Node.js, dengan pengalaman langsung di data
          engineering (Apache Spark, Airflow) serta penerapan AI/RAG. Saya pernah
          mengirimkan platform EUDR compliance yang memangkas waktu pelaporan
          ~40% dan sistem monitoring real-time di 500+ blok perkebunan, sembari
          memimpin code review dan mentoring engineer. Memiliki kemampuan
          analisis yang kuat dalam menerjemahkan kebutuhan bisnis menjadi solusi
          terstruktur dan efektif, dengan fokus pada hasil, kualitas kode, dan
          efisiensi pengembangan.
        </p>
      </div>
    </section>
  );
};

export default Introduction;

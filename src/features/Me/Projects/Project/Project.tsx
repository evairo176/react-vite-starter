"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Project = ({
  title,
  description,
  tags,
  imageUrl,
  link,
}: {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  link: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgess = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgess = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  return (
    <motion.div
      ref={ref}
      style={{
        scale: scaleProgess,
        opacity: opacityProgess,
      }}
      className="group mb-3 sm:mb-8 last:mb-0 scroll-mt-30"
      id="projects"
    >
      <section className="bg-background max-w-[42rem] border borderBlack rounded-md overflow-hidden sm:pr-8 relative sm:h-[20rem] hover:bg-gray-200 transition sm:group-even:pl-8 dark:hover:bg-white/20">
        <img
          src={imageUrl}
          alt="Project I worked on"
          className="relative  block sm:hidden w-[100%] max-h-[300px] object-cover object-center rounded-t-lg shadow-2xl
      transition 
      group-hover:scale-[1.04]
      group-hover:-translate-x-3
      group-hover:translate-y-3
      group-hover:-rotate-2

      group-even:group-hover:translate-x-3
      group-even:group-hover:translate-y-3
      group-even:group-hover:rotate-2

      "
        />
        <div className="pt-4 pb-7 px-5 sm:pl-10 sm:pr-2  sm:pt-10 sm:max-w-[50%] flex flex-col h-full sm:group-even:ml-[18rem]">
          <div
            className="text-2xl font-semibold cursor-pointer"
            // onClick={() => router.push(link)}
          >
            {title}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="mt-2 text-sm leading-relaxed text-justify line-clamp-5">
                  {description}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <div className="w-[280px] text-justify">{description}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto">
            {tags.map((tag, index) => (
              <li
                className="px-3 bg-muted py-1 text-[9px] uppercase tracking-wider rounded-full"
                key={index}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={imageUrl}
          alt="Project I worked on"
          className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] rounded-t-lg shadow-2xl
      transition 
      group-hover:scale-[1.04]
      group-hover:-translate-x-3
      group-hover:translate-y-3
      group-hover:-rotate-2

      group-even:group-hover:translate-x-3
      group-even:group-hover:translate-y-3
      group-even:group-hover:rotate-2

      group-even:right-[initial] group-even:-left-40"
        />
      </section>
    </motion.div>
  );
};

export default Project;

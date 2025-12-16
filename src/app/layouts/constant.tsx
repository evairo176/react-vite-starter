import { BiHomeCircle } from "react-icons/bi";
import { CiViewTimeline } from "react-icons/ci";
import { PiArticleLight } from "react-icons/pi";
import { GiStumpRegrowth } from "react-icons/gi";
import {
  AiOutlineFundProjectionScreen,
  AiOutlineDashboard,
} from "react-icons/ai";
import { GoTasklist } from "react-icons/go";
import { SiAboutdotme } from "react-icons/si";
import { MdOutlineContacts } from "react-icons/md";

import { BiLogoPostgresql } from "react-icons/bi";
// import appstore from "/images/projects/appstore.jpg";
// import apps from "/images/projects/appstore.jpg";
import {
  SiChakraui,
  SiCss3,
  SiExpo,
  SiExpress,
  SiFirebase,
  SiFramer,
  SiGithub,
  SiGraphql,
  SiGulp,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiMui,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPrisma,
  SiReact,
  SiReacthookform,
  SiReactquery,
  SiReactrouter,
  SiReacttable,
  SiRedux,
  SiSass,
  SiStorybook,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiZod,
} from "react-icons/si";
import { Icons } from "@/shared/icons/shadcn-ui";
export const MENU = [
  {
    title: "Home",
    icon: <BiHomeCircle className="w-5 h-5" />,
    url: "/",
  },
  {
    title: "Project",
    icon: <AiOutlineFundProjectionScreen className="w-5 h-5" />,
    url: "/projects",
  },
  {
    title: "Blogs",
    icon: <PiArticleLight className="w-5 h-5" />,
    url: "/blogs",
  },
  {
    title: "Learn",
    icon: <GiStumpRegrowth className="w-5 h-5" />,
    url: "/learn",
  },
  {
    title: "Roadmap",
    icon: <CiViewTimeline className="w-5 h-5" />,
    url: "/roadmap",
  },
  {
    title: "Task Board",
    icon: <GoTasklist className="w-5 h-5" />,
    url: "/task-board",
  },
  {
    title: "About",
    icon: <SiAboutdotme className="w-5 h-5" />,
    url: "/about",
  },
  {
    title: "Contact",
    icon: <MdOutlineContacts className="w-5 h-5" />,
    url: "/contact",
  },
  {
    title: "Dashboard",
    icon: <AiOutlineDashboard className="w-5 h-5" />,
    url: "/dashboard",
  },
];
const iconSize = 25;
export const STACKS = [
  {
    name: "PHP",
    icon: <SiPhp size={iconSize} className="text-blue-500" />,
  },
  {
    name: "JavaScript",
    icon: <SiJavascript size={iconSize} className="text-yellow-400" />,
  },
  {
    name: "TypeScript",
    icon: <SiTypescript size={iconSize} className="text-blue-400" />,
  },
  {
    name: "Next.js",
    icon: <SiNextdotjs size={iconSize} />,
  },
  {
    name: "React.js",
    icon: <SiReact size={iconSize} className="text-sky-500" />,
  },
  {
    name: "TailwindCSS",
    icon: <SiTailwindcss size={iconSize} className="text-cyan-300" />,
  },
  {
    name: "GraphQL",
    icon: <SiGraphql size={iconSize} className="text-pink-600" />,
  },
  {
    name: "Material UI",
    icon: <SiMui size={iconSize} className="text-sky-400" />,
  },
  {
    name: "Vite",
    icon: <SiVite size={iconSize} className="text-purple-500" />,
  },
  {
    name: "PostgreSql",
    icon: <BiLogoPostgresql size={iconSize} className="text-blue-400" />,
  },
  {
    name: "ChakraUI",
    icon: <SiChakraui size={iconSize} className="text-teal-500" />,
  },
  {
    name: "React Native",
    icon: <SiReact size={iconSize} className="text-sky-600" />,
  },
  {
    name: "Expo",
    icon: <SiExpo size={iconSize} />,
  },
  {
    name: "SASS",
    icon: <SiSass size={iconSize} className="text-pink-600" />,
  },
  {
    name: "Gulp",
    icon: <SiGulp size={iconSize} className="text-red-500" />,
  },
  {
    name: "Firebase",
    icon: <SiFirebase size={iconSize} className="text-yellow-500" />,
  },
  {
    name: "Framer Motion",
    icon: <SiFramer size={iconSize} />,
  },
  {
    name: "Jest",
    icon: <SiJest size={iconSize} className="text-orange-600" />,
  },
  {
    name: "Express.js",
    icon: <SiExpress size={iconSize} />,
  },
  {
    name: "Redux",
    icon: <SiRedux size={iconSize} className="text-purple-500" />,
  },
  {
    name: "React Query",
    icon: <SiReactquery size={iconSize} className="text-red-600" />,
  },
  {
    name: "HTML",
    icon: <SiHtml5 size={iconSize} className="text-orange-500" />,
  },
  {
    name: "CSS",
    icon: <SiCss3 size={iconSize} className="text-blue-500" />,
  },
  {
    name: "Prisma",
    icon: <SiPrisma size={iconSize} className="text-teal-500" />,
  },
  {
    name: "Node JS",
    icon: <SiNodedotjs size={iconSize} className="text-green-600" />,
  },
  {
    name: "Github",
    icon: <SiGithub size={iconSize} />,
  },
  {
    name: "Storybook",
    icon: <SiStorybook size={iconSize} className="text-pink-500" />,
  },
  {
    name: "React Router",
    icon: <SiReactrouter size={iconSize} className="text-pink-500" />,
  },
  {
    name: "React Hook Form",
    icon: <SiReacthookform size={iconSize} className="text-pink-500" />,
  },
  {
    name: "React Table",
    icon: <SiReacttable size={iconSize} className="text-rose-600" />,
  },
  {
    name: "Shadcn/ui",
    icon: (
      <Icons.logo
        className={`h-[${iconSize}px] w-[${iconSize}px] text-slate-500`}
      />
    ),
  },
  {
    name: "NPM",
    icon: (
      <Icons.npm
        className={`h-[${iconSize}px] w-[${iconSize}px] text-red-500`}
      />
    ),
  },
  {
    name: "Google",
    icon: (
      <Icons.google
        className={`h-[${iconSize}px] w-[${iconSize}px] text-blue-500`}
      />
    ),
  },
  {
    name: "Xendit",
    icon: (
      <Icons.xendit
        className={`h-[${iconSize}px] w-[${iconSize}px] text-blue-500`}
      />
    ),
  },
  {
    name: "Midtrans",
    icon: <Icons.midtrans className={`h-[${iconSize}px] w-[${iconSize}px]`} />,
  },
];

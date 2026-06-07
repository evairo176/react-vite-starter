import { BiHomeCircle } from "react-icons/bi";
import { PiArticleLight } from "react-icons/pi";
import {
  AiOutlineFundProjectionScreen,
  AiOutlineDashboard,
} from "react-icons/ai";
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
  SiGo,
  SiDotnet,
  SiPython,
  SiGithubactions,
  SiDocker,
  SiMongodb,
  SiRedis,
  SiKubernetes,
  SiApachespark,
  SiApacheairflow,
  SiApachekafka,
} from "react-icons/si";
import { HiAcademicCap, HiBriefcase } from "react-icons/hi";

import { Icons } from "@/components/shared/icons/shadcn-ui";
const iconSize = 25;

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

export const STACKS = [
  {
    name: "Golang",
    icon: <SiGo size={iconSize} color="#00ADD8" />,
  },
  {
    name: ".NET",
    icon: <SiDotnet size={iconSize} color="#512bd4" />,
  },
  {
    name: "PHP",
    icon: <SiPhp size={iconSize} className="text-blue-500" />,
  },
  {
    name: "Python",
    icon: <SiPython size={iconSize} color="#3776AB" />,
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
    name: "CI/CD",
    icon: <SiGithubactions size={iconSize} color="#2088FF" />,
  },
  {
    name: "Docker",
    icon: <SiDocker size={iconSize} color="#2496ED" />,
  },
  {
    name: "PostgreSql",
    icon: <BiLogoPostgresql size={iconSize} className="text-blue-400" />,
  },
  {
    name: "MongoDB",
    icon: <SiMongodb size={iconSize} color="#47A248" />,
  },
  {
    name: "Redis",
    icon: <SiRedis size={iconSize} color="#FF4438" />,
  },
  {
    name: "Apache Spark",
    icon: <SiApachespark size={iconSize} color="#E25A1C" />,
  },
  {
    name: "Apache Airflow",
    icon: <SiApacheairflow size={iconSize} color="#017CEE" />,
  },
  {
    name: "Apache Kafka",
    icon: <SiApachekafka size={iconSize} className="text-foreground" />,
  },
  {
    name: "Kubernetes",
    icon: <SiKubernetes size={iconSize} color="#326CE5" />,
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

export const CAREER = [
  {
    title: `Senior Fullstack Developer
Fiberstar (PT. Mega Akses Persada)`,
    desc: `Merancang aplikasi enterprise internal untuk operasional jaringan Fiberstar, mengintegrasikan backend SQL Server dengan frontend Angular/.NET yang dipakai harian oleh tim lapangan dan operasional. Membangun "One Act" — sistem manajemen approval material & otomasi instalasi jaringan (.NET, Angular, Express.js, SQL Server). Memimpin code review dan mentoring 4+ developer (menurunkan defect pasca-rilis ~30%), serta merekayasa pipeline CI/CD self-hosted yang memangkas waktu deployment dari ~30 menit menjadi di bawah 5 menit.`,
    location: "Jakarta Selatan, Indonesia",
    startYear: "Apr 2026",
    endYear: "Sekarang",
    icon: HiBriefcase,
    highlight: true,
  },
  {
    title: `Fullstack Developer (Tech Lead)
KPN Plantation`,
    desc: `Tech lead yang mengirimkan 8+ sistem enterprise end-to-end (business process, desain database, UI/UX, frontend & backend) untuk operasional perkebunan kelapa sawit. Antara lain: Platform EUDR Compliance (memangkas waktu pelaporan ~40%), AI RAG System yang melayani 1.000+ staf internal dan menurunkan tiket support engineering rutin ~50%, Data Warehouse Analytics Produksi dengan ETL Spark/Airflow memproses 5jt+ record/bulan, serta monitoring real-time tanah & air tanah di 500+ blok perkebunan.`,
    location: "Jakarta Selatan, Indonesia",
    startYear: "Agu 2023",
    endYear: "Mar 2026",
    icon: HiBriefcase,
    highlight: false,
  },
  {
    title: `Studi S1 Informatika
Universitas Siber Asia`,
    desc: `Melanjutkan studi S1 Ilmu Komputer (IPK 3.62) sembari bekerja, untuk memperdalam fondasi teknologi informasi dan meningkatkan keterampilan sebagai profesional di industri ini.`,
    location: "Jakarta, Indonesia",
    startYear: "Jan 2024",
    endYear: "Apr 2026",
    icon: HiAcademicCap,
    highlight: false,
  },
  {
    title: `Fullstack Web Developer
PT. Extreme Network Sistem`,
    desc: `Mengembangkan Tnosworld PWA untuk pemesanan jasa keamanan dan registrasi badan hukum, mengintegrasikan Google Maps dan custom payment gateway Xendit yang memproses hingga ~1.000 transaksi/bulan (React.js, Laravel, MySQL, Redux Toolkit). Membangun backend dan frontend di berbagai modul klien, serta mengirimkan notifikasi push Android dan alert order via Telegram.`,
    location: "Jakarta Selatan, Indonesia",
    startYear: "Okt 2022",
    endYear: "Jul 2023",
    icon: HiBriefcase,
    highlight: false,
  },
  {
    title: `Fullstack Web Developer (Internship)
PT. Technogis Indonesia`,
    desc: `Membangun website manajemen inventaris berbasis Laravel yang menggantikan pencatatan manual spreadsheet dan mengurangi upaya rekonsiliasi stok. Mengonversi 18 halaman Figma menjadi HTML yang responsif dan pixel-accurate untuk situs utama Jagoweb.`,
    location: "Yogyakarta, Indonesia",
    startYear: "Jul 2021",
    endYear: "Des 2021",
    icon: HiBriefcase,
    highlight: false,
  },
  {
    title: `Studi Diploma 3 Teknik Informatika
Politeknik Negeri Indramayu`,
    desc: `Lulus D3 Teknik Informatika (IPK 3.46). Setelah lulus langsung melanjutkan karier sebagai fullstack developer.`,
    location: "Indramayu, Jawa Barat",
    startYear: "Jan 2019",
    endYear: "Jan 2022",
    icon: HiAcademicCap,
    highlight: false,
  },
];

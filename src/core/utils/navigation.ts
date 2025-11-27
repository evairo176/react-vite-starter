import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Frame,
    },
    {
      title: "Session",
      url: "/session",
      icon: PieChart,
    },
    {
      title: "Portfolio Management",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Category",
          url: "/portfolio-management/category",
        },
        {
          title: "Portfolio",
          url: "/portfolio-management/portfolio",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: Frame,
    },
    {
      name: "Session",
      url: "/session",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

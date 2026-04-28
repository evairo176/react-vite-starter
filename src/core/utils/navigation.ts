import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
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
          title: "Tag",
          url: "/portfolio-management/tag",
        },
        {
          title: "Tech Stack",
          url: "/portfolio-management/tech-stack",
        },
        {
          title: "Image Source",
          url: "/portfolio-management/image",
        },
        {
          title: "Portfolio",
          url: "/portfolio-management/portfolio",
        },
      ],
    },
    {
      title: "Blog Posts",
      url: "/blog-posts",
      icon: BookOpen,
    },
    {
      title: "Products",
      url: "/products",
      icon: PieChart,
    },
  ],
  testing: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Frame,
    },
    {
      title: "Claim",
      url: "/claim",
      icon: Frame,
    },
    {
      title: "Session",
      url: "/session",
      icon: PieChart,
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

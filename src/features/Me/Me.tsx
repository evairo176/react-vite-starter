import SEO from "@/components/shared/SEO";
import CareerList from "./CareerList";
import Introduction from "./Introduction";
import Projects from "./Projects/Projects";
import Skills from "./Skills";
import Achievements from "./Achievements";
import Blogs from "./Blogs";

const Me = () => {
  return (
    <>
      <SEO
        title="Dicki Prasetya | Full-Stack Developer Portfolio"
        description="Portofolio profesional Dicki Prasetya sebagai Full-Stack Developer dengan pengalaman membangun aplikasi web, sistem terintegrasi, dan solusi digital."
      />
      <Introduction />
      <Achievements />
      <CareerList />
      <Projects />
      <Skills />
      <Blogs />
    </>
  );
};

export default Me;

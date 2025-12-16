import SectionHeading from "@/shared/SectionHeading";
import Skill from "./Skill/Skill";
import { GiSkills } from "react-icons/gi";
import SectionSubHeading from "@/shared/SectionSubHeading";

type Props = {};

const Skills = (props: Props) => {
  return (
    <section className="space-y-6 mt-3 p-4 lg:p-8 rounded-md border bg-card text-card-foreground">
      <div className="space-y-2 ">
        <SectionHeading
          title="My Skills"
          icon={<GiSkills className="mr-2" />}
        />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">My professional skills.</p>
        </SectionSubHeading>
        <Skill />
      </div>
    </section>
  );
};

export default Skills;

import SectionHeading from "@/components/shared/SectionHeading";
import Project from "./Project/Project";

import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import useProjects from "./useProjects";
import { Skeleton } from "@/components/ui/skeleton";

const Projects = () => {
  const { dataPortfolio, isLoadingPortfolio } = useProjects();
  console.log(dataPortfolio);
  return (
    <section className="space-y-6 mt-3 p-4 lg:p-8 rounded-md border bg-card text-card-foreground">
      <div className="space-y-2 ">
        <SectionHeading
          title={"Proyek Saya"}
          icon={<AiOutlineFundProjectionScreen className="mr-2" />}
        />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">Proyek profesional saya</p>
        </SectionSubHeading>
        <div className="flex flex-col items-center justify-center">
          {isLoadingPortfolio ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            dataPortfolio?.map((row: any, index: number) => {
              return (
                <Project
                  key={index}
                  title={row.title}
                  description={row.shortDesc}
                  imageUrl={row?.images?.length > 0 ? row?.images[0]?.url : ""}
                  tags={row?.techStacks?.map((row: any) => row?.tech?.name)}
                  link={row.liveUrl}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;

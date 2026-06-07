import { AiOutlineFundProjectionScreen } from "react-icons/ai";
import { ArrowRight, ImageIcon, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";

import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import TechChip from "@/components/shared/TechChip";
import {
  ContentCardBody,
  ContentCardMedia,
  contentCardClassName,
} from "@/components/shared/ContentCard";
import { ProjectGridSkeleton } from "@/components/shared/skeletons";
import useProjects from "./useProjects";

/**
 * Home-page projects section. Renders the same card layout as the dedicated
 * `/projects` list so the project presentation stays consistent across the
 * site, links each card to its case-study detail, and exposes a "view all"
 * link to the full list.
 */
const Projects = () => {
  const { dataPortfolio, totalProjects, isLoadingPortfolio } = useProjects();

  const projects = Array.isArray(dataPortfolio)
    ? [...dataPortfolio]
        .sort(
          (a: any, b: any) => Number(b?.featured) - Number(a?.featured),
        )
        .slice(0, 6)
    : [];

  return (
    <section
      className="mt-3 space-y-6 rounded-md border bg-card p-4 text-card-foreground lg:p-8"
      id="projects"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <SectionHeading
              title={"Proyek Saya"}
              icon={<AiOutlineFundProjectionScreen className="mr-2" />}
            />
            {!isLoadingPortfolio && totalProjects > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <AiOutlineFundProjectionScreen className="size-4" />
                {totalProjects} proyek
              </span>
            ) : null}
          </div>
          <SectionSubHeading>
            <p className="dark:text-neutral-400">
              {totalProjects > 0
                ? `${totalProjects} proyek profesional yang telah saya kerjakan`
                : "Proyek profesional saya"}
            </p>
          </SectionSubHeading>
        </div>
        <Link
          to="/projects"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition hover:gap-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Lihat semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoadingPortfolio ? (
        <ProjectGridSkeleton count={6} />
      ) : projects.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          Belum ada proyek yang dipublikasikan.
        </p>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((row: any) => {
            const cover = row?.images?.length ? row.images[0]?.url : "";

            return (
              <Link
                key={row.id}
                to={"/projects/$slug" as never}
                params={{ slug: row.slug } as never}
                aria-label={`Lihat studi kasus ${row.title}`}
                className={contentCardClassName}
              >
                <ContentCardMedia
                  src={cover}
                  alt={row?.images?.[0]?.alt || row.title}
                  fallbackIcon={ImageIcon}
                />

                <ContentCardBody>
                  <div className="flex items-center gap-2">
                    {row.featured ? (
                      <Star
                        className="size-4 shrink-0 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                    ) : null}
                    <h3 className="line-clamp-2 font-semibold leading-snug transition group-hover:text-primary">
                      {row.title}
                    </h3>
                  </div>

                  {row.shortDesc ? (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {row.shortDesc}
                    </p>
                  ) : null}

                  {row.category?.name ? (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      <TechChip name={row.category.name} />
                    </div>
                  ) : null}
                </ContentCardBody>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Projects;

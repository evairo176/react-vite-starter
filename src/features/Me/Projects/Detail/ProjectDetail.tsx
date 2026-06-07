import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

import SEO from "@/components/shared/SEO";
import ErrorState from "@/components/shared/ErrorState";
import CategoryBadge from "@/components/shared/CategoryBadge";
import TechChip from "@/components/shared/TechChip";
import Lightbox from "@/components/shared/Lightbox";
import FadeIn from "@/components/shared/motion/FadeIn";
import MotionSection from "@/components/shared/motion/MotionSection";
import { BlogDetailSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { orderGallery } from "@/core/utils/gallery";
import { resolveSeo } from "@/core/utils/seo";

import useProjectDetail from "./useProjectDetail";

/**
 * Project_Case_Study_View — renders a full project case study: title, problem,
 * solution, and results sections (Req 2.5); a position-ordered gallery feeding
 * the Lightbox (Req 2.6, 18.5-18.6); category, tags, and tech-stack chips
 * (Req 2.9, 18.4); and external live/repo links opened in a new tab with
 * `rel="noopener noreferrer"` (Req 2.7-2.8). It distinguishes a 404 not-found
 * branch (message + back link, Req 2.3) from generic errors (Error_State +
 * retry, Req 2.4), shows a skeleton while loading (Req 2.2), and sets SEO from
 * project metadata with title/shortDesc fallback (Req 9.1).
 */
const ProjectDetail = () => {
  const { project, isLoading, isError, isNotFound, refetch } =
    useProjectDetail();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Loading_State (Req 2.2)
  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <BlogDetailSkeleton />
      </div>
    );
  }

  // Not-found branch: message + back link to the project list (Req 2.3)
  if (isNotFound || (!project && !isError)) {
    return (
      <div className="p-6">
        <div className="rounded-md border bg-card p-8 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Project not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The project you're looking for doesn't exist or may have been
            removed.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/projects">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Generic error branch: Error_State + retry (Req 2.4)
  if (isError || !project) {
    return (
      <div className="p-6">
        <ErrorState
          title="Couldn't load this project"
          description="Something went wrong while loading this case study. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const seo = resolveSeo(project);
  const orderedImages = orderGallery(project.images ?? []);
  const techStacks = (project.techStacks ?? [])
    .map((entry) => entry.tech)
    .filter(Boolean);

  const openLightbox = (index: number) => {
    setActiveImage(index);
    setLightboxOpen(true);
  };

  return (
    <article className="mx-auto w-full max-w-4xl space-y-8 p-4 lg:p-8">
      <SEO title={seo.title} description={seo.description} type="article" />

      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to projects
      </Link>

      <FadeIn as="header" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {project.category?.name ? (
            <CategoryBadge label={project.category.name} />
          ) : null}
        </div>

        <h1 className="text-2xl font-bold leading-tight lg:text-4xl">
          {project.title}
        </h1>

        {project.shortDesc ? (
          <p className="text-base text-muted-foreground">{project.shortDesc}</p>
        ) : null}

        {/* External live/repo links (Req 2.7, 2.8) */}
        {(project.liveUrl || project.repoUrl) && (
          <div className="flex flex-wrap gap-3">
            {project.liveUrl ? (
              <Button asChild>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  View live
                </a>
              </Button>
            ) : null}
            {project.repoUrl ? (
              <Button asChild variant="outline">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" aria-hidden="true" />
                  View repository
                </a>
              </Button>
            ) : null}
          </div>
        )}
      </FadeIn>

      {/* Position-ordered gallery feeding the Lightbox (Req 2.6, 18.5-18.6) */}
      {orderedImages.length > 0 && (
        <MotionSection className="space-y-3" aria-label="Project gallery">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {orderedImages.map((image, index) => (
              <button
                key={image.id ?? index}
                type="button"
                onClick={() => openLightbox(index)}
                aria-label={`Open image ${index + 1} in viewer`}
                className="group aspect-video overflow-hidden rounded-md border bg-muted transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <img
                  src={image.url}
                  alt={image.alt ?? `${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </MotionSection>
      )}

      {/* Case-study narrative sections (Req 2.5) */}
      {project.problem ? (
        <MotionSection className="space-y-2">
          <h2 className="text-xl font-semibold">Problem</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {project.problem}
          </p>
        </MotionSection>
      ) : null}

      {project.solution ? (
        <MotionSection className="space-y-2">
          <h2 className="text-xl font-semibold">Solution</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {project.solution}
          </p>
        </MotionSection>
      ) : null}

      {project.results ? (
        <MotionSection className="space-y-2">
          <h2 className="text-xl font-semibold">Results</h2>
          <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
            {project.results}
          </p>
        </MotionSection>
      ) : null}

      {/* Tech stack chips with name + icon (Req 2.9, 18.4) */}
      {techStacks.length > 0 && (
        <MotionSection className="space-y-3">
          <h2 className="text-xl font-semibold">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {techStacks.map((tech) => (
              <TechChip key={tech.id} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </MotionSection>
      )}

      <Lightbox
        images={orderedImages.map((image) => ({
          url: image.url,
          alt: image.alt,
        }))}
        index={activeImage}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setActiveImage}
      />
    </article>
  );
};

export default ProjectDetail;

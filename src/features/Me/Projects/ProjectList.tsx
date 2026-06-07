import { Link } from "@tanstack/react-router";
import { FolderGit2, Search, Star, X } from "lucide-react";

import SEO from "@/components/shared/SEO";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import TechChip from "@/components/shared/TechChip";
import {
  ContentCardBody,
  ContentCardMedia,
  contentCardClassName,
} from "@/components/shared/ContentCard";
import { ProjectGridSkeleton } from "@/components/shared/skeletons";
import { FadeIn, MotionSection } from "@/components/shared/motion";
import SearchableMultiSelect from "@/components/shared/searchable-mutiple-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PublicProject } from "@/core/types/portfolio.type";
import { cn } from "@/lib/utils";
import useProjectList from "./useProjectList";

const ALL_CATEGORIES = "__all__";

/** Single project card with cover image (or placeholder), title, and category. */
const ProjectCard = ({ project }: { project: PublicProject }) => {
  const cover = project.images?.length ? project.images[0]?.url : "";

  return (
    <Link
      to={"/projects/$slug" as never}
      params={{ slug: project.slug } as never}
      aria-label={`Lihat studi kasus ${project.title}`}
      className={contentCardClassName}
    >
      <ContentCardMedia
        src={cover}
        alt={project.images?.[0]?.alt || project.title}
      />

      <ContentCardBody>
        <div className="flex items-center gap-2">
          {project.featured ? (
            <Star
              className="size-4 shrink-0 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          ) : null}
          <h3 className="font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
            {project.title}
          </h3>
        </div>

        {project.shortDesc ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.shortDesc}
          </p>
        ) : null}

        {project.category?.name ? (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            <TechChip name={project.category.name} />
          </div>
        ) : null}
      </ContentCardBody>
    </Link>
  );
};

/**
 * Portfolio_List_View (Req 1, 16.1, 18.1-18.3).
 *
 * Renders a featured section that is always structurally present (Req 1.8), a
 * filter bar (category select, tag/tech multi-select, debounced search), the
 * responsive project card grid, and pagination. While loading it shows a
 * content-shaped `ProjectGridSkeleton` (Req 16.1), an `ErrorState` with retry
 * on failure (Req 1.3, 13.5), and an `EmptyState` on zero results (Req 1.4).
 */
const ProjectList = () => {
  const {
    projects,
    featuredProjects,
    metadata,
    isLoading,
    isError,
    isFetching,
    refetch,
    category,
    selectedTech,
    searchInput,
    page,
    categoryOptions,
    techOptions,
    handleChangeCategory,
    handleChangeTech,
    handleSearchChange,
    handleChangePage,
  } = useProjectList();

  const totalPages = metadata?.totalPages ?? 1;
  const hasActiveFilters =
    !!category ||
    selectedTech.length > 0 ||
    !!searchInput;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
      <SEO
        title="Proyek | Dicki Prasetya"
        description="Kumpulan studi kasus proyek profesional: masalah, solusi, hasil, dan teknologi yang digunakan."
      />

      <FadeIn className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight lg:text-3xl">
          <FolderGit2 className="size-6 text-primary" aria-hidden="true" />
          Proyek
        </h1>
        <p className="text-muted-foreground">
          Telusuri proyek yang dipublikasikan dengan filter dan pencarian.
        </p>
      </FadeIn>

      {/* Featured section — always structurally present (Req 1.8). */}
      <MotionSection
        aria-labelledby="featured-heading"
        className="space-y-4 rounded-lg border border-border bg-muted/30 p-4 lg:p-6"
      >
        <h2
          id="featured-heading"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Star className="size-5 text-amber-400" aria-hidden="true" />
          Proyek Unggulan
        </h2>
        {isLoading ? (
          <ProjectGridSkeleton count={3} />
        ) : featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada proyek unggulan untuk ditampilkan.
          </p>
        )}
      </MotionSection>

      {/* Filter bar. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="project-search">Cari</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="project-search"
              type="search"
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Cari proyek..."
              aria-label="Cari proyek"
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-category">Kategori</Label>
          <Select
            value={category || ALL_CATEGORIES}
            onValueChange={(value) =>
              handleChangeCategory(value === ALL_CATEGORIES ? "" : value)
            }
          >
            <SelectTrigger
              id="project-category"
              className="w-full"
              aria-label="Filter kategori"
            >
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>Semua kategori</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.slug}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SearchableMultiSelect
          label="Tech stack"
          placeholder="Semua tech"
          value={selectedTech}
          onChange={handleChangeTech}
          options={techOptions.map((option) => ({
            label: option.name,
            value: option.name,
          }))}
        />
      </div>

      {hasActiveFilters ? (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleChangeCategory("");
              handleChangeTech([]);
              handleSearchChange("");
            }}
          >
            <X className="size-4" aria-hidden="true" />
            Reset filter
          </Button>
        </div>
      ) : null}

      {/* Main list: loading / error / empty / results. */}
      {isLoading || isFetching ? (
        <ProjectGridSkeleton />
      ) : isError ? (
        <ErrorState
          title="Gagal memuat proyek"
          description="Terjadi kesalahan saat memuat daftar proyek. Silakan coba lagi."
          onRetry={() => refetch()}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="Tidak ada proyek"
          description={
            hasActiveFilters
              ? "Tidak ada proyek yang cocok dengan filter saat ini."
              : "Belum ada proyek yang dipublikasikan."
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination (Req 1.9). */}
      {!isLoading && !isFetching && !isError && totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                className={cn(
                  page <= 1 && "pointer-events-none opacity-50"
                )}
                onClick={() => {
                  if (page > 1) handleChangePage(page - 1);
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === page}
                    onClick={() => handleChangePage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= totalPages}
                className={cn(
                  page >= totalPages && "pointer-events-none opacity-50"
                )}
                onClick={() => {
                  if (page < totalPages) handleChangePage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </section>
  );
};

export default ProjectList;

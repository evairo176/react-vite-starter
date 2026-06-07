import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, FileText, Heart, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import {
  ContentCardBody,
  ContentCardMedia,
  contentCardClassName,
} from "@/components/shared/ContentCard";
import BlogListSkeleton from "@/components/shared/skeletons/BlogListSkeleton";
import FadeIn from "@/components/shared/motion/FadeIn";
import MotionSection from "@/components/shared/motion/MotionSection";
import { fmtDate } from "@/core/utils/date";
import type { IBlogPost } from "@/core/types/blogPost.type";

import useBlogList from "./useBlogList";

/** A single blog post card linking to its detail view. */
function PostCard({
  post,
  onActivate,
}: {
  post: IBlogPost;
  onActivate: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onActivate(post.slug)}
      className={contentCardClassName}
    >
      <ContentCardMedia
        src={post.coverImage}
        alt={post.title}
        fallbackIcon={FileText}
      />

      <ContentCardBody>
        <div className="text-xs text-muted-foreground">
          {fmtDate(post.updatedAt)}
        </div>
        <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold leading-snug transition group-hover:text-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {post.excerpt || "Belum ada ringkasan untuk tulisan ini."}
        </p>

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {post.totalViews}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" /> {post.totalLikes}
            </span>
          </div>
          <span className="inline-flex items-center text-xs font-medium text-primary">
            Baca <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </div>
      </ContentCardBody>
    </button>
  );
}

/**
 * Public Blog_List_View. Renders a filter bar (category + tag filters and a
 * debounced search input), a responsive card grid, and pagination. Loading,
 * error, and empty states are rendered through the shared primitives, and
 * activating a card navigates to `/blog/$slug`.
 *
 * Requirements: 3.2, 3.3, 3.4, 3.9, 16.2, 18.1, 18.2, 18.3, 13.5
 */
const BlogList = () => {
  const navigate = useNavigate();
  const {
    posts,
    meta,
    categories,
    tags,
    isLoading,
    isError,
    isFetching,
    isEmpty,
    refetch,
    category,
    tag,
    searchInput,
    page,
    handleSearchChange,
    handleCategoryChange,
    handleTagChange,
    handlePageChange,
    handleClearFilters,
  } = useBlogList();

  const goToDetail = (slug: string) => {
    navigate({ to: "/blog/$slug", params: { slug } } as never);
  };

  const totalPages = meta?.totalPages ?? 1;
  const hasPrev = meta?.hasPrev ?? page > 1;
  const hasNext = meta?.hasNext ?? page < totalPages;
  const hasActiveFilters = Boolean(category || tag || searchInput);

  return (
    <MotionSection
      id="blog-list"
      className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8"
    >
      <FadeIn className="space-y-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight lg:text-3xl">
          <FileText className="size-6 text-primary" aria-hidden="true" />
          Blog
        </h1>
        <p className="text-muted-foreground">Tulisan &amp; catatan terbaru</p>
      </FadeIn>

      {/* Filter bar */}
      <div className="space-y-4">
        <div className="grid max-w-md gap-2">
          <Label htmlFor="blog-search">Cari</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="blog-search"
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari tulisan..."
              aria-label="Cari blog"
              className="pl-9"
            />
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              label="Semua"
              active={!category}
              onClick={() => handleCategoryChange("")}
            />
            {categories.map((c) => (
              <CategoryBadge
                key={c.id}
                label={c.name}
                active={category === c.slug}
                onClick={() => handleCategoryChange(c.slug)}
              />
            ))}
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <CategoryBadge
                key={t.id}
                label={`#${t.name}`}
                active={tag === t.slug}
                onClick={() => handleTagChange(tag === t.slug ? "" : t.slug)}
              />
            ))}
          </div>
        ) : null}

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" /> Reset filter
          </Button>
        ) : null}
      </div>

      {/* Content states */}
      {isLoading || isFetching ? (
        <BlogListSkeleton />
      ) : isError ? (
        <ErrorState
          title="Gagal memuat blog"
          description="Terjadi kesalahan saat memuat daftar tulisan."
          onRetry={() => refetch()}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={FileText}
          title="Belum ada tulisan"
          description={
            hasActiveFilters
              ? "Tidak ada tulisan yang cocok dengan filter ini."
              : "Belum ada blog yang dipublikasikan."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <FadeIn
                key={post.id}
                delay={Math.min(index, 6) * 0.05}
                className="h-full"
              >
                <PostCard post={post} onActivate={goToDetail} />
              </FadeIn>
            ))}
          </div>

          {totalPages > 1 ? (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={!hasPrev}
                    className={
                      !hasPrev ? "pointer-events-none opacity-50" : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasPrev) handlePageChange(page - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    aria-disabled={!hasNext}
                    className={
                      !hasNext ? "pointer-events-none opacity-50" : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasNext) handlePageChange(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      )}
    </MotionSection>
  );
};

export default BlogList;

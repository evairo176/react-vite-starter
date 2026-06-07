import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Eye, Heart, List, X } from "lucide-react";
import { createPortal } from "react-dom";
import { BiListUl } from "react-icons/bi";

import SEO from "@/components/shared/SEO";
import ReadingProgress from "@/components/shared/ReadingProgress";
import CategoryBadge from "@/components/shared/CategoryBadge";
import FadeIn from "@/components/shared/motion/FadeIn";
import MotionSection from "@/components/shared/motion/MotionSection";
import { BlogDetailSkeleton } from "@/components/shared/skeletons";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/core/utils/date";
import { resolveSeo } from "@/core/utils/seo";

import useBlogDetail from "./useBlogDetail";
import ReactionControl from "./ReactionControl";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

type TocItem = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
};

const BlogDetail = () => {
  const {
    post,
    isLoading,
    isError,
    isNotFound,
    refetch,
    comments,
    isCommentsLoading,
    reactionCount,
    submitReaction,
    isReacting,
    hasReacted,
    submitComment,
    isSubmittingComment,
  } = useBlogDetail();

  const articleRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState<boolean>(true);

  // Inject HTML content manually so React never touches the DOM afterward,
  // then collect headings and assign unique stable ids for the TOC.
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const root = contentRef.current;
    root.innerHTML = post?.content ?? "";

    const headings = Array.from(
      root.querySelectorAll<HTMLElement>("h1, h2, h3"),
    );
    const items: TocItem[] = headings.map((el, index) => {
      const text = (el.textContent || "").trim() || `Section ${index + 1}`;
      const id = `toc-heading-${index}`;
      el.id = id;
      el.setAttribute("data-toc-id", id);
      el.style.scrollMarginTop = "96px";
      const level = (el.tagName === "H1" ? 1 : el.tagName === "H2" ? 2 : 3) as
        | 1
        | 2
        | 3;
      return { id, text, level };
    });
    setToc(items);
  }, [post?.content]);

  // Highlight the current section while scrolling.
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  // Make sure the page is scrollable (sidebar may have locked body overflow).
  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  const handleScrollTo = (item: TocItem) => {
    const el =
      document.getElementById(item.id) ||
      contentRef.current?.querySelector<HTMLElement>(
        `[data-toc-id="${item.id}"]`,
      );
    if (!el) return;
    const headerOffset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(item.id);
  };

  // Loading_State (Req 4.2)
  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <BlogDetailSkeleton />
      </div>
    );
  }

  // Not-found branch: message + back link to the blog list (Req 4.3)
  if (isNotFound || (!post && !isError)) {
    return (
      <div className="p-6">
        <div className="rounded-md border bg-card p-8 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Post not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The post you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild variant="outline" className="mt-4">
            {/* `/blogs` route is registered in a later task; use a plain link
                so navigation works without a typed-route dependency. */}
            <a href="/blogs">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to blog
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Generic error branch: Error_State + retry
  if (isError || !post) {
    return (
      <div className="p-6">
        <ErrorState
          title="Couldn't load this post"
          description="Something went wrong while loading this post. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const seo = resolveSeo(post);
  const tags = post.tags ?? [];
  const relatedPosts = post.relatedPosts ?? [];

  return (
    <>
      <ReadingProgress targetRef={articleRef} />

      <article
        ref={articleRef}
        className="mx-auto w-full max-w-3xl space-y-6 p-4 lg:p-8"
      >
        <SEO title={seo.title} description={seo.description} type="article" />

        <a
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to blog
        </a>

        {post.coverImage && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            <img
              src={post.coverImage}
              alt={post.title}
              className="size-full object-cover"
            />
          </div>
        )}

        <FadeIn as="header" className="space-y-3">
          {/* Category + tags (Req 4.4) */}
          <div className="flex flex-wrap items-center gap-2">
            {post.category?.name ? (
              <CategoryBadge label={post.category.name} />
            ) : null}
            {tags.map((tag) => (
              <CategoryBadge key={tag.id} label={tag.name} />
            ))}
          </div>

          <h1 className="text-2xl font-bold leading-tight lg:text-3xl">
            {post.title}
          </h1>

          {/* Reading time + view count + reaction count (Req 4.4) */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>{fmtDate(post.updatedAt)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden="true" /> {post.totalViews}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3.5" aria-hidden="true" /> {reactionCount}
            </span>
          </div>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground">{post.excerpt}</p>
          )}
        </FadeIn>

        {/* Post content (Req 4.4) */}
        <div ref={contentRef} className="rte-content max-w-none" />

        {/* Reaction_Control (Req 4.5, 4.6, 21.2) */}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Enjoyed this post? Leave a reaction.
          </span>
          <ReactionControl
            count={reactionCount}
            onReact={() => submitReaction({})}
            isPending={isReacting}
            hasReacted={hasReacted}
          />
        </div>

        {/* Related posts (Req 4.11) */}
        {relatedPosts.length > 0 && (
          <MotionSection className="space-y-3 border-t pt-6">
            <h2 className="text-lg font-semibold">Related posts</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <li key={related.id}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: related.slug }}
                    className="group flex flex-col gap-2 rounded-md border bg-card p-3 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {related.coverImage ? (
                      <div className="aspect-video w-full overflow-hidden rounded bg-muted">
                        <img
                          src={related.coverImage}
                          alt={related.title}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                    <span className="text-sm font-medium group-hover:text-primary">
                      {related.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </MotionSection>
        )}

        {/* Comments (Req 4.7) */}
        <MotionSection className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">Comments</h2>
          <CommentList comments={comments} isLoading={isCommentsLoading} />
        </MotionSection>

        {/* Comment_Form (Req 4.8, 4.9, 4.10, 21.3) */}
        <MotionSection className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold">Leave a comment</h2>
          <CommentForm
            onSubmit={submitComment}
            isSubmitting={isSubmittingComment}
          />
        </MotionSection>

        {/* Floating table of contents */}
        {toc.length > 0 &&
          createPortal(
            tocOpen ? (
              <aside
                className="toc-panel fixed right-6 top-24 z-50 flex max-h-[70vh] w-72 flex-col rounded-md border bg-card shadow-lg"
                aria-label="Table of contents"
              >
                <div className="flex items-center justify-between border-b p-3 text-sm font-semibold">
                  <span className="inline-flex items-center gap-2">
                    <List className="size-4" /> Daftar Isi
                  </span>
                  <button
                    type="button"
                    onClick={() => setTocOpen(false)}
                    className="rounded-md p-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    aria-label="Sembunyikan daftar isi"
                    title="Sembunyikan daftar isi"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <ul className="toc-tree flex-1 overflow-y-auto p-3 text-sm">
                  {toc.map((item) => (
                    <li
                      key={item.id}
                      className={`toc-item toc-level-${item.level}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleScrollTo(item)}
                        className={`toc-link ${
                          activeId === item.id ? "toc-active" : ""
                        }`}
                        title={item.text}
                      >
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : (
              <button
                type="button"
                onClick={() => setTocOpen(true)}
                className="fixed right-6 top-24 z-50 flex size-11 items-center justify-center rounded-full border bg-card text-card-foreground shadow-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Tampilkan daftar isi"
                title="Tampilkan daftar isi"
              >
                <BiListUl className="size-6" />
              </button>
            ),
            document.body,
          )}

        <style>{`
          .rte-content h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin: 1rem 0 0.5rem; }
          .rte-content h2 { font-size: 1.5rem;   font-weight: 700; line-height: 1.25; margin: 1rem 0 0.5rem; }
          .rte-content h3 { font-size: 1.25rem;  font-weight: 600; line-height: 1.3;  margin: 0.75rem 0 0.5rem; }
          .rte-content p  { margin: 0.5rem 0; line-height: 1.7; }
          .rte-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
          .rte-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
          .rte-content a  { color: hsl(var(--primary)); text-decoration: underline; }
          .rte-content code {
            background: rgba(127,127,127,0.15);
            padding: 0.125rem 0.35rem;
            border-radius: 0.25rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.85em;
          }
          .rte-content pre {
            background: rgba(0,0,0,0.85);
            color: #f8f8f2;
            padding: 0.75rem 1rem;
            border-radius: 0.375rem;
            margin: 0.75rem 0;
            max-width: 100%;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
          }
          .rte-content pre code {
            background: transparent;
            color: inherit;
            padding: 0;
            font-size: 0.9em;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
            display: block;
          }

          .toc-tree { list-style: none; margin: 0; padding: 0.5rem 0.75rem; }
          .toc-item { position: relative; padding: 2px 0; }
          .toc-link {
            display: block;
            width: 100%;
            text-align: left;
            padding: 4px 6px;
            border-radius: 4px;
            color: hsl(var(--muted-foreground));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: background 0.15s, color 0.15s;
            cursor: pointer;
            background: transparent;
            border: 0;
          }
          .toc-link:hover { background: rgba(127,127,127,0.12); color: hsl(var(--foreground)); }
          .toc-active { color: hsl(var(--primary)) !important; font-weight: 600; background: rgba(127,127,127,0.08); }

          .toc-level-1 { padding-left: 0; }
          .toc-level-2 { padding-left: 16px; }
          .toc-level-3 { padding-left: 32px; }

          .toc-level-2::before,
          .toc-level-3::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 6px;
            border-left: 1px solid rgba(127,127,127,0.35);
          }
          .toc-level-3::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 22px;
            border-left: 1px solid rgba(127,127,127,0.25);
          }

          .toc-level-2 > .toc-link::before,
          .toc-level-3 > .toc-link::before {
            content: "";
            position: absolute;
            left: 6px;
            top: 14px;
            width: 8px;
            border-top: 1px solid rgba(127,127,127,0.35);
          }
          .toc-level-3 > .toc-link::before {
            left: 22px;
          }
        `}</style>
      </article>
    </>
  );
};

export default BlogDetail;

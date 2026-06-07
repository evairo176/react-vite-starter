import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import { Eye, Heart, FileText, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { IBlogPost } from "@/core/types/blogPost.type";
import { fmtDate } from "@/core/utils/date";
import {
  ContentCardBody,
  ContentCardMedia,
  contentCardClassName,
} from "@/components/shared/ContentCard";
import useBlogs from "./useBlogs";

const Blogs = () => {
  const { dataBlogs, isLoadingBlogs } = useBlogs();

  return (
    <section
      className="mt-3 space-y-6 rounded-md border bg-card p-4 text-card-foreground lg:p-8"
      id="blogs"
    >
      <div className="space-y-2">
        <SectionHeading title={"Blog"} icon={<FileText className="mr-2" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">Tulisan & catatan terbaru</p>
        </SectionSubHeading>
      </div>

      {isLoadingBlogs ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : !dataBlogs || dataBlogs.length === 0 ? (
        <div className="py-6 text-sm text-muted-foreground">
          Belum ada blog yang dipublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dataBlogs.map((post: IBlogPost) => (
            <Link
              key={post.id}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              aria-label={`Baca tulisan ${post.title}`}
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
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Blogs;

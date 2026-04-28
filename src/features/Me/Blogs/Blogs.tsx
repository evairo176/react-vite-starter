import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import { Eye, Heart, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { IBlogPost } from "@/core/types/blogPost.type";
import { fmtDate } from "@/core/utils/date";
import useBlogs from "./useBlogs";

const Blogs = () => {
  const { dataBlogs, isLoadingBlogs } = useBlogs();

  return (
    <section
      className="space-y-6 mt-3 p-4 lg:p-8 rounded-md border bg-card text-card-foreground"
      id="blogs"
    >
      <div className="space-y-2">
        <SectionHeading title={"Blog"} icon={<FileText className="mr-2" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">Tulisan & catatan terbaru</p>
        </SectionSubHeading>

        {isLoadingBlogs ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !dataBlogs || dataBlogs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">
            Belum ada blog yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataBlogs.map((post: IBlogPost) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group rounded-md border bg-background overflow-hidden hover:shadow-md transition flex flex-col"
              >
                {post.coverImage ? (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground">
                    <FileText className="w-8 h-8" />
                  </div>
                )}

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="text-xs text-muted-foreground">
                    {fmtDate(post.updatedAt)}
                  </div>
                  <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {post.totalViews}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {post.totalLikes}
                      </span>
                    </div>
                    <span className="inline-flex items-center text-xs font-medium text-primary">
                      Baca <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blogs;

import { MessageSquare } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import { fmtDate } from "@/core/utils/date";
import type { BlogComment } from "@/core/types/blogPost.type";

export interface CommentListProps {
  /** Approved comments returned by the comments query (Req 4.7). */
  comments: BlogComment[];
  /** Whether the comments request is in flight. */
  isLoading?: boolean;
}

/**
 * Renders the list of approved comments for a blog post (Req 4.7). Shows a
 * lightweight loading hint while fetching and an EmptyState when there are no
 * approved comments yet.
 */
export default function CommentList({
  comments,
  isLoading = false,
}: CommentListProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading comments…
      </p>
    );
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Be the first to share your thoughts on this post."
      />
    );
  }

  return (
    <ul className="space-y-4" aria-label="Comments">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="rounded-md border bg-card p-4 text-card-foreground"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">{comment.name}</span>
            <span className="text-xs text-muted-foreground">
              {fmtDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}

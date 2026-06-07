import blogPostService, {
  type ReactionDTO,
} from "@/core/services/blogPost.service";
import { queryKeys } from "@/core/query/keys";
import { applyOptimistic, rollback } from "@/core/utils/reaction";
import {
  type BlogComment,
  type CommentDTO,
  type PublicBlogPost,
} from "@/core/types/blogPost.type";
import {
  errorCallback,
  successCallback,
} from "@/core/utils/tanstack-callback";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const VIEWED_KEY = "viewed-blog-posts";
const REACTED_KEY = "reacted-blog-posts";

const readList = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const addToList = (key: string, id: string): void => {
  try {
    const list = readList(key);
    if (!list.includes(id)) {
      localStorage.setItem(key, JSON.stringify([...list, id]));
    }
  } catch {
    // ignore persistence failures
  }
};

/**
 * Data orchestration for the Blog_Detail_View (Req 4).
 *
 * Loads the public post detail and its approved comments through the shared
 * query-key registry (Req 13.2). The reaction mutation applies an optimistic
 * count increment via `applyOptimistic`, snapshots the previous cache entry,
 * rolls back + shows an error toast on failure (Req 4.5, 4.6), and invalidates
 * the detail query on settle so the rendered count converges on the server
 * value. The comment mutation maps the form DTO to the API payload, shows a
 * moderation-aware success toast (Req 4.8, 4.9), and invalidates the comments
 * query. A 404 detail response is surfaced as `isNotFound` (Req 4.3).
 */
const useBlogDetail = () => {
  const { slug = "" } = useParams({ strict: false }) as { slug?: string };
  const queryClient = useQueryClient();

  const detailKey = queryKeys.publicBlog.detail(slug);
  const commentsKey = queryKeys.publicBlog.comments(slug);

  // Post detail query (Req 4.1, 4.2, 4.4).
  const detailQuery = useQuery({
    queryKey: detailKey,
    queryFn: async () => {
      const res = await blogPostService.getPublicBySlug(slug);
      return res?.data?.data as PublicBlogPost;
    },
    enabled: !!slug,
    retry: false,
  });

  const post = detailQuery.data;

  // Whether this browser has already reacted to the current post (Req: prevent
  // multiple reactions per browser via localStorage).
  const [hasReacted, setHasReacted] = useState(false);

  useEffect(() => {
    if (!post?.id) {
      setHasReacted(false);
      return;
    }
    setHasReacted(readList(REACTED_KEY).includes(post.id));
  }, [post?.id]);

  // A 404 maps to the dedicated not-found branch; other failures are generic
  // errors. (Req 4.3)
  const isNotFound =
    detailQuery.isError && isAxiosError(detailQuery.error)
      ? detailQuery.error.response?.status === 404
      : false;

  // Approved comments query, only fetched once the post resolves. (Req 4.7)
  // The API returns `body`/`isApproved`; normalize to the `content`/`status`
  // shape consumed by the UI's BlogComment type.
  const commentsQuery = useQuery({
    queryKey: commentsKey,
    queryFn: async () => {
      const res = await blogPostService.getPublicComments(slug);
      const rows = (res?.data?.data ?? []) as Array<
        Partial<BlogComment> & { body?: string; isApproved?: boolean }
      >;
      return rows.map(
        (row): BlogComment => ({
          id: row.id ?? "",
          name: row.name ?? "",
          email: row.email,
          content: row.content ?? row.body ?? "",
          status: row.status ?? (row.isApproved ? "approved" : "pending"),
          createdAt: row.createdAt ?? "",
        }),
      );
    },
    enabled: !!slug && !!post,
    retry: false,
  });

  // Best-effort, once-per-browser view increment (preserves prior behavior and
  // keeps the existing /blog/$slug route working).
  const incrementViewMutation = useMutation({
    mutationFn: (id: string) => blogPostService.incrementView(id),
  });

  useEffect(() => {
    if (!post?.id) return;
    const viewed = readList(VIEWED_KEY);
    if (!viewed.includes(post.id)) {
      incrementViewMutation.mutate(post.id);
      addToList(VIEWED_KEY, post.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  // Reaction mutation with optimistic update + rollback (Req 4.5, 4.6).
  // The server returns the authoritative `{ count }`; we write that into the
  // detail cache on success rather than refetching the (cached) detail
  // endpoint, which would otherwise show a stale count. A localStorage flag
  // prevents the same browser from reacting more than once.
  const reactionMutation = useMutation({
    mutationFn: (dto: ReactionDTO = {}) =>
      blogPostService.createReaction(slug, dto),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<PublicBlogPost>(detailKey);

      if (previous) {
        queryClient.setQueryData<PublicBlogPost>(detailKey, {
          ...previous,
          reactionCount: applyOptimistic(previous.reactionCount ?? 0),
        });
      }

      return { previous };
    },
    onSuccess: (response) => {
      // Authoritative count from the API response (`data.count`). (Req 4.5)
      const serverCount = (
        response?.data?.data as { count?: number } | undefined
      )?.count;

      queryClient.setQueryData<PublicBlogPost>(detailKey, (current) =>
        current
          ? {
              ...current,
              reactionCount:
                typeof serverCount === "number"
                  ? serverCount
                  : current.reactionCount,
            }
          : current,
      );

      // Persist the per-browser reaction flag so the user can't react again
      // (unless they clear their browser storage).
      if (post?.id) {
        addToList(REACTED_KEY, post.id);
        setHasReacted(true);
      }
    },
    onError: (error, _dto, context) => {
      // Restore the previously displayed reaction count. (Req 4.6)
      if (context?.previous) {
        queryClient.setQueryData<PublicBlogPost>(detailKey, (current) =>
          current
            ? {
                ...current,
                reactionCount: rollback(
                  current.reactionCount ?? 0,
                  context.previous!.reactionCount ?? 0,
                ),
              }
            : context.previous,
        );
      }
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  /** Submit a reaction, guarding against repeat reactions from this browser. */
  const submitReaction = (dto?: ReactionDTO) => {
    if (hasReacted || reactionMutation.isPending) {
      toast.info("Kamu sudah memberi reaksi pada tulisan ini.");
      return;
    }
    reactionMutation.mutate(dto ?? {});
  };

  // Comment mutation: maps form DTO -> API payload, moderation-aware success
  // toast, and comments invalidation. (Req 4.8, 4.9)
  const commentMutation = useMutation({
    mutationFn: (dto: CommentDTO) =>
      blogPostService.createComment(slug, {
        name: dto.name,
        email: dto.email,
        // Backend expects `body`; the form field is `content`.
        body: dto.content,
      } as unknown as CommentDTO),
    onSuccess: (response) => {
      const created = response?.data?.data as
        | { isApproved?: boolean }
        | undefined;
      const awaitingModeration = created ? created.isApproved === false : false;

      if (awaitingModeration) {
        // Comment hidden until an admin approves it. (Req 4.9)
        toast.success(
          "Thanks! Your comment will appear after it's approved.",
        );
      } else {
        toast.success(successCallback(response));
      }

      queryClient.invalidateQueries({ queryKey: commentsKey });
    },
    onError: (error) => {
      const { message } = errorCallback(error);
      toast.error(message);
    },
  });

  return {
    slug,
    post,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError && !isNotFound,
    isNotFound,
    refetch: detailQuery.refetch,

    comments: commentsQuery.data ?? [],
    isCommentsLoading: commentsQuery.isLoading,
    isCommentsError: commentsQuery.isError,

    reactionCount: post?.reactionCount ?? 0,
    submitReaction,
    isReacting: reactionMutation.isPending,
    hasReacted,

    submitComment: commentMutation.mutateAsync,
    isSubmittingComment: commentMutation.isPending,
    commentSucceeded: commentMutation.isSuccess,
  };
};

export default useBlogDetail;

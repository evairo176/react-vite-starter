import blogPostService from "@/core/services/blogPost.service";
import type { IBlogPost } from "@/core/types/blogPost.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VIEWED_KEY = "viewed-blog-posts";
const LIKED_KEY = "liked-blog-posts";

const readList = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const useBlogDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [liked, setLiked] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["blogDetail", slug],
    queryFn: async () => {
      const res = await blogPostService.getPublicBySlug(slug);
      return res?.data?.data as IBlogPost;
    },
    enabled: !!slug,
  });

  const incrementViewMutation = useMutation({
    mutationFn: (id: string) => blogPostService.incrementView(id),
  });

  const incrementLikeMutation = useMutation({
    mutationFn: (id: string) => blogPostService.incrementLike(id),
  });

  // increment view once per browser per post
  useEffect(() => {
    if (!data?.id) return;
    const viewed = readList(VIEWED_KEY);
    if (!viewed.includes(data.id)) {
      incrementViewMutation.mutate(data.id);
      try {
        localStorage.setItem(
          VIEWED_KEY,
          JSON.stringify([...viewed, data.id]),
        );
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  // restore liked state from localStorage
  useEffect(() => {
    if (!data?.id) return;
    const likedList = readList(LIKED_KEY);
    setLiked(likedList.includes(data.id));
  }, [data?.id]);

  const handleLike = () => {
    if (!data?.id || liked) return;
    const likedList = readList(LIKED_KEY);
    if (likedList.includes(data.id)) {
      setLiked(true);
      return;
    }
    setLiked(true);
    setOptimisticLikes((data.totalLikes ?? 0) + 1);
    incrementLikeMutation.mutate(data.id);
    try {
      localStorage.setItem(
        LIKED_KEY,
        JSON.stringify([...likedList, data.id]),
      );
    } catch {
      // ignore
    }
  };

  return {
    data,
    isLoading,
    refetch,
    liked,
    optimisticLikes,
    handleLike,
  };
};

export default useBlogDetail;

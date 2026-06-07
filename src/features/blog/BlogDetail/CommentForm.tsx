import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CommentSchema, type CommentDTO } from "@/core/types/blogPost.type";

export interface CommentFormProps {
  /**
   * Submits the validated comment. Resolves on success and rejects on failure
   * (the parent hook owns the success/error toast + moderation message).
   */
  onSubmit: (values: CommentDTO) => Promise<unknown>;
  /** Whether a submission is currently in flight. */
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Comment_Form for the Blog_Detail_View (Req 4.8, 4.9, 4.10, 21.3).
 *
 * Validates name/email/content with the zod `CommentSchema` via react-hook-form
 * so invalid input shows field-level messages and blocks submission (Req 4.10).
 * On a successful submit the form resets and a brief confirmation animation
 * plays unless reduced motion is requested (Req 21.3); the success/moderation
 * toast is owned by the parent hook (Req 4.8, 4.9).
 */
export default function CommentForm({
  onSubmit,
  isSubmitting = false,
  className,
}: CommentFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const [confirmed, setConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentDTO>({
    resolver: zodResolver(CommentSchema),
    defaultValues: { name: "", email: "", content: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!confirmed) return;
    const timer = setTimeout(() => setConfirmed(false), 1800);
    return () => clearTimeout(timer);
  }, [confirmed]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset();
      if (!prefersReducedMotion) setConfirmed(true);
    } catch {
      // Error toast is handled by the parent hook; keep entered values intact.
    }
  });

  return (
    <form onSubmit={submit} className={cn("space-y-4", className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="comment-name">Name</Label>
          <Input
            id="comment-name"
            {...register("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "comment-name-error" : undefined}
          />
          {errors.name ? (
            <p id="comment-name-error" className="text-xs text-destructive">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comment-email">Email</Label>
          <Input
            id="comment-email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "comment-email-error" : undefined}
          />
          {errors.email ? (
            <p id="comment-email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment-content">Comment</Label>
        <Textarea
          id="comment-content"
          rows={4}
          {...register("content")}
          aria-invalid={!!errors.content}
          aria-describedby={
            errors.content ? "comment-content-error" : undefined
          }
        />
        {errors.content ? (
          <p id="comment-content-error" className="text-xs text-destructive">
            {errors.content.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Post comment"}
        </Button>

        {confirmed ? (
          <motion.span
            className="inline-flex items-center gap-1 text-sm text-primary"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Sent
          </motion.span>
        ) : null}
      </div>
    </form>
  );
}

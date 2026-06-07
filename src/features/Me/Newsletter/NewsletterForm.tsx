import { CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/shared/motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import useNewsletter from "./useNewsletter";

export interface NewsletterFormProps {
  /** Optional heading shown above the input. */
  title?: string;
  /** Optional supporting copy shown under the heading. */
  description?: string;
  /** Additional classes applied to the root wrapper. */
  className?: string;
}

/**
 * Compact, embeddable Newsletter_Form (Req 6, 21.3).
 *
 * Renders an email input plus a subscribe control validated by RHF + zod
 * (Req 6.1-6.2). While the request is in flight the control is disabled and
 * shows a spinner. On success the input clears and a confirmation animation
 * plays unless the visitor requests reduced motion (Req 6.4, 21.3); on failure
 * an error toast is shown (Req 6.5). Designed to drop into a footer or section.
 */
const NewsletterForm = ({
  title = "Berlangganan Newsletter",
  description = "Dapatkan pembaruan terbaru langsung ke kotak masuk Anda.",
  className,
}: NewsletterFormProps) => {
  const { form, handleSubmit, isPending, justSucceeded } = useNewsletter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("w-full max-w-md space-y-3", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title ? (
            <p className="text-sm font-semibold text-foreground">{title}</p>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={isPending} type="submit" className="sm:shrink-0">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Memproses...
                </>
              ) : (
                "Berlangganan"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {justSucceeded && !isPending ? (
        <FadeIn
          direction="none"
          duration={0.3}
          className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          <span>
            {prefersReducedMotion
              ? "Berhasil berlangganan"
              : "Terima kasih, Anda berhasil berlangganan"}
          </span>
        </FadeIn>
      ) : null}
    </div>
  );
};

export default NewsletterForm;

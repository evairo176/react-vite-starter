import { Quote } from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { TestimonialSkeleton } from "@/components/shared/skeletons";
import { FadeIn, MotionSection } from "@/components/shared/motion";
import type { Testimonial } from "@/core/types/testimonial.type";
import useTestimonials from "./useTestimonials";

const Testimonials = () => {
  const { testimonials, isLoading, isError, refetch } = useTestimonials();

  const renderBody = () => {
    if (isLoading) {
      return <TestimonialSkeleton />;
    }

    if (isError) {
      return (
        <ErrorState
          description="We couldn't load the testimonials. Please try again."
          onRetry={() => refetch()}
        />
      );
    }

    if (!testimonials || testimonials.length === 0) {
      return (
        <EmptyState
          icon={Quote}
          title="Belum ada testimoni"
          description="Testimoni akan tampil di sini setelah dipublikasikan."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item: Testimonial, index: number) => (
          <FadeIn
            key={item.id}
            delay={index * 0.05}
            className="flex flex-col gap-4 rounded-lg border bg-background p-6 hover:shadow-md transition"
          >
            <Quote
              className="h-6 w-6 text-primary/60"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.message}
            </p>

            <div className="mt-auto flex items-center gap-3 pt-2">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {item.author.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {item.author}
                </span>
                {item.role ? (
                  <span className="text-xs text-muted-foreground">
                    {item.role}
                  </span>
                ) : null}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    );
  };

  return (
    <MotionSection
      className="space-y-6 mt-3 p-4 sm:p-6 lg:p-8 rounded-md border bg-card text-card-foreground"
      id="testimonials"
    >
      <div className="space-y-2">
        <SectionHeading title={"Testimoni"} icon={<Quote className="mr-2" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">
            Apa kata mereka yang pernah bekerja sama
          </p>
        </SectionSubHeading>

        {renderBody()}
      </div>
    </MotionSection>
  );
};

export default Testimonials;

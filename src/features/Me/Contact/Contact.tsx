import { CheckCircle2, Loader2, Mail } from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import { FadeIn, MotionSection } from "@/components/shared/motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import useContact from "./useContact";

/**
 * Contact_Form view (Req 5, 21.3).
 *
 * Renders an RHF + zod validated form with name / email / subject / body
 * fields. Field-level validation messages block submission (Req 5.2). While the
 * submission is in flight the submit control is disabled and shows a spinner
 * (Req 5.4). On success a confirmation animation plays unless the visitor has
 * requested reduced motion (Req 5.5, 21.3).
 */
const Contact = () => {
  const { form, handleSubmit, isPending, justSucceeded } = useContact();
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionSection
      className="space-y-6 mt-3 p-4 sm:p-6 lg:p-8 rounded-md border bg-card text-card-foreground"
      id="contact"
    >
      <div className="space-y-2">
        <SectionHeading title={"Kontak"} icon={<Mail className="mr-2" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">
            Punya pertanyaan atau ingin bekerja sama? Kirim pesan di bawah ini.
          </p>
        </SectionSubHeading>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 pt-2"
            noValidate
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjek</FormLabel>
                  <FormControl>
                    <Input placeholder="Subjek pesan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Tulis pesan Anda di sini..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3">
              <Button disabled={isPending} type="submit">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Pesan"
                )}
              </Button>

              {justSucceeded && !isPending ? (
                <FadeIn
                  direction="none"
                  duration={0.3}
                  className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400"
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <span>
                    {prefersReducedMotion
                      ? "Pesan terkirim"
                      : "Pesan berhasil terkirim"}
                  </span>
                </FadeIn>
              ) : null}
            </div>
          </form>
        </Form>
      </div>
    </MotionSection>
  );
};

export default Contact;

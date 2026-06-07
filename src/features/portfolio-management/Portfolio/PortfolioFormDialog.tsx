import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  Cpu,
  FileText,
  Globe,
  Layers,
  Link as LinkIcon,
  Save,
  Star,
  Type,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import SearchableSelect from "@/components/shared/searchable-select";
import SearchableMultiSelect from "@/components/shared/searchable-mutiple-select";

import {
  CreatePortfolioSchema,
  type CreatePortfolioDTO,
  type IPPortfolio,
} from "@/core/types/portfolio.type";
import type { IPCategory } from "@/core/types/category.type";
import type { IPTechStack } from "@/core/types/techStack.type";
import type { GalleryEditorImage } from "@/core/utils/gallery";

import GalleryEditor from "./GalleryEditor";

export type PortfolioFormValues = CreatePortfolioDTO;

interface PortfolioFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** When provided the dialog operates in edit mode; otherwise create mode. */
  data?: IPPortfolio | null;
  isPending: boolean;
  dataCategory?: IPCategory[];
  dataTech?: IPTechStack[];
  onSubmit: (values: PortfolioFormValues) => void;
}

const EMPTY_DEFAULTS: PortfolioFormValues = {
  title: "",
  slug: "",
  description: "",
  shortDesc: "",
  categoryId: "",
  liveUrl: "",
  repoUrl: "",
  problem: "",
  solution: "",
  results: "",
  featured: false,
  isPublished: true,
  images: [],
  techIds: [],
};

/**
 * Shared create/edit dialog for the Admin_Portfolio_Manager. Provides the
 * case-study textareas (problem/solution/results, Req 11.7), the GalleryEditor
 * (Req 11.8), and tech-stack multi-assignment (Req 11.9). Field
 * validation (zod) blocks submission on missing required fields (Req 11.10).
 */
export default function PortfolioFormDialog({
  open,
  setOpen,
  data,
  isPending,
  dataCategory,
  dataTech,
  onSubmit,
}: PortfolioFormDialogProps) {
  const isEdit = !!data;
  const formId = "portfolioForm";

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(CreatePortfolioSchema),
    defaultValues: EMPTY_DEFAULTS,
    mode: "onSubmit",
  });

  // Seed the form when opening: hydrate from `data` in edit mode, reset to
  // empty defaults in create mode. (Req 11.2, 11.3)
  useEffect(() => {
    if (!open) return;
    if (data) {
      form.reset({
        title: data.title ?? "",
        slug: data.slug ?? "",
        shortDesc: data.shortDesc ?? "",
        description: data.description ?? "",
        categoryId: data.categoryId ?? "",
        liveUrl: data.liveUrl ?? "",
        repoUrl: data.repoUrl ?? "",
        problem: (data as IPPortfolio & { problem?: string }).problem ?? "",
        solution: (data as IPPortfolio & { solution?: string }).solution ?? "",
        results: (data as IPPortfolio & { results?: string }).results ?? "",
        featured: data.featured ?? false,
        isPublished: data.isPublished ?? true,
        images:
          data.images?.map((img, index) => ({
            url: img.url,
            alt: img.alt ?? null,
            position: img.position ?? index,
          })) ?? [],
        techIds:
          data.techStacks?.map((t: any) => t.tech?.id ?? t.techId) ?? [],
      });
    } else {
      form.reset(EMPTY_DEFAULTS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data]);

  const categoryOptions =
    dataCategory?.map((row) => ({ label: row.name, value: row.id })) ?? [];
  const techOptions =
    dataTech?.map((row) => ({ label: row.name, value: row.id })) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEdit ? "Edit Portfolio" : "Add Portfolio"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update your portfolio case study."
              : "Create a rich portfolio case study."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <Form {...form}>
            <form
              id={formId}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4" />
                      Basic Information
                    </h3>

                    <div className="grid gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                              Title
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder="Project Title"
                                  className="pl-9 bg-background/50"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                              Slug
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder="project-url-slug"
                                  className="pl-9 bg-background/50 font-mono text-sm"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shortDesc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                              Short Description
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AlignLeft className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  value={field.value ?? ""}
                                  placeholder="Brief summary of the project"
                                  className="pl-9 bg-background/50"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                              Full Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Detailed overview..."
                                className="min-h-[140px] resize-none bg-background/50 leading-relaxed p-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Case-study fields (Req 11.7) */}
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4" />
                      Case Study
                    </h3>

                    <FormField
                      control={form.control}
                      name="problem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Problem
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              placeholder="What problem did this project solve?"
                              className="min-h-[120px] resize-none bg-background/50 leading-relaxed p-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="solution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Solution
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              placeholder="How did you solve it?"
                              className="min-h-[120px] resize-none bg-background/50 leading-relaxed p-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="results"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                            Results
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value ?? ""}
                              placeholder="What were the outcomes?"
                              className="min-h-[120px] resize-none bg-background/50 leading-relaxed p-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gallery editor (Req 11.8) */}
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm">
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <GalleryEditor
                              value={(field.value ?? []) as GalleryEditorImage[]}
                              onChange={(images) => field.onChange(images)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Right Column: Meta & Settings */}
                <div className="space-y-6">
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                      <Layers className="w-4 h-4" />
                      Categorization
                    </h3>

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Category
                          </FormLabel>
                          <FormControl>
                            <SearchableSelect
                              label="Select Category"
                              options={categoryOptions}
                              placeholder="Choose a category..."
                              value={field.value ?? ""}
                              onChange={(val) => field.onChange(val)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tech-stack multi-assignment (Req 11.9) */}
                    <FormField
                      control={form.control}
                      name="techIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                            <Cpu className="w-3 h-3" /> Tech Stack
                          </FormLabel>
                          <FormControl>
                            <SearchableMultiSelect
                              label="Tech Stack"
                              options={techOptions}
                              placeholder="Select tech..."
                              value={field.value ?? []}
                              onChange={(vals) => field.onChange(vals)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                      <LinkIcon className="w-4 h-4" />
                      Links
                    </h3>

                    <FormField
                      control={form.control}
                      name="liveUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Live URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="https://..."
                              className="bg-background/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="repoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Repository URL
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="https://github.com/..."
                              className="bg-background/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      Visibility
                    </h3>

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium flex items-center gap-2">
                              <Star
                                className="w-4 h-4 text-amber-500"
                                fill={field.value ? "currentColor" : "none"}
                              />
                              Featured
                            </FormLabel>
                            <DialogDescription className="text-xs">
                              Highlight on homepage
                            </DialogDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium flex items-center gap-2">
                              <Globe
                                className={`w-4 h-4 ${
                                  field.value
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                              Published
                            </FormLabel>
                            <DialogDescription className="text-xs">
                              Visible to the public
                            </DialogDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 shrink-0 gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer gap-2 border-transparent hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </DialogClose>
          <Button
            form={formId}
            type="submit"
            variant="default"
            disabled={isPending}
            className="cursor-pointer gap-2 min-w-[120px]"
          >
            {isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Project" : "Save Project"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X, Type, Link, Image as ImageIcon, FileText } from "lucide-react";

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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/shared/RichTextEditor";
import SearchableSelect from "@/components/shared/searchable-select";
import SearchableMultiSelect from "@/components/shared/searchable-mutiple-select";
import {
  CreateBlogPostSchema,
  type CreateBlogPostDTO,
  type AdminBlogPost,
} from "@/core/types/blogPost.type";

interface BlogFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** When provided the dialog runs in edit mode and prefills the form. */
  data?: AdminBlogPost | null;
  categoryOptions: { label: string; value: string }[];
  tagOptions: { label: string; value: string }[];
  isSubmitting: boolean;
  onSubmit: (payload: CreateBlogPostDTO) => void;
}

const emptyValues: CreateBlogPostDTO = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  isPublished: false,
  categoryId: null,
  tagIds: [],
};

/** Normalize the admin tag-join rows into a flat array of tag ids. */
const extractTagIds = (data: AdminBlogPost): string[] => {
  if (!data.tags) return [];
  return data.tags.map((t) =>
    "tag" in t ? (t as { tag: { id: string } }).tag.id : (t as { id: string }).id,
  );
};

/**
 * Shared create/edit dialog for the Admin_Blog_Manager. Validates with RHF +
 * zod (CreateBlogPostSchema) so submission is blocked on missing required
 * fields (Req 10.7), and supports assigning a single category plus one or more
 * tags (Req 10.6). The parent owns the mutation and closes the dialog on
 * success, preserving the view on error (Req 10.8).
 */
export default function BlogFormModal({
  open,
  setOpen,
  data,
  categoryOptions,
  tagOptions,
  isSubmitting,
  onSubmit,
}: BlogFormModalProps) {
  const isEdit = !!data;
  const formId = "blogPostFormModal";

  const form = useForm<CreateBlogPostDTO>({
    resolver: zodResolver(CreateBlogPostSchema),
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    if (data) {
      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? "",
        content: data.content ?? "",
        coverImage: data.coverImage ?? "",
        isPublished: data.isPublished,
        categoryId: data.categoryId ?? data.category?.id ?? null,
        tagIds: extractTagIds(data),
      });
    } else {
      form.reset(emptyValues);
    }
  }, [data, open, form]);

  const handleSubmit = (payload: CreateBlogPostDTO) => {
    onSubmit({
      ...payload,
      categoryId: payload.categoryId || null,
      tagIds: payload.tagIds ?? [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{isEdit ? "Edit Post" : "Add Post"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update blog post details." : "Create a new blog post."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4 overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="e.g. My first post"
                          className="pl-9"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!isEdit) {
                              const slug = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)+/g, "");
                              form.setValue("slug", slug);
                            }
                          }}
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
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="my-first-post"
                          className="pl-9 font-mono text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableSelect
                        label="Category"
                        placeholder="Select a category"
                        options={categoryOptions}
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableMultiSelect
                        label="Tags"
                        placeholder="Select tags"
                        options={tagOptions}
                        value={field.value ?? []}
                        onChange={(values) => field.onChange(values)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Short summary..."
                        className="pl-9"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Write your post..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="https://..."
                          className="pl-9"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3 h-full">
                    <div className="space-y-0.5">
                      <FormLabel>Published</FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Show this post publicly
                      </div>
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
          </form>
        </Form>

        <DialogFooter className="border-t pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button" className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
          </DialogClose>
          <Button
            form={formId}
            type="submit"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Post" : "Save Post"}
            {!isSubmitting && <Save className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

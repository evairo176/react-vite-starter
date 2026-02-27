import useEditModal from "./useEditModal";
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
import { useFieldArray } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import SearchableSelect from "@/components/shared/searchable-select";
import type { IPCategory } from "@/core/types/category.type";
import {
  Type,
  Link,
  FileText,
  AlignLeft,
  Layers,
  Tags,
  Cpu,
  Star,
  Globe,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { TagsInput } from "@/components/shared/tag-input";

type EditModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any | null;
  refetch: () => void;
};

export default function EditModal({
  open,
  setOpen,
  data,
  refetch,
}: EditModalProps) {
  const { form, handleSubmit, isPendingMutateSaveToDatabase, dataCategory } =
    useEditModal({
      close: () => {
        setOpen(false);
        refetch();
      },
      data,
    });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const formId = "editModal";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground/90">
            Edit Portfolio
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your portfolio information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <Form {...form}>
            <form
              id={formId}
              onSubmit={form.handleSubmit(handleSubmit)}
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
                                <Link className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                placeholder="Detailed overview of functionality, challenges, and solutions..."
                                className="min-h-[200px] resize-none bg-background/50 leading-relaxed p-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Project Gallery
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({ url: "", alt: "", position: fields.length })
                        }
                        className="h-8 gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Image
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-start p-4 rounded-lg border bg-background/30 animate-in fade-in slide-in-from-top-2"
                        >
                          <FormField
                            control={form.control}
                            name={`images.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs text-muted-foreground">
                                  Image URL
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Link className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      placeholder="https://..."
                                      className="pl-9 h-9 text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`images.${index}.alt`}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs text-muted-foreground">
                                  Alt Text
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Type className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                      {...field}
                                      value={field.value || ""}
                                      placeholder="Image description"
                                      className="pl-9 h-9 text-sm"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="pt-7">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {fields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground/50 text-sm">
                          No images added yet. Click "Add Image" to start.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Meta & Settings */}
                <div className="space-y-6">
                  {/* Categorization Card */}
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
                              options={
                                (dataCategory?.length > 0 &&
                                  dataCategory?.map((row: IPCategory) => {
                                    return {
                                      label: row.name,
                                      value: row.id,
                                    };
                                  })) ||
                                []
                              }
                              placeholder="Choose a category..."
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                              }}
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
                          <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                            <Tags className="w-3 h-3" /> Tags
                          </FormLabel>
                          <FormControl>
                            <TagsInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Type tag & press Enter"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="techIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                            <Cpu className="w-3 h-3" /> Tech Stack
                          </FormLabel>
                          <FormControl>
                            <TagsInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Type tech & press Enter"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Visibility Card */}
                  <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4" />
                      Visibility
                    </h3>

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50 hover:bg-accent/5 transition-colors">
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50 hover:bg-accent/5 transition-colors">
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
            disabled={isPendingMutateSaveToDatabase}
            className="cursor-pointer gap-2 min-w-[120px]"
          >
            {isPendingMutateSaveToDatabase ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

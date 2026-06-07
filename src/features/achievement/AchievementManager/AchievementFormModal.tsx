import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateAchievementSchema,
  type Achievement,
  type CreateAchievementDTO,
} from "@/core/types/achievement.type";

interface AchievementFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** When provided the dialog runs in edit mode and prefills the form. */
  data?: Achievement | null;
  isSubmitting: boolean;
  onSubmit: (payload: CreateAchievementDTO) => void;
}

const emptyValues: CreateAchievementDTO = {
  title: "",
  issuer: "",
  description: "",
  url: "",
  icon: "",
  category: "award",
  date: "",
  position: 0,
  isPublished: true,
};

/** Normalize an ISO date string to the `yyyy-mm-dd` value an input expects. */
const toDateInput = (value?: string | null) => {
  if (!value) return "";
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

const categoryOptions = [
  { label: "Award", value: "award" },
  { label: "Certification", value: "certification" },
  { label: "Milestone", value: "milestone" },
];

/**
 * Shared create/edit dialog for the Admin_Achievement_Manager. Validates with
 * RHF + zod (CreateAchievementSchema) so submission is blocked on missing
 * required fields. The parent owns the mutation and closes the dialog on
 * success, preserving the view on error.
 */
export default function AchievementFormModal({
  open,
  setOpen,
  data,
  isSubmitting,
  onSubmit,
}: AchievementFormModalProps) {
  const isEdit = !!data;
  const formId = "achievementFormModal";

  const form = useForm<CreateAchievementDTO>({
    resolver: zodResolver(CreateAchievementSchema),
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    if (data) {
      form.reset({
        title: data.title,
        issuer: data.issuer ?? "",
        description: data.description ?? "",
        url: data.url ?? "",
        icon: data.icon ?? "",
        category: data.category ?? "award",
        date: toDateInput(data.date),
        position: data.position ?? 0,
        isPublished: data.isPublished,
      });
    } else {
      form.reset(emptyValues);
    }
  }, [data, open, form]);

  const handleSubmit = (payload: CreateAchievementDTO) => {
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>
            {isEdit ? "Edit Achievement" : "Add Achievement"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update achievement details."
              : "Create a new achievement."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4 overflow-y-auto pr-1"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. AWS Certified Developer" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="e.g. Amazon Web Services"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full" aria-label="Category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        value={field.value ?? ""}
                        aria-label="Date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="0"
                        aria-label="Position"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credential URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="https://..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Optional icon name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Short description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Show this achievement publicly
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      aria-label="Published"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Achievement"
                : "Save Achievement"}
            {!isSubmitting && <Save className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

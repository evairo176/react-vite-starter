import useAddModal from "./useAddModal";
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
import SearchableSelect from "@/shared/searchable-select";
import { useEffect, useState } from "react";
import SearchableMultiSelect from "@/shared/searchable-mutiple-select";
import type { IPCategory } from "@/core/types/category.type";
import type { IPTag } from "@/core/types/tag.type";
import type { IPTechStack } from "@/core/types/textStack.type";

type AddModalModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any | null;
  refetch: () => void;
};

export default function AddModal({
  open,
  setOpen,
  data,
  refetch,
}: AddModalModalProps) {
  const {
    form,
    handleSubmit,

    isPendingMutateSaveToDatabase,
    // isSuccessMutateSaveToDatabase

    dataCategory,
    dataTag,
    dataTech,
  } = useAddModal({
    close: () => {
      setOpen(false);
      refetch();
    },
  });

  const formId = "addModal";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={"w-full overflow-y-scroll max-h-screen"}>
        <DialogHeader>
          <DialogTitle>Tambah Portfolio</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category (single select) */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SearchableSelect
                      label="Pilih Category"
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
                      placeholder="Select Category"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tags (multi select) */}
              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableMultiSelect
                        label="Tags"
                        options={
                          (dataTag?.length > 0 &&
                            dataTag?.map((row: IPTag) => {
                              return {
                                label: row.name,
                                value: row.id,
                              };
                            })) ||
                          []
                        }
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

              {/* Techs (multi select) */}
              <FormField
                control={form.control}
                name="techIds"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SearchableMultiSelect
                        label="Techs"
                        options={
                          (dataTech?.length > 0 &&
                            dataTech?.map((row: IPTechStack) => {
                              return {
                                label: row.name,
                                value: row.id,
                              };
                            })) ||
                          []
                        }
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
            </div>

            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between w-full">
                    <FormLabel>Featured</FormLabel>
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
                  <FormItem className="flex items-center justify-between w-full">
                    <FormLabel>Published</FormLabel>
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

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant={"destructive"}
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            form={formId}
            type="submit"
            variant="default"
            disabled={isPendingMutateSaveToDatabase}
            className="cursor-pointer"
          >
            {isPendingMutateSaveToDatabase ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

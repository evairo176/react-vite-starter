import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useBooking from "./useBooking";
import { useState } from "react";
import BookingCalendar from "@/components/shared/booking-calendar";
import TimeSlotPicker from "@/components/shared/time-slot-picker";
import { useSlots } from "@/hooks/useSlots";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import AssignTicket from "./AssignTicket";
import Ticket from "./Ticket";
import DashboardTicket from "./DashboardTicket";

const Booking = () => {
  const { form, handleSubmit, isPendingCreateBooking } = useBooking({});
  const [date, setDate] = useState<Date>();
  const [slot, setSlot] = useState<string>();

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
  const { data: slots = [], isLoading: isLoadingSlots } =
    useSlots(formattedDate);

  const onSubmit = (values: any) => {
    handleSubmit({
      ...values,
      date,
      startTime: slot,
      endTime: slot,
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setSlot(undefined);
    }
  };

  const handleTimeSelect = (selectedSlot: string) => {
    setSlot(selectedSlot);
  };

  const formattedDisplayDate = date ? format(date, "EEEE, dd MMMM yyyy") : "";

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* LEFT SIDE */}

        <div className="space-y-6">
          <div className="bg-background rounded-lg border p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Pilih Tanggal</h3>
            <div className="flex justify-center">
              <BookingCalendar date={date} setDate={handleDateSelect} />
            </div>
          </div>
          {/* <AssignTicket /> */}
          <Ticket />
        </div>
        <div className="space-y-6">
          {date && (
            <div className="bg-background rounded-lg border p-4 shadow-sm ">
              <h3 className="font-semibold mb-4">Pilih Jam</h3>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Memuat jadwal...
                  </span>
                </div>
              ) : (
                <TimeSlotPicker
                  slots={slots}
                  selected={slot}
                  setSelected={handleTimeSelect}
                />
              )}
            </div>
          )}

          <div>
            {date && slot && (
              <div className="space-y-6">
                {/* Selected Date & Time Info */}
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-lg">Detail Booking</h3>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CalendarDays className="h-5 w-5" />
                    <span>{formattedDisplayDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>{slot}</span>
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* NAME */}

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* TITLE */}

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul Permintaan</FormLabel>
                          <FormControl>
                            <Input placeholder="Judul" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Permintaan</FormLabel>

                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis permintaan" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectItem value="SOFTWARE">
                                Software / Aplikasi
                              </SelectItem>
                              <SelectItem value="LAPTOP">
                                Laptop / Komputer
                              </SelectItem>
                              <SelectItem value="PRINTER">Printer</SelectItem>
                              <SelectItem value="NETWORK">Jaringan</SelectItem>
                              <SelectItem value="DOXA_REVISION">
                                Revisi DOXA
                              </SelectItem>
                              <SelectItem value="OTHER">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("requestType") === "DOXA_REVISION" && (
                      <FormField
                        control={form.control}
                        name="doxaReason"
                        render={() => (
                          <FormItem>
                            <FormLabel>Alasan Revisi DOXA</FormLabel>

                            <div className="space-y-2">
                              {[
                                {
                                  label: "Customer Request",
                                  value: "CUSTOMER_REQUEST",
                                },
                                {
                                  label: "Marketing Request",
                                  value: "MARKETING_REQUEST",
                                },
                                {
                                  label: "Supplier Request",
                                  value: "SUPPLIER_REQUEST",
                                },
                                { label: "Doxa Error", value: "DOXA_ERROR" },
                                { label: "Rejection", value: "REJECTION" },
                                {
                                  label: "PO Tolerance",
                                  value: "PO_TOLERANCE",
                                },
                                { label: "Human Error", value: "HUMAN_ERROR" },
                                { label: "Other", value: "OTHER" },
                              ].map((item) => (
                                <FormField
                                  key={item.value}
                                  control={form.control}
                                  name="doxaReason"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item.value}
                                        className="flex items-center space-x-2"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item.value,
                                            )}
                                            onCheckedChange={(checked) => {
                                              const currentValues =
                                                field.value || [];
                                              return checked
                                                ? field.onChange([
                                                    ...currentValues,
                                                    item.value,
                                                  ])
                                                : field.onChange(
                                                    currentValues.filter(
                                                      (value) =>
                                                        value !== item.value,
                                                    ),
                                                  );
                                            }}
                                          />
                                        </FormControl>

                                        <FormLabel className="font-normal">
                                          {item.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {/* DESCRIPTION */}

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Deskripsi Permintaan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SUBMIT */}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPendingCreateBooking}
                    >
                      {isPendingCreateBooking ? "Menyimpan..." : "Buat Booking"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
      <DashboardTicket />
    </div>
  );
};

export default Booking;

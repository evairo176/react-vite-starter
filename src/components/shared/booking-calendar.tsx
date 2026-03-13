import { Calendar } from "@/components/ui/calendar";

type Props = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
};

export default function BookingCalendar({ date, setDate }: Props) {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border p-4 w-full"
    />
  );
}

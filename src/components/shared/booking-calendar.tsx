import { Calendar } from "@/components/ui/calendar";

type Props = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
};

export default function BookingCalendar({ date, setDate }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const holidays = [
    new Date("2026-01-01"),
    new Date("2026-03-19"),
    new Date("2026-04-03"),
    new Date("2026-05-01"),
    new Date("2026-05-14"),
    new Date("2026-05-27"),
    new Date("2026-06-01"),
    new Date("2026-08-17"),
    new Date("2026-12-25"),
  ];

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={[
        { before: today }, // tanggal lampau
        { dayOfWeek: [0, 6] }, // sabtu minggu
        ...holidays, // hari libur nasional
      ]}
      className="rounded-md border p-4 w-full"
    />
  );
}

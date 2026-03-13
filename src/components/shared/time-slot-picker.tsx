import { Button } from "@/components/ui/button";

type Props = {
  slots: string[];
  selected?: string;
  setSelected: (slot: string) => void;
};

export default function TimeSlotPicker({
  slots,
  selected,
  setSelected,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot}
          variant={selected === slot ? "default" : "outline"}
          onClick={() => setSelected(slot)}
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}

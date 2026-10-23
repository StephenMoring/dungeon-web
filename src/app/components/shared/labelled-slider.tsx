import * as SliderPrimitive from "@radix-ui/react-slider";

interface LabelledSliderProps {
  /** Accessible name, set on the thumb: the element with role="slider" that screen readers announce. */
  label: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
}

/** A single-thumb slider whose name is announced; the ui Slider can't label its thumb. */
export function LabelledSlider({ label, value, onValueChange, max = 100, step = 1 }: LabelledSliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      onValueChange={onValueChange}
      max={max}
      step={step}
      className="relative flex w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative h-1.5 grow overflow-hidden rounded-full bg-input">
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-foreground" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={label}
        className="block size-4 shrink-0 rounded-full border border-foreground bg-foreground transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
      />
    </SliderPrimitive.Root>
  );
}

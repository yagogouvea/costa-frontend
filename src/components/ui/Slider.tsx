import * as SliderPrimitive from '@radix-ui/react-slider';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

export function Slider({
  min = 1,
  max = 3,
  step = 0.1,
  value,
  onValueChange
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
    >
      <SliderPrimitive.Track className="bg-gray-300 relative grow rounded-full h-[3px]">
        <SliderPrimitive.Range className="absolute bg-black rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-5 h-5 bg-white border border-black rounded-full" />
    </SliderPrimitive.Root>
  );
}

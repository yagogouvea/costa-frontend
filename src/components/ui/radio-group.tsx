// src/components/ui/radio-group.tsx
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

export const RadioGroup = RadioGroupPrimitive.Root;

export const RadioGroupItem = ({ className, ...props }: RadioGroupPrimitive.RadioGroupItemProps) => (
  <RadioGroupPrimitive.Item
    className={cn("h-4 w-4 rounded-full border border-gray-400", className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="block h-2 w-2 rounded-full bg-blue-600 mx-auto my-auto" />
  </RadioGroupPrimitive.Item>
);

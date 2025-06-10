'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatLabel?: (value: number) => string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, formatLabel, ...props }, ref) => (
  <div className="relative w-full touch-none select-none py-4">
    <div className="relative flex items-center">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-100">
          <SliderPrimitive.Range className="absolute h-full bg-blue-500" />
        </SliderPrimitive.Track>
        {props.value?.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-5 w-5 rounded-full border-2 border-blue-500 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
    {formatLabel && props.value && (
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>{formatLabel(props.value[0])}</span>
        <span>{formatLabel(props.value[1])}</span>
      </div>
    )}
  </div>
));

Slider.displayName = "Slider";

export { Slider }; 
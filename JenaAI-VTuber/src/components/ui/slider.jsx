import React from 'react';
import { cn } from '../../utils/cn.js';

const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <input
    type="range"
    className={cn(
      "w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider",
      className
    )}
    ref={ref}
    {...props}
  />
));
Slider.displayName = "Slider";

export { Slider };

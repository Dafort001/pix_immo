import { motion } from 'motion/react';
import { useHaptic, type HapticStyle } from '../hooks/useHaptic';
import { Button, type ButtonProps } from './ui/button';
import { forwardRef } from 'react';

interface HapticButtonProps extends ButtonProps {
  hapticStyle?: HapticStyle;
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticStyle = 'light', onClick, className, children, ...props }, ref) => {
    const { trigger } = useHaptic();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger(hapticStyle);
      onClick?.(e);
    };

    return (
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button 
          ref={ref} 
          onClick={handleClick} 
          className={className}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

HapticButton.displayName = 'HapticButton';
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptic() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.debug('Vibration not supported');
      }
    }
  };

  const trigger = (style: HapticStyle = 'light') => {
    switch (style) {
      case 'light':
        vibrate(10);
        break;
      case 'medium':
        vibrate(20);
        break;
      case 'heavy':
        vibrate(40);
        break;
      case 'success':
        vibrate([10, 50, 10]);
        break;
      case 'warning':
        vibrate([20, 100, 20]);
        break;
      case 'error':
        vibrate([40, 100, 40, 100, 40]);
        break;
    }
  };

  return { trigger };
}

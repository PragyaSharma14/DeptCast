export type AnimatorConfig = {
  damping: number;
  stiffness: number;
  mass: number;
};

export const getAnimatorForEmotion = (emotion: string): AnimatorConfig => {
  switch (emotion) {
    case 'Urgency':
    case 'Excitement':
      // Fast, snappy, slight bounce
      return {
        damping: 12,
        stiffness: 150,
        mass: 0.8,
      };
    case 'Trust':
    case 'Confidence':
    case 'Pride':
      // Slow, smooth, deliberate
      return {
        damping: 20,
        stiffness: 80,
        mass: 1.2,
      };
    case 'Inspired':
    case 'Hope':
    case 'Ambition':
      // Floating, elegant
      return {
        damping: 14,
        stiffness: 90,
        mass: 1,
      };
    case 'I Need This Brand':
      // High energy, very bouncy
      return {
        damping: 10,
        stiffness: 200,
        mass: 0.9,
      };
    default:
      // Default moderate spring
      return {
        damping: 14,
        stiffness: 100,
        mass: 1,
      };
  }
};

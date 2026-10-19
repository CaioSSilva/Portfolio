export const CONTEXT_MENU_OPEN_ANIMATION = {
  keyframes: [
    { opacity: 0, transform: 'scale(0)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  options: {
    duration: 120,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'both',
  },
} satisfies { keyframes: Keyframe[]; options: KeyframeAnimationOptions };

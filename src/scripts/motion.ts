// El sistema pide menos movimiento, salvo que la persona haya activado las animaciones
// desde el botón FX del header (guardado en localStorage y aplicado en <html data-motion="full">).
export const MOTION_KEY = 'mz-motion';
export const reducedMotion = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'full';

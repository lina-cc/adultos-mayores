export const FONT_SCALE = { min: 0.8, max: 1.6, step: 0.15, normal: 1 };

export function clampFontScale(scale) {
  const numeric = Number(scale);
  if (!Number.isFinite(numeric)) return FONT_SCALE.normal;
  return Math.max(FONT_SCALE.min, Math.min(numeric, FONT_SCALE.max));
}

export function nextFontScale(current, direction) {
  if (direction === 'reset') return FONT_SCALE.normal;
  const delta = direction === 'up' ? FONT_SCALE.step : -FONT_SCALE.step;
  return clampFontScale(Number(current) + delta);
}

export function parseStoredContrast(value) {
  return value === 'true' || value === true;
}

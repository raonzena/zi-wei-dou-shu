import { style } from '@vanilla-extract/css';
import { colors } from '../../styles/theme.css';

export const viewport = style({
  position: 'fixed',
  zIndex: 40,
  bottom: 'max(1rem, env(safe-area-inset-bottom))',
  right: 'max(1rem, env(safe-area-inset-right))',
  width: 'min(22rem, calc(100vw - 2rem))',
  display: 'grid',
  gap: '.5rem',
  pointerEvents: 'none',
  '@media': {
    '(max-width: 480px)': {
      left: 'max(1rem, env(safe-area-inset-left))',
      width: 'auto',
    },
  },
});
export const toast = style({
  pointerEvents: 'auto',
  border: `1px solid ${colors.line}`,
  borderLeft: `3px solid ${colors.accent}`,
  borderRadius: '.25rem',
  background: colors.paper,
  color: colors.ink,
  boxShadow: '0 5px 18px rgb(41 41 35 / 14%)',
  padding: '.5rem .75rem .5rem 1rem',
  selectors: { '&[data-limited]': { display: 'none' } },
});
export const content = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '.75rem',
});
export const title = style({
  margin: 0,
  fontFamily: 'var(--font-sans), sans-serif',
  fontSize: '.95rem',
  lineHeight: 1.6,
  fontWeight: 500,
  overflowWrap: 'anywhere',
});
export const close = style({
  minHeight: '2.75rem',
  minWidth: '2.75rem',
  flexShrink: 0,
  border: 0,
  borderRadius: '.25rem',
  background: 'transparent',
  color: colors.accent,
  font: 'inherit',
  fontSize: '.875rem',
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: colors.tint },
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 2,
    },
  },
});

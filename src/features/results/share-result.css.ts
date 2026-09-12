import { style } from '@vanilla-extract/css';
import { colors } from '../../styles/theme.css';

export const root = style({ minWidth: 0 });
export const status = style({
  fontSize: '.875rem',
  color: colors.muted,
  margin: '.5rem 0',
  selectors: { '&:empty': { margin: 0 } },
});
export const manual = style({
  display: 'grid',
  gap: '.5rem',
  fontSize: '.875rem',
});
export const input = style({
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '.75rem',
  border: `1px solid ${colors.line}`,
  borderRadius: '.25rem',
  background: colors.paper,
  color: colors.ink,
  font: 'inherit',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 3,
    },
  },
});

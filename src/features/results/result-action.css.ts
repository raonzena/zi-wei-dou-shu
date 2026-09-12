import { style } from '@vanilla-extract/css';
import { colors } from '../../styles/theme.css';

export const button = style({
  width: '100%',
  height: '3.25rem',
  boxSizing: 'border-box',
  lineHeight: 1.5,
  padding: '.75rem 1rem',
  border: `1px solid ${colors.line}`,
  borderRadius: '.25rem',
  background: colors.paper,
  color: colors.ink,
  font: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:hover': { background: colors.tint },
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 3,
    },
    '&:disabled': { opacity: 0.6, cursor: 'wait' },
  },
});

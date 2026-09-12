import { style } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';
export const brand = style({
  display: 'flex',
  width: 'fit-content',
  textDecoration: 'none',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 4,
    },
  },
  gap: '1rem',
  alignItems: 'center',
  margin: '0 0 4rem',
  color: colors.accent,
  fontFamily: serif,
  fontWeight: 700,
  fontSize: '1.375rem',
  '@media': {
    '(max-width: 767px)': { fontSize: '1rem', marginBottom: '2.5rem' },
  },
});
export const seal = style({
  display: 'inline-block',
  color: colors.accent,
  fontFamily: serif,
  fontSize: '2.25rem',
  fontWeight: 700,
  lineHeight: 1.6,
});

export const logo = style({
  width: '2.5rem',
  height: '2.5rem',
  flexShrink: 0,
  '@media': {
    '(max-width: 767px)': { width: '2rem', height: '2rem' },
  },
});

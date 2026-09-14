import { style } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';

export const main = style({
  maxWidth: '44rem',
  margin: '0 auto',
  padding: '1.5rem 1.25rem 4rem',
  '@media': {
    '(min-width: 768px)': { padding: '2rem 3rem 4rem' },
  },
});

export const title = style({
  marginTop: '1.5rem',
  fontFamily: serif,
  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
  lineHeight: 1.3,
});

export const sectionTitle = style({
  margin: '2rem 0 .75rem',
  fontSize: '1.25rem',
});

export const paragraph = style({ lineHeight: 1.8 });

export const updated = style({
  color: colors.muted,
  fontSize: '.875rem',
});

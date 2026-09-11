import { style } from '@vanilla-extract/css';
export const main = style({
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '1.5rem 1.25rem 4rem',
  '@media': {
    '(min-width: 768px)': { padding: '2rem 3rem 4rem' },
    '(min-width: 1200px)': { padding: '2rem 6rem 4rem' },
  },
});

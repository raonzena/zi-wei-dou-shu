import { style } from '@vanilla-extract/css';

export const main = style({
  maxWidth: '42rem',
  margin: '0 auto',
  padding: '3rem 1.1rem 4rem',
  '@media': { '(min-width: 768px)': { padding: '4.5rem 2rem' } },
});

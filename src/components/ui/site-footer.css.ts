import { style } from '@vanilla-extract/css';
import { colors } from '../../styles/theme.css';

export const footer = style({
  maxWidth: '80rem',
  margin: '0 auto',
  padding: '0 1.25rem 2rem',
  color: colors.muted,
  fontSize: '.8125rem',
  textAlign: 'center',
  '@media': {
    '(min-width: 768px)': { padding: '0 3rem 2rem' },
    '(min-width: 1200px)': { padding: '0 6rem 2rem' },
  },
  selectors: {
    'body:has([data-page-state="loading"]) &': { display: 'none' },
  },
});

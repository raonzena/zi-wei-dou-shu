import { globalStyle } from '@vanilla-extract/css';
import { colors, serif } from './theme.css';

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' });
globalStyle('body', {
  margin: 0,
  fontFamily: 'var(--font-sans), sans-serif',
  lineHeight: 1.6,
  color: colors.ink,
  backgroundColor: colors.paper,
});
globalStyle('h1, h2, h3', {
  fontFamily: serif,
  fontWeight: 700,
  wordBreak: 'keep-all',
  overflowWrap: 'anywhere',
});
globalStyle('p', { wordBreak: 'keep-all', overflowWrap: 'anywhere' });
globalStyle('button, input, summary, a', {
  WebkitTapHighlightColor: 'transparent',
});
globalStyle('summary', { cursor: 'pointer', minHeight: '2.75rem' });
globalStyle('a', { color: colors.accent, textUnderlineOffset: '.2em' });
globalStyle(':focus-visible', {
  outline: `2px solid ${colors.accent}`,
  outlineOffset: 3,
});
globalStyle('::selection', { color: colors.ink, background: colors.tint });

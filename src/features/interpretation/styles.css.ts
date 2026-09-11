import { style, globalStyle } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';
export const reading = style({
  borderTop: `2px solid ${colors.accent}`,
  margin: '2rem 0',
  paddingTop: '1.25rem',
  lineHeight: 1.8,
  overflowWrap: 'anywhere',
});
export const eyebrow = style({
  color: colors.accent,
  fontSize: '.875rem',
  margin: 0,
});
export const evidence = style({ color: colors.muted, fontSize: '.875rem' });
export const scope = style({
  borderLeft: `3px solid ${colors.accent}`,
  paddingLeft: '1rem',
});
export const entry = style({
  borderTop: `1px solid ${colors.line}`,
  marginTop: '1.5rem',
  paddingTop: '.5rem',
});
export const question = style({
  background: colors.tint,
  padding: '1rem',
  margin: '1rem 0',
});
export const sources = style({
  color: colors.muted,
  fontSize: '.875rem',
  marginTop: '1.5rem',
});
globalStyle(`${reading} h2, ${reading} h3`, {
  fontFamily: serif,
  lineHeight: 1.5,
});
globalStyle(`${reading} h2`, { fontSize: '1.5rem', margin: '.5rem 0 1rem' });
globalStyle(`${question} h4, ${question} p`, { margin: 0 });
globalStyle(`${question} p`, { marginTop: '.5rem' });
globalStyle(`${sources} summary`, { cursor: 'pointer' });

export const retry = style({
  font: 'inherit',
  padding: '.7rem 1rem',
  border: `1px solid ${colors.accent}`,
  background: colors.paper,
  color: colors.accent,
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${colors.accent}`,
      outlineOffset: 3,
    },
  },
});
export const sectionSummary = style({
  fontFamily: serif,
  fontSize: '1.125rem',
  cursor: 'pointer',
  padding: '.75rem 0',
});
export const tableScroll = style({
  overflowX: 'auto',
  selectors: { '&:focus-visible': { outline: `2px solid ${colors.accent}` } },
});
export const evidenceTable = style({
  width: '100%',
  minWidth: '32rem',
  borderCollapse: 'collapse',
  fontSize: '.875rem',
  textAlign: 'left',
});
globalStyle(`${evidenceTable} th, ${evidenceTable} td`, {
  padding: '.5rem',
  borderBottom: `1px solid ${colors.line}`,
  verticalAlign: 'top',
});

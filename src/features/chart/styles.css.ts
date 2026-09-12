import { style } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';
export const result = style({ maxWidth: '44rem', margin: '0 auto' });
export const title = style({
  fontFamily: serif,
  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
  letterSpacing: '-.04em',
  lineHeight: 1.3,
  margin: '0 0 1rem',
});
export const help = style({
  fontSize: '.875rem',
  color: colors.muted,
  lineHeight: 1.7,
});
export const tabs = style({
  display: 'flex',
  border: `1px solid ${colors.line}`,
  marginTop: '1.75rem',
});
export const tab = style({
  flex: 1,
  font: 'inherit',
  fontWeight: 700,
  padding: '.85rem .5rem',
  minHeight: '3rem',
  border: 0,
  borderBottom: '3px solid transparent',
  color: colors.muted,
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&[data-active]': {
      color: colors.paper,
      background: colors.accent,
      borderBottomColor: colors.accent,
    },
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 3,
    },
  },
});
export const chart = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gridTemplateRows: 'repeat(4, minmax(8.25rem, auto))',
  gap: '1px',
  border: `1px solid ${colors.line}`,
  borderRadius: 0,
  background: colors.line,
  margin: '1.5rem 0',
  overflow: 'hidden',
});
export const palace = style({
  minWidth: 0,
  padding: '1rem .375rem',
  background: colors.paper,
  position: 'relative',
  selectors: {
    '&[data-selected="true"]': {
      background: colors.tint,
      boxShadow: `inset 0 0 0 2px ${colors.accent}`,
    },
  },
});
export const palaceContent = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  height: '100%',
  minHeight: '5.7rem',
  font: 'inherit',
  fontSize: '.875rem',
  border: 0,
  padding: '.15rem',
  background: 'transparent',
  color: colors.ink,
  textAlign: 'left',
});
export const palaceSelect = style([
  palaceContent,
  {
    cursor: 'pointer',
    selectors: {
      '&:focus-visible': {
        outline: `2px solid ${colors.accent}`,
        outlineOffset: 0,
      },
    },
  },
]);
export const palaceTitle = style({
  fontFamily: serif,
  fontSize: '1.125rem',
  '@media': { '(max-width: 480px)': { fontSize: '.875rem' } },
  margin: 0,
  color: colors.ink,
});
export const stars = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: '.35rem',
  fontSize: '.875rem',
  color: colors.ink,
  marginTop: '.5rem',
  overflowWrap: 'anywhere',
});
export const bodyLabel = style({
  display: 'block',
  color: colors.accent,
  fontSize: '.75rem',
  marginTop: '.3rem',
});
export const branch = style({
  fontSize: '.75rem',
  color: colors.muted,
  marginTop: 'auto',
  paddingTop: '.35rem',
});
export const center = style({
  gridRow: '2 / 4',
  gridColumn: '2 / 4',
  background: colors.tint,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '.5rem',
  color: colors.accent,
  padding: '.5rem',
});
export const centerHint = style({
  fontSize: '.875rem',
  textAlign: 'center',
  whiteSpace: 'pre-line',
});
export const detail = style({
  borderTop: `2px solid ${colors.accent}`,
  padding: '.5rem 0 1rem',
  marginTop: '1rem',
});
export const starList = style({ listStyle: 'none', padding: 0, margin: 0 });
export const starRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '.8rem',
  minHeight: '3rem',
  padding: '.4rem 0',
  borderBottom: `1px solid ${colors.line}`,
});
export const mutagen = style({
  color: colors.accent,
  fontSize: '.875rem',
  flexShrink: 0,
});
export const reading = style({ fontSize: '.95rem', marginBottom: '2rem' });
export const centerTitle = style({
  fontFamily: serif,
  fontSize: 'clamp(1.25rem, 4vw, 2rem)',
  color: colors.accent,
});

export const starExplanation = style({ width: '100%', padding: '.5rem 0' });
export const disclosureSummary = style({
  cursor: 'pointer',
  padding: '.5rem 0',
  selectors: {
    '&:focus-visible': {
      outline: `2px solid ${colors.accent}`,
      outlineOffset: 3,
    },
  },
});
export const resultActions = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  alignItems: 'start',
  gap: '.75rem',
  '@media': {
    '(max-width: 640px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  borderTop: `1px solid ${colors.line}`,
  marginTop: '1rem',
  paddingTop: '1rem',
});

export const readingGuide = style([
  reading,
  {
    borderTop: `1px solid ${colors.line}`,
    marginTop: '2rem',
    paddingTop: '1.5rem',
  },
]);
export const readingGuideTitle = style({ marginTop: 0 });

export const sourceMeta = style({
  display: 'grid',
  justifyItems: 'start',
  gap: '.25rem',
  marginTop: '.5rem',
  fontSize: '10px',
  lineHeight: 1.5,
  color: colors.muted,
  overflowWrap: 'anywhere',
});
export const sourceMetaLine = style({ margin: 0 });

export const hanja = style({
  display: 'inline-block',
  fontSize: '.75em',
  fontWeight: 400,
});

import { style } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';

export const eyebrow = style({
  color: colors.muted,
  fontWeight: 700,
  fontSize: '.875rem',

  margin: '0 0 1.25rem',
});
export const title = style({
  margin: '0 0 1rem',
  fontSize: 'clamp(2.25rem, 4vw, 3rem)',
  fontFamily: serif,
  lineHeight: 1.6,
  letterSpacing: '-.025em',
  fontWeight: 700,
});
export const intro = style({ color: colors.muted, marginBottom: '2.5rem' });
export const help = style({
  color: colors.muted,
  fontSize: '.875rem',
  margin: '.8rem 0 0',
});
export const form = style({ display: 'grid', gap: '1.75rem' });
export const section = style({
  border: 0,

  margin: 0,
  padding: 0,
  minWidth: 0,
});
export const legend = style({
  fontFamily: serif,
  fontSize: '1.25rem',
  fontWeight: 700,
  padding: '0 .75rem 0 0',
});
export const choices = style({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  marginBottom: '.5rem',
});
export const choice = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '.5rem',
  minHeight: '2.75rem',
  cursor: 'pointer',
  accentColor: colors.accent,
});
export const row = style({
  display: 'flex',
  gap: '.75rem',
  marginTop: '.75rem',
});
export const field = style({
  '@media': {
    '(max-width: 360px)': { selectors: { '&:has(#year)': { flexGrow: 1.5 } } },
  },
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '.35rem',
  fontSize: '.875rem',
});
export const error = style({
  color: colors.accent,
  fontSize: '.875rem',
  margin: '.35rem 0 0',
});
export const errorSummary = style({
  background: colors.tint,
  borderLeft: `3px solid ${colors.accent}`,
  padding: '1rem',
  color: colors.accent,
});
export const notice = style({
  background: colors.tint,
  padding: '1.25rem',
  borderRadius: '.25rem',
  fontSize: '.875rem',
  color: colors.muted,
});
export const button = style({
  border: 0,
  borderRadius: '.25rem',
  background: colors.accent,
  color: colors.paper,
  padding: '1rem 1.2rem',
  width: '100%',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  selectors: {
    '&:hover': { background: colors.ink },
    '&:focus-visible': {
      outline: `3px solid ${colors.accent}`,
      outlineOffset: 3,
    },
    '&:disabled': { opacity: 0.6, cursor: 'wait' },
  },
});
export const loading = style({
  alignItems: 'center',
  gap: '1.5rem',
  minHeight: '65vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
});
export const inputGroup = style({
  minHeight: '3.25rem',
  display: 'flex',
  minWidth: 0,
  border: `1px solid ${colors.line}`,
  borderRadius: '.25rem',
  background: colors.paper,
  selectors: {
    '&:focus-within': {
      outline: `3px solid ${colors.accent}`,
      outlineOffset: 2,
    },
  },
});
export const comboInput = style({
  width: '100%',
  minWidth: 0,
  border: 0,
  outline: 0,
  background: 'transparent',
  padding: '.75rem .5rem',
  '@media': { '(max-width: 360px)': { paddingRight: 0 } },
  font: 'inherit',
  fontSize: '1rem',
  color: colors.ink,
});
export const comboTrigger = style({
  display: 'grid',
  placeItems: 'center',
  width: '1.5rem',
  flexShrink: 0,
  border: 0,
  background: 'transparent',
  color: colors.accent,
  cursor: 'pointer',
  borderRadius: '.25rem',
  selectors: { '&:focus-visible': { outline: `2px solid ${colors.accent}` } },
});
export const positioner = style({ zIndex: 20, outline: 0 });
export const popup = style({
  width: 'var(--anchor-width)',
  minWidth: '6rem',
  background: colors.paper,
  border: `1px solid ${colors.line}`,
  borderRadius: '.25rem',
  boxShadow: `0 5px 18px rgb(41 41 35 / 14%)`,
  overflow: 'hidden',
});
export const optionList = style({
  maxHeight: 'min(15rem, var(--available-height))',
  overflowY: 'auto',
  padding: '.25rem',
  margin: 0,
  overscrollBehavior: 'contain',
});
export const option = style({
  padding: '.6rem .75rem',
  minHeight: '2.75rem',
  borderRadius: '.25rem',
  cursor: 'pointer',
  selectors: {
    '&[data-highlighted]': { background: colors.tint, color: colors.ink },
  },
});
export const empty = style({
  padding: '.7rem',
  fontSize: '.875rem',
  selectors: { '&:empty': { display: 'none' } },
});

export const inputLayout = style({
  display: 'grid',
  gap: '2rem',
  '@media': {
    '(min-width: 1000px)': {
      gridTemplateColumns: 'minmax(0, 432fr) minmax(0, 560fr)',
      gap: 'clamp(3rem, 7.5vw, 6rem)',
    },
  },
});
export const introSeal = style({
  '@media': { '(max-width: 999px)': { display: 'none' } },
});

export const chevron = style({
  width: '.6rem',
  height: '.35rem',
  flexShrink: 0,
});

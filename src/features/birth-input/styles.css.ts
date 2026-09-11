import { style } from '@vanilla-extract/css';

export const eyebrow = style({
  color: '#665b7b',
  fontWeight: 650,
  fontSize: '.8rem',
  letterSpacing: '.12em',
  margin: '0 0 1.25rem',
});
export const title = style({
  margin: '0 0 1rem',
  fontSize: 'clamp(1.8rem, 5vw, 2.7rem)',
  lineHeight: 1.3,
  letterSpacing: '-.04em',
  fontWeight: 650,
});
export const intro = style({ color: '#615b66', marginBottom: '2.5rem' });
export const help = style({
  color: '#66606c',
  fontSize: '.85rem',
  margin: '.8rem 0 0',
});
export const form = style({ display: 'grid', gap: '1.6rem' });
export const section = style({
  border: 0,
  borderTop: '1px solid #e1dce5',
  margin: 0,
  padding: '1.4rem 0 0',
  minWidth: 0,
});
export const legend = style({
  fontSize: '1rem',
  fontWeight: 650,
  padding: '0 .75rem 0 0',
});
export const choices = style({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  marginBottom: '1rem',
});
export const choice = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '.5rem',
  minHeight: '2.75rem',
  cursor: 'pointer',
  accentColor: '#645277',
});
export const row = style({ display: 'flex', gap: '.7rem' });
export const field = style({
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '.35rem',
  fontSize: '.85rem',
});
export const error = style({
  color: '#9a242e',
  fontSize: '.85rem',
  margin: '.35rem 0 0',
});
export const errorSummary = style({
  background: '#fff0ef',
  borderLeft: '3px solid #9a242e',
  padding: '1rem',
  color: '#78252b',
});
export const notice = style({
  background: '#eeeaf1',
  padding: '1.1rem',
  borderRadius: '.65rem',
  fontSize: '.8rem',
  color: '#554c60',
});
export const button = style({
  border: 0,
  borderRadius: '.65rem',
  background: '#554265',
  color: '#fff',
  padding: '1rem 1.2rem',
  width: '100%',
  font: 'inherit',
  fontWeight: 650,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  selectors: {
    '&:hover': { background: '#40314e' },
    '&:focus-visible': { outline: '3px solid #a493ba', outlineOffset: 3 },
    '&:disabled': { opacity: 0.6, cursor: 'wait' },
  },
});
export const loading = style({
  minHeight: '65vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
});
export const chart = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gridTemplateRows: 'repeat(4, minmax(6.5rem, auto))',
  gap: '1px',
  border: '1px solid #cec5d6',
  borderRadius: '.7rem',
  overflow: 'hidden',
  background: '#cec5d6',
  margin: '1.75rem 0',
});
export const palace = style({
  padding: '.75rem .45rem',
  background: '#fff',
  minWidth: 0,
});
export const palaceTitle = style({
  fontSize: '.82rem',
  margin: 0,
  color: '#4b365b',
  overflowWrap: 'anywhere',
});
export const stars = style({
  margin: '.7rem 0 0',
  fontSize: '.78rem',
  overflowWrap: 'anywhere',
  color: '#554e59',
});
export const chartCenter = style({
  gridRow: '2 / 4',
  gridColumn: '2 / 4',
  background: '#f0ebf4',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '.6rem',
  color: '#554265',
});
export const reading = style({ marginBottom: '2rem', fontSize: '.95rem' });

export const inputGroup = style({
  display: 'flex',
  minWidth: 0,
  border: '1px solid #b8b1c0',
  borderRadius: '.55rem',
  background: '#fff',
  selectors: {
    '&:focus-within': { outline: '3px solid #a493ba', outlineOffset: 2 },
  },
});
export const comboInput = style({
  width: '100%',
  minWidth: 0,
  border: 0,
  outline: 0,
  background: 'transparent',
  padding: '.85rem .7rem',
  font: 'inherit',
  fontSize: '1rem',
  color: '#292331',
});
export const comboTrigger = style({
  width: '2rem',
  flexShrink: 0,
  border: 0,
  background: 'transparent',
  color: '#554265',
  cursor: 'pointer',
  borderRadius: '.4rem',
  selectors: { '&:focus-visible': { outline: '2px solid #554265' } },
});
export const positioner = style({ zIndex: 20, outline: 0 });
export const popup = style({
  width: 'var(--anchor-width)',
  minWidth: '6rem',
  background: '#fff',
  border: '1px solid #b8b1c0',
  borderRadius: '.5rem',
  boxShadow: '0 5px 18px #29233122',
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
  borderRadius: '.3rem',
  cursor: 'pointer',
  selectors: {
    '&[data-highlighted]': { background: '#eee6f5', color: '#40314e' },
  },
});
export const empty = style({
  padding: '.7rem',
  fontSize: '.8rem',
  selectors: { '&:empty': { display: 'none' } },
});

import { style } from '@vanilla-extract/css';
export const title = style({
  fontSize: 'clamp(1.8rem, 5vw, 2.7rem)',
  letterSpacing: '-.04em',
  lineHeight: 1.3,
  margin: '0 0 1rem',
});
export const help = style({
  fontSize: '.85rem',
  color: '#66606c',
  lineHeight: 1.7,
});
export const tabs = style({
  display: 'flex',
  borderBottom: '1px solid #cec5d6',
  marginTop: '1.75rem',
});
export const tab = style({
  flex: 1,
  font: 'inherit',
  fontWeight: 650,
  padding: '.85rem .5rem',
  minHeight: '3rem',
  border: 0,
  borderBottom: '3px solid transparent',
  color: '#665b7b',
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&[data-active]': { color: '#40314e', borderBottomColor: '#645277' },
    '&:focus-visible': { outline: '2px solid #645277', outlineOffset: -3 },
  },
});
export const chart = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gridTemplateRows: 'repeat(4, minmax(7rem, auto))',
  gap: '1px',
  border: '1px solid #cec5d6',
  borderRadius: '.7rem',
  background: '#cec5d6',
  margin: '1.5rem 0',
  overflow: 'hidden',
});
export const palace = style({
  minWidth: 0,
  padding: '.65rem .3rem',
  background: '#fff',
  position: 'relative',
  selectors: {
    '&[data-selected="true"]': {
      background: '#eee6f5',
      boxShadow: 'inset 0 0 0 2px #645277',
    },
  },
});
export const palaceSelect = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  height: '100%',
  minHeight: '5.7rem',
  font: 'inherit',
  fontSize: '.85rem',
  border: 0,
  padding: '.15rem',
  background: 'transparent',
  color: '#40314e',
  textAlign: 'left',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': { outline: '2px solid #645277', outlineOffset: 0 },
  },
});
export const palaceTitle = style({
  fontSize: '.85rem',
  margin: 0,
  color: '#4b365b',
});
export const stars = style({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: '.35rem',
  fontSize: '.8rem',
  color: '#554e59',
  marginTop: '.5rem',
  overflowWrap: 'anywhere',
});
export const bodyLabel = style({
  display: 'block',
  color: '#645277',
  fontSize: '.75rem',
  marginTop: '.3rem',
});
export const branch = style({
  fontSize: '.75rem',
  color: '#66606c',
  marginTop: 'auto',
  paddingTop: '.35rem',
});
export const center = style({
  gridRow: '2 / 4',
  gridColumn: '2 / 4',
  background: '#f0ebf4',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '.5rem',
  color: '#554265',
  padding: '.5rem',
});
export const centerHint = style({
  fontSize: '.8rem',
  textAlign: 'center',
  whiteSpace: 'pre-line',
});
export const detail = style({
  borderTop: '2px solid #645277',
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
  borderBottom: '1px solid #e1dce5',
});
export const mutagen = style({
  color: '#4b365b',
  fontSize: '.85rem',
  flexShrink: 0,
});
export const reading = style({ fontSize: '.95rem', marginBottom: '2rem' });
export const back = style({
  font: 'inherit',
  color: '#40314e',
  border: '1px solid #b8b1c0',
  background: '#fff',
  borderRadius: '.65rem',
  width: '100%',
  padding: '1rem',
  marginTop: '1rem',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': { outline: '3px solid #a493ba', outlineOffset: 3 },
    '&:hover': { background: '#f0ebf4' },
  },
});

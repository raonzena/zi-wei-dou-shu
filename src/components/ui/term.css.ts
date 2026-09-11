import { style } from '@vanilla-extract/css';
export const trigger = style({
  font: 'inherit',
  color: 'inherit',
  background: 'transparent',
  border: 0,
  padding: '.15rem .1rem',
  borderBottom: '1px dotted currentColor',
  cursor: 'help',
  selectors: {
    '&:focus-visible': { outline: '2px solid #645277', outlineOffset: 3 },
    '&[aria-expanded="true"]': { background: '#eeeaf1' },
  },
});
export const positioner = style({ zIndex: 30, maxWidth: 'calc(100vw - 24px)' });
export const popup = style({
  width: '19rem',
  maxWidth: 'calc(100vw - 24px)',
  maxHeight: 'var(--available-height)',
  overflowY: 'auto',
  background: '#fff',
  color: '#292331',
  border: '1px solid #b8b1c0',
  borderRadius: '.7rem',
  padding: '1rem',
  boxShadow: '0 6px 24px #29233122',
});
export const title = style({ fontSize: '1rem', margin: '0 0 .5rem' });
export const description = style({ fontSize: '.9rem', margin: 0 });
export const actions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  marginTop: '.7rem',
  fontSize: '.8rem',
});
export const close = style({
  font: 'inherit',
  border: '1px solid #b8b1c0',
  borderRadius: '.4rem',
  background: '#fff',
  padding: '.5rem .8rem',
  minHeight: '2.75rem',
  cursor: 'pointer',
});

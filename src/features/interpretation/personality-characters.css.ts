import { style } from '@vanilla-extract/css';
import { colors, serif } from '../../styles/theme.css';

export const container = style({ margin: '1rem 0 1.5rem' });
export const portraits = style({
  display: 'flex',
  justifyContent: 'center',
  gap: 'clamp(.5rem, 2vw, 1.25rem)',
});
export const portrait = style({
  margin: 0,
  flex: '1 1 0',
  minWidth: 0,
  maxWidth: 320,
});
export const image = style({
  display: 'block',
  width: '100%',
  height: 'auto',
  aspectRatio: '1',
  borderRadius: 4,
});
export const caption = style({
  textAlign: 'center',
  fontFamily: serif,
  fontSize: '1rem',
  marginTop: '.5rem',
  color: colors.ink,
});
export const context = style({
  textAlign: 'center',
  fontSize: '.8125rem',
  color: colors.muted,
  margin: '.5rem 0 0',
  lineHeight: 1.6,
});

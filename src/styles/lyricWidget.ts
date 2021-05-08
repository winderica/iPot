import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ palette }) => ({
  line: () => ({
    backgroundImage: 'linear-gradient(to right, black, white)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextStrokeWidth: '1px',
    WebkitTextStrokeColor: palette.primary.dark,
    color: 'transparent',
    width: 'max-content',
    position: 'fixed',
    bottom: 0,
    left: '50vw',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    textAlign: 'center',
  }),
}));

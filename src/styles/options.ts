import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ palette }) => ({
  highlighted: {
    color: palette.primary.main,
  },
  alert: {
    alignItems: 'center',
  },
  alertAction: {
    paddingTop: 0,
  },
}));

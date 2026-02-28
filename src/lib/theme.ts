import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#EA580C",
      light: "#FB923C",
      dark: "#C2410C",
      contrastText: "#fff",
    },
    secondary: {
      main: "#8DB48E",
      light: "#A7C9A8",
      dark: "#6B9A6C",
    },
    error: {
      main: "#DC2626",
    },
    background: {
      default: "#FFF7ED",
      paper: "#FFFBF5",
    },
    text: {
      primary: "#3D3229",
      secondary: "#78716C",
    },
    divider: "#E8DCCF",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"SF Pro Text"',
      '"PingFang SC"',
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
        },
        sizeSmall: {
          borderRadius: 16,
          padding: "4px 12px",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
        fullWidth: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 56,
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 0,
          padding: "6px 0",
          "&.Mui-selected": {
            color: "#EA580C",
          },
        },
        label: {
          fontSize: "0.625rem",
          "&.Mui-selected": {
            fontSize: "0.625rem",
          },
        },
      },
    },
  },
});

export default theme;

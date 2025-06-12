import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Courses', path: '/courses' },
  { label: 'Instances', path: '/instances' },
  { label: 'Create Course', path: '/create-course' },
  { label: 'Create Instance', path: '/create-instance' },
];

const NavBar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2', width: '100%' }}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar sx={{ px: 2 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 'bold',
                letterSpacing: 1,
              }}
            >
              Courses API - IIT Bombay
            </Typography>

            {isMobile ? (
              <>
                <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
                  <MenuIcon />
                </IconButton>
                <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                  <Box sx={{ width: 250 }} onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    <List>
                      {navLinks.map((link) => (
                        <ListItemButton key={link.label} component={RouterLink} to={link.path}>
                          <ListItemText primary={link.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box>
                {navLinks.map((link) => (
                  <Button
                    key={link.label}
                    color="inherit"
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      mx: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBar;

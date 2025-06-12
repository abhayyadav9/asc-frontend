import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
} from "@mui/material";

// Components
import NavBar from "./components/NavBar";

// Pages
import HomePage from "./pages/HomePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage"; // You will implement
import CreateInstancePage from "./pages/CreateInstancePage";
import InstanceListPage from "./pages/InstanceListPage";
import InstanceDetailPage from "./pages/InstanceDetailPage"; // You will implement
// import NotFoundPage from './pages/NotFoundPage'; // Optional

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // IIT Bombay Blue
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const App: React.FC = () => {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
        <NavBar />

          <Container sx={{ marginTop: "2rem", paddingBottom: "2rem" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/create-course" element={<CreateCoursePage />} />
              <Route path="/instances" element={<InstanceListPage />} />
              <Route
                path="/instances/:year/:semester/:id"
                element={<InstanceDetailPage />}
              />
              <Route path="/create-instance" element={<CreateInstancePage />} />
              {/* Optional: Add fallback route */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </Container>
        </Router>
      </ThemeProvider>
    </div>
  );
};

export default App;

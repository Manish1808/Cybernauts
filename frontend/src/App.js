import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Events from "./components/Events"
import Footer from "./components/Footer";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import NavBar from "./components/NavBar";
import Members from "./components/Members"
import "./App.css";
import AdminLogin from "./components/AdminLogin";
function App() {

  const location = useLocation();
  return (
    <div className="container">
      {location.pathname !== "/" && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/members" element={<Members />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contactus" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/admin/login" element={<AdminLogin />}></Route>
      </Routes>
      <Footer />
    </div>
  );
}

function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default WrappedApp;

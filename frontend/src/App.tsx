import { useState, useEffect } from "react";
import Navbar from "./layout/PublicLayout/Navbar";
import Hero from "./components/public/home/Hero";
import AICoachTeaser from "./components/AICoachTeaser";
import RecruiterDashboard from "./components/RecruiterDashboard";
import Footer from "./layout/PublicLayout/Footer";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <AICoachTeaser />
      <RecruiterDashboard />
      <Footer />
    </div>
  );
}

export default App;
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AICoachTeaser from './components/AICoachTeaser';
import RecruiterDashboard from './components/RecruiterDashboard';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AICoachTeaser />
      <RecruiterDashboard />
      <Footer />
    </div>
  );
}

export default App;

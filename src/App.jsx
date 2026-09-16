import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AccessibilityPanel from './components/AccessibilityPanel';

import Landing from './pages/Landing';
import Empresas from './pages/Empresas';
import Trabajadores from './pages/Trabajadores';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

function App() {
  const [a11yOpen, setA11yOpen] = useState(false);

  return (
    <Router>
      <Header toggleA11y={() => setA11yOpen(!a11yOpen)} />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/trabajadores" element={<Trabajadores />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
      <AccessibilityPanel isOpen={a11yOpen} close={() => setA11yOpen(false)} />
    </Router>
  );
}

export default App;

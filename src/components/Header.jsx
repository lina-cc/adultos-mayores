import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Award, Accessibility, Menu, LogIn, LogOut, User } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Header({ toggleA11y }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role: ", error);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo" id="logo-link">
          <Award /> Experiencia<span>Senior</span>
        </Link>
        
        <nav aria-label="Navegación principal">
          <ul className={`nav-menu ${menuOpen ? 'open' : ''}`} id="nav-menu">
            <li><NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => setMenuOpen(false)}>Inicio</NavLink></li>
            
            {/* Ocultar 'Soy Empresa' si es trabajador */}
            {(!user || userRole !== 'worker') && (
              <li><NavLink to="/empresas" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Soy Empresa</NavLink></li>
            )}
            
            {/* Ocultar 'Busco Empleo' si es empresa */}
            {(!user || userRole !== 'company') && (
              <li><NavLink to="/trabajadores" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Busco Empleo</NavLink></li>
            )}
            
            <li><NavLink to="/nosotros" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Nosotros</NavLink></li>
            <li><NavLink to="/contacto" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contacto</NavLink></li>
          </ul>
        </nav>

        <div className="header-actions">
          <button 
            className="btn btn-outline-accent" 
            aria-label="Abrir panel de accesibilidad" 
            title="Opciones de accesibilidad"
            onClick={toggleA11y}
            style={{ padding: '10px 12px' }}
          >
            <Accessibility /> <span className="hide-mobile">Accesibilidad</span>
          </button>
          
          {user ? (
            <>
              <button className="btn btn-primary" onClick={() => navigate('/profile')} title="Mi Perfil" style={{ padding: '10px 12px' }}>
                <User size={20} /> <span className="hide-mobile">Mi Perfil</span>
              </button>
              <button className="btn btn-secondary" onClick={handleLogout} title="Cerrar Sesión" style={{ padding: '10px 12px' }}>
                <LogOut size={20} /> <span className="hide-mobile">Salir</span>
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/auth')} title="Iniciar Sesión" style={{ padding: '10px 12px' }}>
              <LogIn size={20} /> <span className="hide-mobile">Ingresar</span>
            </button>
          )}

          <button 
            className="menu-toggle" 
            aria-label="Abrir menú de navegación" 
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}

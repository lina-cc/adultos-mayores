import React, { useEffect, useState } from 'react';
import { X, Accessibility as A11yIcon } from 'lucide-react';

export default function AccessibilityPanel({ isOpen, close }) {
  const [fontScale, setFontScale] = useState(1.0);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load initial settings
    const storedScale = parseFloat(localStorage.getItem('senior-font-scale')) || 1.0;
    const storedContrast = localStorage.getItem('senior-high-contrast') === 'true';
    updateFontScale(storedScale);
    updateContrast(storedContrast);

    // Escape to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const updateFontScale = (scale) => {
    const newScale = Math.max(0.8, Math.min(scale, 1.6));
    setFontScale(newScale);
    document.documentElement.style.setProperty('--font-scale', newScale);
    localStorage.setItem('senior-font-scale', newScale);
  };

  const updateContrast = (active) => {
    setHighContrast(active);
    if (active) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('senior-high-contrast', active);
  };

  return (
    <>
      <button 
        className="accessibility-toggle" 
        onClick={close} 
        aria-label="Opciones de accesibilidad" 
        aria-expanded={isOpen}
      >
        <A11yIcon />
      </button>

      <div className={`accessibility-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú de accesibilidad">
        <div className="a11y-header">
          <h4>Panel de Accesibilidad</h4>
          <button onClick={close} aria-label="Cerrar panel de accesibilidad" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>
            <X />
          </button>
        </div>
        
        <div className="a11y-group">
          <span className="a11y-label">Tamaño del Texto:</span>
          <div className="a11y-buttons">
            <button className={`a11y-btn ${fontScale < 1.0 ? 'active' : ''}`} onClick={() => updateFontScale(fontScale - 0.15)} aria-label="Disminuir tamaño de letra">A-</button>
            <button className={`a11y-btn ${fontScale === 1.0 ? 'active' : ''}`} onClick={() => updateFontScale(1.0)} aria-label="Restablecer tamaño de letra">Normal</button>
            <button className={`a11y-btn ${fontScale > 1.0 ? 'active' : ''}`} onClick={() => updateFontScale(fontScale + 0.15)} aria-label="Aumentar tamaño de letra">A+</button>
          </div>
        </div>

        <div className="a11y-group">
          <span className="a11y-label">Modo de Visualización:</span>
          <div className="a11y-buttons">
            <button className={`a11y-btn ${!highContrast ? 'active' : ''}`} onClick={() => updateContrast(false)} aria-label="Visualización normal de colores">Normal</button>
            <button className={`a11y-btn ${highContrast ? 'active' : ''}`} onClick={() => updateContrast(true)} aria-label="Activar alto contraste amarillo sobre negro">Alto Contraste</button>
          </div>
        </div>
        
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px', textAlign: 'center' }}>
          Presione la tecla <kbd>Esc</kbd> para salir de este menú.
        </div>
      </div>
    </>
  );
}

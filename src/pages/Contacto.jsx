import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function Contacto() {
  const [role, setRole] = useState('worker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await addDoc(collection(db, 'contactos'), {
        role,
        name,
        email,
        subject,
        companyName: role === 'company' ? companyName : null,
        message,
        createdAt: new Date().toISOString()
      });
      alert('¡Mensaje enviado con éxito! Te responderemos a la brevedad.');
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setCompanyName('');
      setMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      alert('Hubo un error al enviar tu mensaje. Intenta nuevamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="view-section active">
      <div className="container section-padding">
        <h1 className="text-center" style={{ fontSize: 'var(--font-hero)', marginBottom: '24px' }}>Contáctanos</h1>
        <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>
          ¿Tienes dudas sobre cómo publicar una vacante o cómo inscribirte en los talleres? Escríbenos directamente y te responderemos en menos de 24 horas.
        </p>
        
        <div className="contact-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Formulario de Contacto General</h3>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <label className="form-label">¿Desde dónde nos contactas?</label>
              <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="contact-role" value="worker" checked={role === 'worker'} onChange={() => setRole('worker')} /> 
                  Soy Adulto Mayor
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="contact-role" value="company" checked={role === 'company'} onChange={() => setRole('company')} /> 
                  Soy Empresa
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Nombre Completo *</label>
                <input type="text" id="contact-name" className="form-control" placeholder="Ej: María José Pérez" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Correo Electrónico *</label>
                <input type="email" id="contact-email" className="form-control" placeholder="Ej: correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {role === 'company' && (
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="contact-company" className="form-label">Nombre de la Empresa *</label>
                <input type="text" id="contact-company" className="form-control" placeholder="Ej: Transportes del Sur" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="contact-subject" className="form-label">Asunto *</label>
              <input type="text" id="contact-subject" className="form-control" placeholder="¿De qué trata tu consulta?" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="contact-message" className="form-label">Mensaje *</label>
              <textarea id="contact-message" className="form-control" rows="4" placeholder="Escribe tu mensaje o consulta..." value={message} onChange={e => setMessage(e.target.value)} required></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar Mensaje'} <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

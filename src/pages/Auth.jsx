import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('worker'); // 'worker' or 'company'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Worker fields
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [rut, setRut] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden.');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        const baseData = {
          email: userCredential.user.email,
          role: role,
          createdAt: new Date().toISOString()
        };

        const roleData = role === 'worker' 
          ? { fullName, birthDate, gender, phone }
          : { companyName, rut, contactName, companyPhone };

        await setDoc(doc(db, 'users', userCredential.user.uid), { ...baseData, ...roleData });
      }
      navigate('/profile');
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <section className="view-section active">
      <div className="container section-padding">
        <div className="contact-card" style={{ maxWidth: isLogin ? '400px' : '550px', margin: '0 auto', transition: 'max-width 0.3s' }}>
          <h3 className="text-center">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <label className="form-label">Tipo de Cuenta</label>
                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="role" value="worker" checked={role === 'worker'} onChange={() => setRole('worker')} /> 
                    Soy Adulto Mayor
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="role" value="company" checked={role === 'company'} onChange={() => setRole('company')} /> 
                    Soy Empresa
                  </label>
                </div>
              </div>
            )}

            {!isLogin && role === 'worker' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input type="date" className="form-control" required value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Género</label>
                  <select className="form-control" required value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Selecciona...</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Teléfono (Opcional)</label>
                  <input type="tel" className="form-control" placeholder="+56 9 1234 5678" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            )}

            {!isLogin && role === 'company' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Razón Social o Nombre de Fantasía</label>
                  <input type="text" className="form-control" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">RUT Empresa</label>
                  <input type="text" className="form-control" placeholder="Ej: 76.123.456-7" required value={rut} onChange={e => setRut(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre Contacto</label>
                  <input type="text" className="form-control" required value={contactName} onChange={e => setContactName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono Contacto</label>
                  <input type="tel" className="form-control" required value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" required 
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                title="Debes incluir un dominio válido, ej: @gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isLogin ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" required value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirmar Contraseña</label>
                  <input type="password" className="form-control" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '16px' }}>
              {isLogin ? 'Ingresar' : 'Crear mi cuenta'}
            </button>
            <p className="text-center" style={{ fontSize: '0.9rem' }}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{ color: 'var(--accent)', marginLeft: '8px', fontWeight: 'bold' }}>
                {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save, User, Briefcase, FileText, Phone, Plus, Trash2 } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Worker fields
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState([]);

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [rut, setRut] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData(data);
          
          if (data.role === 'worker') {
            setFullName(data.fullName || '');
            setBirthDate(data.birthDate || '');
            setGender(data.gender || '');
            setPhone(data.phone || '');
            setProfession(data.profession || '');
            setSkills(data.skills || '');
            setExperiences(data.experiences || []);
          } else {
            setCompanyName(data.companyName || '');
            setRut(data.rut || '');
            setIndustry(data.industry || '');
            setContactName(data.contactName || '');
            setCompanyPhone(data.companyPhone || '');
          }
        }
      } catch (error) {
        console.error("Error fetching profile: ", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatePayload = profileData.role === 'worker' 
        ? { fullName, birthDate, gender, phone, profession, skills, experiences }
        : { companyName, rut, industry, contactName, companyPhone };
        
      await updateDoc(doc(db, 'users', user.uid), updatePayload);
      alert('Perfil guardado exitosamente.');
    } catch (error) {
      console.error("Error saving profile: ", error);
      alert('Hubo un error al guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { company: '', role: '', years: '', description: '' }]);
  };

  const updateExperience = (index, field, value) => {
    const newExperiences = [...experiences];
    newExperiences[index][field] = value;
    setExperiences(newExperiences);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Cargando perfil...</div>;
  }

  return (
    <section className="view-section active">
      <div className="container section-padding">
        <h1 className="text-center" style={{ fontSize: 'var(--font-xxl)', marginBottom: '32px' }}>
          Mi Perfil {profileData?.role === 'worker' ? 'Profesional (CV)' : 'Corporativo'}
        </h1>
        
        <div className="contact-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSave}>
            
            {profileData?.role === 'worker' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <User size={24} /> <h3>Datos Personales</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Nombre Completo</label>
                    <input type="text" className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha de Nacimiento</label>
                    <input type="date" className="form-control" value={birthDate} onChange={e => setBirthDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Género</label>
                    <select className="form-control" value={gender} onChange={e => setGender(e.target.value)} required>
                      <option value="">Selecciona...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Teléfono de Contacto</label>
                    <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <FileText size={24} /> <h3>Resumen Profesional</h3>
                </div>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Profesión u Oficio principal</label>
                  <input type="text" className="form-control" placeholder="Ej: Contador Auditor, Técnico Eléctrico..." value={profession} onChange={e => setProfession(e.target.value)} required />
                </div>
                
                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label className="form-label">Habilidades (Separadas por coma)</label>
                  <input type="text" className="form-control" placeholder="Ej: Excel, Liderazgo, Atención al cliente" value={skills} onChange={e => setSkills(e.target.value)} required />
                </div>

                {/* HISTORIAL LABORAL DINÁMICO */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                    <Briefcase size={24} /> <h3>Historial Laboral</h3>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addExperience}>
                    <Plus size={16} style={{ marginRight: '4px' }} /> Añadir Experiencia
                  </button>
                </div>

                {experiences.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--surface)', borderRadius: '8px', marginBottom: '32px', color: 'var(--text-muted)' }}>
                    Aún no has agregado experiencia laboral. Haz clic en "Añadir Experiencia".
                  </div>
                ) : (
                  experiences.map((exp, index) => (
                    <div key={index} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
                      <button 
                        type="button" 
                        onClick={() => removeExperience(index)} 
                        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Eliminar esta experiencia"
                      >
                        <Trash2 size={20} />
                      </button>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">Cargo o Puesto</label>
                          <input type="text" className="form-control" placeholder="Ej: Vendedor" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Empresa o Lugar</label>
                          <input type="text" className="form-control" placeholder="Ej: Almacenes París" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Período (Años)</label>
                        <input type="text" className="form-control" placeholder="Ej: 2015 - 2020" value={exp.years} onChange={e => updateExperience(index, 'years', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Breve Descripción</label>
                        <textarea className="form-control" rows="2" placeholder="Describe brevemente tus responsabilidades..." value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} required></textarea>
                      </div>
                    </div>
                  ))
                )}
                <div style={{ marginBottom: '32px' }}></div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <Briefcase size={24} /> <h3>Perfil de Empresa</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Razón Social o Nombre de Fantasía</label>
                    <input type="text" className="form-control" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RUT Empresa</label>
                    <input type="text" className="form-control" value={rut} onChange={e => setRut(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industria / Rubro</label>
                    <input type="text" className="form-control" placeholder="Ej: Logística, Salud, Retail..." value={industry} onChange={e => setIndustry(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <Phone size={24} /> <h3>Contacto Principal</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div className="form-group">
                    <label className="form-label">Nombre del Contacto (RRHH)</label>
                    <input type="text" className="form-control" value={contactName} onChange={e => setContactName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input type="tel" className="form-control" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Perfil'} <Save size={20} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

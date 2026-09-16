import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Send, PenTool, Video, FileText, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const INITIAL_MOCK_JOBS = [
  {
    title: 'Asistente de Recepción y Atención',
    company: 'Clínica Dental San Lucas',
    inclusiva: true,
    location: 'Providencia',
    type: 'Part-time',
    schedule: 'Lunes a Viernes 09:00 - 13:00',
    salary: '$480.000 / mes',
    keywords: 'administrativo asistente recepcionista'
  },
  {
    title: 'Supervisor de Control de Inventario',
    company: 'Distribuidora TransSur S.A.',
    inclusiva: true,
    location: 'Santiago',
    type: 'Full-time',
    schedule: 'Turno fijo diurno, no requiere fuerza física',
    salary: '$750.000 / mes',
    keywords: 'supervisor logistica inventario bodega'
  },
  {
    title: 'Consultor Senior de Atención Telefónica',
    company: 'Seguros VidaPlena',
    inclusiva: true,
    location: 'Remoto',
    type: 'Remoto',
    schedule: 'Flexible (30 horas semanales a convenir)',
    salary: '$600.000 + Comisiones',
    keywords: 'consultor senior atencion al cliente ejecutivo ventas'
  }
];

export default function Trabajadores() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');
  const navigate = useNavigate();

  const handleApply = async (jobId, jobTitle) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para postular a empleos.");
      navigate('/auth');
      return;
    }
    
    try {
      await addDoc(collection(db, 'postulaciones'), {
        jobId,
        jobTitle,
        userId: user.uid,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      alert(`¡Postulación enviada con éxito a: ${jobTitle}! Nuestro equipo revisará tu perfil digital y contactará a la empresa.`);
    } catch (error) {
      console.error("Error applying:", error);
      alert("Hubo un error al procesar tu postulación. Por favor intenta de nuevo.");
    }
  };

  const handleWorkshopEnroll = async (workshopName) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para inscribirte en un taller.");
      navigate('/auth');
      return;
    }
    try {
      await addDoc(collection(db, 'inscripciones_talleres'), {
        workshopName,
        userId: user.uid,
        enrolledAt: new Date().toISOString()
      });
      alert(`¡Te has inscrito exitosamente en el taller: ${workshopName}! Pronto te enviaremos el enlace por correo.`);
    } catch (error) {
      console.error("Error workshop:", error);
      alert("Hubo un error al procesar tu inscripción.");
    }
  };

  const handleCoachRequest = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para solicitar un coach laboral.");
      navigate('/auth');
      return;
    }
    try {
      await addDoc(collection(db, 'solicitudes_coach'), {
        userId: user.uid,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      });
      alert('¡Coach laboral solicitado! Un psicólogo experto se pondrá en contacto contigo para agendar la primera sesión.');
    } catch (error) {
      console.error("Error coach:", error);
      alert("Hubo un error al solicitar el coach.");
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsCollection = collection(db, 'ofertas');
        const jobsSnapshot = await getDocs(jobsCollection);
        
        if (jobsSnapshot.empty) {
          console.log('Sembrando base de datos con ofertas iniciales...');
          for (const job of INITIAL_MOCK_JOBS) {
            await addDoc(jobsCollection, job);
          }
          const newSnapshot = await getDocs(jobsCollection);
          const jobsList = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJobs(jobsList);
        } else {
          const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJobs(jobsList);
        }
      } catch (error) {
        console.error("Error Firestore: ", error);
        setDbError(`Error real de Firebase: ${error.code} - ${error.message}. Verifica tu conexión a internet o los detalles de la consola.`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const textMatch = !keyword || 
                      (job.keywords && job.keywords.includes(keyword.toLowerCase())) || 
                      (job.title && job.title.toLowerCase().includes(keyword.toLowerCase())) || 
                      (job.company && job.company.toLowerCase().includes(keyword.toLowerCase()));
    
    const locationMatch = !location || (job.location && job.location.includes(location));
    const typeMatch = !jobType || job.type === jobType || (jobType === 'Remoto' && job.type === 'Remoto');

    return textMatch && locationMatch && typeMatch;
  });

  const resetFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
  };

  return (
    <section className="view-section active">
      <div className="worker-hero">
        <div className="container">
          <h1>Su experiencia es nuestro valor más grande</h1>
          <p>Buscamos ofertas laborales con jornadas flexibles, sin discriminación de edad y con capacitaciones continuas.</p>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: '60px' }}>
        <div className="job-search-panel">
          <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '20px' }}>Buscador de Empleo</h2>
          <form className="search-grid" onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="search-keyword" className="form-label">Palabra clave</label>
              <input type="text" id="search-keyword" className="form-control" placeholder="Ej: Administrativo, Vendedor..." value={keyword} onChange={e => setKeyword(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="search-location" className="form-label">Comuna / Región</label>
              <select id="search-location" className="form-control" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">Todas las comunas</option>
                <option value="Santiago">Santiago</option>
                <option value="Providencia">Providencia</option>
                <option value="Las Condes">Las Condes</option>
                <option value="Viña del Mar">Viña del Mar</option>
                <option value="Concepción">Concepción</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="search-type" className="form-label">Tipo de Jornada</label>
              <select id="search-type" className="form-control" value={jobType} onChange={e => setJobType(e.target.value)}>
                <option value="">Todas las jornadas</option>
                <option value="Part-time">Part-time (Media jornada)</option>
                <option value="Full-time">Full-time (Jornada completa)</option>
                <option value="Remoto">100% Remoto</option>
              </select>
            </div>
          </form>
        </div>

        {dbError && (
          <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle />
            <p>{dbError}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: 'var(--font-lg)' }}>
            {loading ? 'Cargando empleos desde la nube...' : `Se ${filteredJobs.length === 1 ? 'muestra 1 vacante' : `muestran ${filteredJobs.length} vacantes`} de empleo`}
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={resetFilters} style={{ padding: '6px 12px', minHeight: 'auto', fontSize: 'var(--font-sm)' }}>
            Limpiar filtros
          </button>
        </div>

        <div className="jobs-list">
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando datos desde Firestore...</div>
          ) : filteredJobs.length === 0 && !dbError ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
               <h4 style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>No encontramos ofertas que coincidan</h4>
               <p style={{ color: 'var(--text-muted)' }}>Prueba borrando filtros o buscando palabras clave más generales.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <article key={job.id} className="job-card">
                <div className="job-info">
                  <div className="job-header-row">
                    <h3>{job.title}</h3>
                    {job.inclusiva && (
                      <span className="badge-inclusiva" title="Esta empresa cuenta con certificado de inclusión senior activa">
                        <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Empresa Inclusiva
                      </span>
                    )}
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{job.company}</p>
                  <div className="job-meta-row">
                    <span className="job-meta-item"><MapPin size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {job.location}</span>
                    <span className="job-meta-item"><Clock size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {job.type} ({job.schedule})</span>
                    <span className="job-salary">{job.salary}</span>
                  </div>
                </div>
                <div className="job-action">
                  <button className="btn btn-primary btn-lg" onClick={() => handleApply(job.id, job.title)}>
                    Postular aquí <Send size={20} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      
      <section className="coaching-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="text-center" style={{ fontSize: 'var(--font-xxl)', color: 'var(--primary)' }}>Espacio de Coaching y Acompañamiento</h2>
          <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 40px' }}>Entendemos que reinsertarse laboralmente puede ser un desafío. Te apoyamos gratis con talleres prácticos y mentores individuales.</p>
          
          <h3 style={{ fontSize: 'var(--font-lg)', borderBottom: '2px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>Talleres Prácticos Disponibles</h3>
          
          <div className="coaching-grid">
            <article className="workshop-card">
              <div>
                <span className="workshop-badge">Digital</span>
                <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>Taller: Currículum Moderno y Perfil Digital</h4>
                <p>Aprende a redactar un currículum enfocado en logros, a crear tu cuenta de LinkedIn y a registrarte de forma segura en portales de empleo de internet.</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleWorkshopEnroll('Currículum Moderno y Perfil Digital')}>
                Inscribirme gratis <PenTool size={18} />
              </button>
            </article>

            <article className="workshop-card">
              <div>
                <span className="workshop-badge">Tecnología</span>
                <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>Uso de Herramientas de Videoconferencia</h4>
                <p>Pierde el miedo a las entrevistas online. Practicaremos cómo conectarte a Zoom, Google Meet y Microsoft Teams, cómo configurar tu cámara, audio y luces de fondo.</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleWorkshopEnroll('Uso de Herramientas de Videoconferencia')}>
                Inscribirme gratis <Video size={18} />
              </button>
            </article>

            <article className="workshop-card">
              <div>
                <span className="workshop-badge">Finanzas</span>
                <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>Boletas de Honorarios y Regulación Previsional</h4>
                <p>Conoce los alcances legales de trabajar estando jubilado. Aprende a emitir boletas de honorarios en el SII y a regularizar tus retenciones impositivas.</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleWorkshopEnroll('Boletas de Honorarios y Regulación Previsional')}>
                Inscribirme gratis <FileText size={18} />
              </button>
            </article>
          </div>

          <div className="mentorship-banner">
            <div className="mentorship-content">
              <h3>¿Necesitas ayuda personalizada para prepararte?</h3>
              <p>Agenda una mentoría individual virtual con un psicólogo laboral experto en orientación senior. Te ayudaremos a ensayar entrevistas de trabajo y a ganar seguridad en tu perfil.</p>
            </div>
            <button className="btn btn-primary btn-lg" style={{ backgroundColor: 'var(--accent)', color: '#fff' }} onClick={handleCoachRequest}>
              Solicitar un Coach Laboral <UserCheck size={20} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

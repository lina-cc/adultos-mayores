/**
 * app.js - ExperienciaSenior
 * Interaction & Accessibility logic for SPA Mockup
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- SPA VIEW CONTROLLER (ROUTER) ---
  const navLinks = document.querySelectorAll('.nav-link, #logo-link');
  const sections = document.querySelectorAll('.view-section');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  function switchView(targetId) {
    // Hide mobile menu if open
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    // Deactivate all sections and header links
    sections.forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Activate selected section
    const targetSection = document.getElementById(`view-${targetId}`);
    if (targetSection) {
      targetSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Highlight menu link
    const matchingLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    if (matchingLink) {
      matchingLink.classList.add('active');
    }

    // Update address hash without reload
    history.pushState(null, null, `#${targetId}`);
  }

  // Navigation Event Listeners
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target') || 'landing';
      switchView(target);
    });
  });

  // Handle mobile menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', !isOpen);
    });
  }

  // Read initial hash if exists
  const initialHash = window.location.hash.substring(1);
  if (initialHash && ['landing', 'empresas', 'trabajadores', 'nosotros', 'contacto'].includes(initialHash)) {
    switchView(initialHash);
  }

  // Expose switchView to global window object so HTML onclick functions can find it
  window.switchView = switchView;


  // --- ACCESSIBILITY CONTROL PANEL (A11Y) ---
  const a11yToggleBtn = document.getElementById('a11y-toggle-btn');
  const a11yHeaderBtn = document.getElementById('a11y-header-btn');
  const a11yPanel = document.getElementById('a11y-panel');
  const a11yCloseBtn = document.getElementById('a11y-close-btn');

  // Open / Close Panel
  function toggleA11yPanel() {
    const isOpen = a11yPanel.classList.contains('open');
    if (isOpen) {
      a11yPanel.classList.remove('open');
      a11yToggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      a11yPanel.classList.add('open');
      a11yToggleBtn.setAttribute('aria-expanded', 'true');
      a11yPanel.focus();
    }
  }

  if (a11yToggleBtn) a11yToggleBtn.addEventListener('click', toggleA11yPanel);
  if (a11yHeaderBtn) a11yHeaderBtn.addEventListener('click', toggleA11yPanel);
  if (a11yCloseBtn) a11yCloseBtn.addEventListener('click', toggleA11yPanel);

  // Close panel on pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && a11yPanel.classList.contains('open')) {
      toggleA11yPanel();
    }
  });

  // Font Size Scaling Lógica
  let fontScale = parseFloat(localStorage.getItem('senior-font-scale')) || 1.0;
  const root = document.documentElement;
  
  const fontDec = document.getElementById('a11y-font-dec');
  const fontReset = document.getElementById('a11y-font-reset');
  const fontInc = document.getElementById('a11y-font-inc');

  function updateFontScale(newScale) {
    fontScale = Math.max(0.8, Math.min(newScale, 1.6)); // Limit between 80% and 160%
    root.style.setProperty('--font-scale', fontScale);
    localStorage.setItem('senior-font-scale', fontScale);
    
    // Manage active visual state
    [fontDec, fontReset, fontInc].forEach(b => b.classList.remove('active'));
    if (fontScale < 1.0) fontDec.classList.add('active');
    else if (fontScale === 1.0) fontReset.classList.add('active');
    else fontInc.classList.add('active');
  }

  // Init scale
  updateFontScale(fontScale);

  if (fontDec) fontDec.addEventListener('click', () => updateFontScale(fontScale - 0.15));
  if (fontReset) fontReset.addEventListener('click', () => updateFontScale(1.0));
  if (fontInc) fontInc.addEventListener('click', () => updateFontScale(fontScale + 0.15));

  // High Contrast Lógica
  const contrastNormal = document.getElementById('a11y-contrast-normal');
  const contrastHigh = document.getElementById('a11y-contrast-high');
  let highContrastActive = localStorage.getItem('senior-high-contrast') === 'true';

  function setHighContrast(active) {
    highContrastActive = active;
    if (active) {
      document.body.classList.add('high-contrast');
      contrastHigh.classList.add('active');
      contrastNormal.classList.remove('active');
    } else {
      document.body.classList.remove('high-contrast');
      contrastNormal.classList.add('active');
      contrastHigh.classList.remove('active');
    }
    localStorage.setItem('senior-high-contrast', active);
  }

  // Init Contrast
  setHighContrast(highContrastActive);

  if (contrastNormal) contrastNormal.addEventListener('click', () => setHighContrast(false));
  if (contrastHigh) contrastHigh.addEventListener('click', () => setHighContrast(true));


  // --- ACORDEÓN INTERACTIVO (MARCO LEGAL) ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      // Close all items first for clean single-expand UX
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').style.maxHeight = null;
        otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      // If it wasn't active, expand it
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        // Set max height dynamically to trigger CSS transition
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  // --- BUSCADOR INTERACTIVO DE EMPLEOS ---
  const jobCards = document.querySelectorAll('.job-card');
  const resultsCount = document.getElementById('results-count');

  function filterJobs() {
    const keywordVal = document.getElementById('search-keyword').value.toLowerCase().trim();
    const locationVal = document.getElementById('search-location').value;
    const typeVal = document.getElementById('search-type').value;

    let matchCount = 0;

    jobCards.forEach(card => {
      const keywords = card.getAttribute('data-keyword').toLowerCase();
      const jobTitle = card.querySelector('h3').textContent.toLowerCase();
      const company = card.querySelector('.job-info p').textContent.toLowerCase();
      const location = card.getAttribute('data-location');
      const type = card.getAttribute('data-type');

      // Check text match (in keywords, title, or company name)
      const textMatch = !keywordVal || 
                        keywords.includes(keywordVal) || 
                        jobTitle.includes(keywordVal) || 
                        company.includes(keywordVal);

      // Check filters
      const locationMatch = !locationVal || location === locationVal;
      
      // Check type filter (handles 'Remoto' matching data attribute type)
      const typeMatch = !typeVal || type === typeVal || (typeVal === 'Remoto' && type === 'Remoto');

      if (textMatch && locationMatch && typeMatch) {
        card.style.display = 'flex';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update results label
    if (resultsCount) {
      if (matchCount === 1) {
        resultsCount.textContent = "Se muestra 1 vacante de empleo";
      } else {
        resultsCount.textContent = `Se muestran ${matchCount} vacantes de empleo`;
      }

      // Add feedback if no jobs found
      let emptyMsg = document.getElementById('no-jobs-feedback');
      if (matchCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'no-jobs-feedback';
          emptyMsg.style.padding = '40px';
          emptyMsg.style.textAlign = 'center';
          emptyMsg.style.backgroundColor = 'var(--surface)';
          emptyMsg.style.borderRadius = 'var(--radius-md)';
          emptyMsg.style.border = '1px dashed var(--border)';
          emptyMsg.innerHTML = `
            <i data-lucide="info" style="width: 48px; height: 48px; color: var(--accent); margin-bottom: 16px;"></i>
            <h4 style="font-size: var(--font-lg); margin-bottom: 8px;">No encontramos ofertas que coincidan</h4>
            <p style="color: var(--text-muted);">Prueba borrando filtros o buscando palabras clave más generales como 'Asistente' o 'Supervisor'.</p>
          `;
          document.getElementById('jobs-list-container').appendChild(emptyMsg);
          lucide.createIcons();
        }
      } else if (emptyMsg) {
        emptyMsg.remove();
      }
    }
  }

  function resetFilters() {
    document.getElementById('search-keyword').value = '';
    document.getElementById('search-location').value = '';
    document.getElementById('search-type').value = '';
    filterJobs();
  }

  // Expose job filter logic globally
  window.filterJobs = filterJobs;
  window.resetFilters = resetFilters;


  // --- SIMULADOR DE CALENDARIO INTERACTIVO ---
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days');
  const bookBtn = document.getElementById('book-meeting-btn');
  const timeSlots = document.querySelectorAll('.time-slot');

  let selectedDay = null;
  let selectedTime = null;

  // Let's draw July 2026. Today is July 5, 2026.
  // July 2026 starts on a Wednesday (Day 3). It has 31 days.
  function renderJuly2026() {
    if (!daysContainer) return;
    daysContainer.innerHTML = '';
    
    // Add Day names headers (Lunes a Domingo)
    const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    dayNames.forEach(name => {
      const dName = document.createElement('div');
      dName.className = 'calendar-day-name';
      dName.textContent = name;
      daysContainer.appendChild(dName);
    });

    // July 2026 starts on Wednesday, meaning 2 empty days (Monday and Tuesday) of offset
    for (let i = 0; i < 2; i++) {
      const emptyDiv = document.createElement('div');
      daysContainer.appendChild(emptyDiv);
    }

    // Render days 1 to 31
    // Today is July 5, 2026
    for (let day = 1; day <= 31; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.textContent = day;

      const isPast = day < 5; // Past days are inactive
      const isWeekend = (day % 7 === 4 || day % 7 === 5); // Simple weekend check for July 2026 (Sat/Sun)

      if (isPast || isWeekend) {
        dayDiv.classList.add('inactive');
      } else {
        dayDiv.classList.add('active');
        dayDiv.addEventListener('click', () => {
          // Manage selection
          document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
          dayDiv.classList.add('selected');
          selectedDay = day;
          checkBookingReady();
        });
      }

      daysContainer.appendChild(dayDiv);
    }
  }

  // Handle time slots selection
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.getAttribute('data-time');
      checkBookingReady();
    });
  });

  function checkBookingReady() {
    if (selectedDay && selectedTime) {
      bookBtn.removeAttribute('disabled');
    } else {
      bookBtn.setAttribute('disabled', 'true');
    }
  }

  // Book meeting button trigger
  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      openModal(
        "¡Reunión Agendada!",
        `Hemos reservado su asesoría para el día <strong>${selectedDay} de Julio del 2026</strong> a las <strong>${selectedTime}</strong>. Enviaremos un correo de confirmación con el enlace de Zoom a su dirección de contacto.`
      );
      // Reset selections
      selectedDay = null;
      selectedTime = null;
      document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
      timeSlots.forEach(s => s.classList.remove('selected'));
      checkBookingReady();
    });
  }

  renderJuly2026();


  // --- MODALES Y MANEJO DE FORMULARIOS ---
  const generalModal = document.getElementById('interactive-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalOkBtn = document.getElementById('modal-ok-btn');

  function openModal(title, desc) {
    if (generalModal) {
      modalTitle.innerHTML = title;
      modalDescription.innerHTML = desc;
      generalModal.classList.add('open');
    }
  }

  function closeModal() {
    if (generalModal) {
      generalModal.classList.remove('open');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOkBtn) modalOkBtn.addEventListener('click', closeModal);
  
  // Close general modal on clicking overlay
  if (generalModal) {
    generalModal.addEventListener('click', (e) => {
      if (e.target === generalModal) closeModal();
    });
  }

  // Employer Form Submit
  const employerForm = document.getElementById('employer-contact-form');
  if (employerForm) {
    employerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const compName = document.getElementById('company-name').value.trim();
      const compEmail = document.getElementById('company-email').value.trim();
      const compMessage = document.getElementById('company-message').value.trim();

      if (!compName || !compEmail || !compMessage) {
        alert("Por favor complete todos los campos obligatorios (*)");
        return;
      }

      openModal(
        "¡Solicitud Recibida!",
        `Muchas gracias, la empresa <strong>${compName}</strong> ha quedado registrada en nuestra base de datos. Un consultor senior especialista en incentivos fiscales y adaptabilidad laboral le responderá al correo <em>${compEmail}</em> a la brevedad.`
      );
      employerForm.reset();
    });
  }

  // General Form Submit
  const generalForm = document.getElementById('general-contact-form');
  if (generalForm) {
    generalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const msg = document.getElementById('contact-message').value.trim();

      if (!name || !email || !msg) {
        alert("Por favor complete todos los campos obligatorios (*)");
        return;
      }

      openModal(
        "¡Mensaje Enviado!",
        `Hola <strong>${name}</strong>, hemos recibido tu mensaje con éxito. Te responderemos al correo <em>${email}</em> dentro de las próximas 24 horas.`
      );
      generalForm.reset();
    });
  }


  // --- MANEJO ESPECÍFICO DE POSTULACIONES A EMPLEOS (MODAL SEPARADO) ---
  const applyModal = document.getElementById('apply-modal');
  const applySubtitle = document.getElementById('apply-subtitle');
  const applyForm = document.getElementById('apply-job-form');
  let currentJobTitle = "";
  let currentCompany = "";

  function openApplyModal(jobTitle, company) {
    currentJobTitle = jobTitle;
    currentCompany = company;
    if (applySubtitle) {
      applySubtitle.textContent = `Puesto: ${jobTitle} | Empresa: ${company} (Sello Inclusivo)`;
    }
    if (applyModal) {
      applyModal.classList.add('open');
    }
  }

  function closeApplyModal() {
    if (applyModal) {
      applyModal.classList.remove('open');
      if (applyForm) applyForm.reset();
    }
  }

  // Job Apply Submit
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const applicantName = document.getElementById('apply-name').value.trim();
      const applicantRut = document.getElementById('apply-rut').value.trim();
      const applicantPhone = document.getElementById('apply-phone').value.trim();

      if (!applicantName || !applicantRut || !applicantPhone) {
        alert("Por favor rellene todos los campos requeridos (*)");
        return;
      }

      closeApplyModal();
      
      openModal(
        "¡Postulación Recibida!",
        `Felicitaciones <strong>${applicantName}</strong>. Has postulado con éxito al puesto de <strong>${currentJobTitle}</strong> en <strong>${currentCompany}</strong>.<br><br>Un psicólogo laboral revisará tu ficha y se pondrá en contacto contigo al teléfono <strong>${applicantPhone}</strong> para guiarte en el proceso de selección.`
      );
    });
  }

  // Modal overlays click handling
  if (applyModal) {
    applyModal.addEventListener('click', (e) => {
      if (e.target === applyModal) closeApplyModal();
    });
  }

  window.openApplyModal = openApplyModal;
  window.closeApplyModal = closeApplyModal;


  // --- TALLERES Y MENTORÍAS ACCIONES ---
  window.openWorkshopModal = function(workshopName) {
    openModal(
      "¡Inscripción Exitosa!",
      `Te has inscrito correctamente en el taller gratuito de <strong>"${workshopName}"</strong>.<br><br>Te enviaremos un correo con los datos de acceso, fecha y hora de la clase virtual, además del material de estudio previo.`
    );
  };

  window.openMentorshipModal = function() {
    openModal(
      "¡Coach Solicitado!",
      "Hemos recibido tu solicitud de acompañamiento 1 a 1.<br><br>Un Coach Laboral Senior se pondrá en contacto contigo vía telefónica en las próximas 48 horas para programar tu primera videollamada de asesoramiento personalizado."
    );
  };
});

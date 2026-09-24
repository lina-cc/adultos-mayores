export const BOOKING_SLOTS = ['09:00', '11:30', '15:00'];
export const CALENDAR_MONTH = { year: 2026, month: 7, days: 31, pastUntil: 5 };

export function isSelectableDay(day, { pastUntil = CALENDAR_MONTH.pastUntil, daysInMonth = CALENDAR_MONTH.days } = {}) {
  if (!Number.isInteger(day) || day < 1 || day > daysInMonth) return false;
  const isPast = day < pastUntil;
  const isWeekend = day % 7 === 4 || day % 7 === 5;
  return !isPast && !isWeekend;
}

export function formatBookingDate(day, year = CALENDAR_MONTH.year, month = CALENDAR_MONTH.month) {
  if (!isSelectableDay(day)) {
    throw new Error('El día seleccionado no está disponible.');
  }
  const padded = String(day).padStart(2, '0');
  const paddedMonth = String(month).padStart(2, '0');
  return `${year}-${paddedMonth}-${padded}`;
}

export function formatSlotLabel(time) {
  if (!BOOKING_SLOTS.includes(time)) return time;
  return time === '15:00' ? '03:00 PM' : `${time} AM`;
}

export function canConfirmBooking(day, time) {
  return isSelectableDay(day) && BOOKING_SLOTS.includes(time);
}

export function buildMeeting({ userId, day, time, createdAt = new Date().toISOString() }) {
  if (!canConfirmBooking(day, time)) {
    throw new Error('Selecciona un día y una hora disponibles.');
  }
  if (!userId) throw new Error('Debes iniciar sesión para agendar.');
  return {
    userId,
    date: formatBookingDate(day),
    time,
    status: 'pending',
    createdAt,
  };
}

export function toggleAccordion(current, index) {
  return current === index ? null : index;
}

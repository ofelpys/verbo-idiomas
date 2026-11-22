import { courses } from '../data/courses.js';

const BOOKINGS_KEY = 'verbo.trial-bookings.v1';
const START_HOURS = [9, 14, 19];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pause = () => new Promise((resolve) => setTimeout(resolve, 240));
const slotFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function requireCourse(courseId) {
  const course = courses.find(({ id }) => id === courseId);
  if (!course) throw new Error('Escolha um idioma disponível.');
  return course;
}

function readBookings() {
  try {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]');
    if (!Array.isArray(bookings)) throw new TypeError();
    return bookings;
  } catch {
    throw new Error('Não foi possível ler as reservas. Verifique o armazenamento do navegador e tente novamente.');
  }
}

function availableSlots(courseId) {
  const reserved = new Set(readBookings().map((booking) => booking.slotId));
  const cursor = new Date();
  const slots = [];
  let weekdays = 0;

  while (weekdays < 4) {
    cursor.setDate(cursor.getDate() + 1);
    if ([0, 6].includes(cursor.getDay())) continue;
    weekdays += 1;

    for (const hour of START_HOURS) {
      cursor.setHours(hour, 0, 0, 0);
      const startsAt = cursor.toISOString();
      const id = courseId + '/' + startsAt;
      if (!reserved.has(id)) {
        slots.push({ id, startsAt, label: slotFormatter.format(cursor) });
      }
    }
  }

  return slots;
}

export async function listCourses() {
  await pause();
  return courses.map((course) => ({ ...course, topics: [...course.topics] }));
}

export async function getSlots(courseId) {
  await pause();
  requireCourse(courseId);
  return availableSlots(courseId);
}

export async function bookTrial({ courseId, slotId, name, email }) {
  await pause();
  const course = requireCourse(courseId);
  const cleanName = String(name ?? '').trim();
  const cleanEmail = String(email ?? '').trim();
  if (cleanName.length < 2 || cleanName.length > 100) {
    throw new Error('Informe um nome entre 2 e 100 caracteres.');
  }
  if (cleanEmail.length > 254 || !EMAIL_PATTERN.test(cleanEmail)) {
    throw new Error('Confira o endereço de e-mail.');
  }

  async function reserve() {
    const slot = availableSlots(courseId).find(({ id }) => id === slotId);
    if (!slot) {
      const error = new Error('Este horário já está indisponível. Escolha outro para continuar.');
      error.code = 'SLOT_UNAVAILABLE';
      throw error;
    }

    const booking = {
      courseId,
      slotId,
      name: cleanName,
      email: cleanEmail,
      startsAt: slot.startsAt,
    };
    const bookings = readBookings();
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify([...bookings, booking]));
    } catch {
      throw new Error('Não foi possível salvar a reserva. Verifique o espaço e as permissões do navegador.');
    }
    return { ...booking, courseName: course.name, slotLabel: slot.label };
  }

  // Serialize the mock's read/write transaction across tabs when supported.
  if (globalThis.navigator?.locks) {
    return navigator.locks.request(BOOKINGS_KEY, reserve);
  }
  return reserve();
}

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { bookTrial, getSlots, listCourses } from '../src/services/schoolApi.js';

function installMemoryStorage(t) {
  const values = new Map();
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  });
  return { storage, values };
}

function trialRequest(slotId) {
  return { courseId: 'ingles', slotId, name: 'Ana Silva', email: 'ana@example.test' };
}

describe('API simulada da escola', { timeout: 30_000 }, () => {
  test('lista seis idiomas e isola os dados de cada consulta', async () => {
    const courses = await listCourses();
    assert.deepEqual(courses.map((course) => course.name), [
      'Inglês', 'Espanhol', 'Francês', 'Italiano', 'Alemão', 'Japonês',
    ]);
    assert.equal(new Set(courses.map((course) => course.id)).size, 6);
    const initialTopics = [...courses[0].topics];
    courses[0].topics.push('alteração local');
    courses[0].name = 'alteração local';
    const [original] = await listCourses();
    assert.equal(original.name, 'Inglês');
    assert.deepEqual(original.topics, initialTopics);
  });

  test('a agenda de sexta começa na segunda e oferece quatro dias úteis no horário local', async (t) => {
    installMemoryStorage(t);
    const friday = new Date(2025, 1, 14, 12);
    t.mock.timers.enable({ apis: ['Date'], now: friday });
    const slots = await getSlots('frances');
    const dates = slots.map(({ startsAt }) => new Date(startsAt));
    assert.deepEqual([...new Set(dates.map((date) => date.getDate()))], [17, 18, 19, 20]);
    assert.deepEqual(dates.map((date) => date.getHours()), [9, 14, 19, 9, 14, 19, 9, 14, 19, 9, 14, 19]);
    assert.ok(dates.every((date) => date > friday && date.getDay() > 0 && date.getDay() < 6));
    assert.equal(new Set(slots.map((slot) => slot.id)).size, 12);
  });

  test('persiste a reserva e mantém o mesmo horário livre para outro idioma', async (t) => {
    const { values } = installMemoryStorage(t);
    const [slot] = await getSlots('ingles');
    const booking = await bookTrial({ ...trialRequest(slot.id), name: '  Ana Silva  ' });
    assert.equal(booking.name, 'Ana Silva');
    assert.equal(booking.courseName, 'Inglês');
    assert.equal(booking.startsAt, slot.startsAt);
    assert.equal(values.size, 1);
    const [saved] = JSON.parse([...values.values()][0]);
    assert.equal(saved.slotId, slot.id);
    assert.equal(saved.email, 'ana@example.test');

    const reloadedApi = await import('../src/services/schoolApi.js?reload');
    const [english, spanish] = await Promise.all([reloadedApi.getSlots('ingles'), reloadedApi.getSlots('espanhol')]);
    assert.ok(!english.some((item) => item.id === slot.id));
    assert.ok(spanish.some((item) => item.startsAt === slot.startsAt));
  });

  test('duas tentativas simultâneas para a mesma vaga geram uma única reserva', async (t) => {
    installMemoryStorage(t);
    const [slot] = await getSlots('ingles');
    const request = trialRequest(slot.id);
    const attempts = await Promise.allSettled([bookTrial(request), bookTrial(request)]);
    assert.equal(attempts.filter((result) => result.status === 'fulfilled').length, 1);
    const failed = attempts.find((result) => result.status === 'rejected');
    assert.equal(failed.reason.code, 'SLOT_UNAVAILABLE');
    assert.equal((await getSlots('ingles')).length, 11);
  });

  test('recusa idiomas, dados pessoais e horários inválidos sem gravar reservas', async (t) => {
    const { values } = installMemoryStorage(t);
    const [slot] = await getSlots('ingles');
    const request = trialRequest(slot.id);
    await Promise.all([
      assert.rejects(getSlots('desconhecido'), /idioma/),
      assert.rejects(bookTrial({ ...request, courseId: 'desconhecido' }), /idioma/),
      assert.rejects(bookTrial({ ...request, name: '  ' }), /nome/),
      assert.rejects(bookTrial({ ...request, email: 'sem-arroba' }), /e-mail/),
      assert.rejects(bookTrial({ ...request, slotId: 'inexistente' }), { code: 'SLOT_UNAVAILABLE' }),
      assert.rejects(bookTrial({ ...request, courseId: 'japones' }), { code: 'SLOT_UNAVAILABLE' }),
    ]);
    assert.equal(values.size, 0);
  });

  test('expõe falhas de leitura e dados corrompidos como erros recuperáveis', async (t) => {
    const { storage } = installMemoryStorage(t);
    const read = t.mock.method(storage, 'getItem', () => { throw new Error('armazenamento bloqueado'); });
    await assert.rejects(getSlots('italiano'), /ler as reservas/);
    read.mock.mockImplementation(() => '{');
    await assert.rejects(getSlots('italiano'), /ler as reservas/);
    read.mock.restore();
    assert.equal((await getSlots('italiano')).length, 12);
  });

  test('uma falha na gravação conserva a vaga para uma nova tentativa', async (t) => {
    const { storage } = installMemoryStorage(t);
    const [slot] = await getSlots('ingles');
    const write = t.mock.method(storage, 'setItem', () => { throw new Error('sem espaço'); });
    await assert.rejects(bookTrial(trialRequest(slot.id)), /salvar a reserva/);
    write.mock.restore();
    const reopened = await getSlots('ingles');
    assert.ok(reopened.some((item) => item.id === slot.id));
    assert.equal((await bookTrial(trialRequest(slot.id))).slotId, slot.id);
  });
});

import React, { useEffect, useId, useRef, useState } from 'react';
import { bookTrial, getSlots } from '../services/schoolApi.js';
import Modal from './Modal.jsx';

export default function TrialDialog({ initialCourseId, courses, onClose }) {
  const titleId = useId();
  const successTitle = useRef(null);
  const [courseId, setCourseId] = useState(initialCourseId ?? '');
  const [slotId, setSlotId] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(Boolean(initialCourseId));
  const [scheduleError, setScheduleError] = useState('');
  const [reload, setReload] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    getSlots(courseId)
      .then((nextSlots) => { if (active) setSlots(nextSlots); })
      .catch((failure) => { if (active) setScheduleError(failure.message); })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [courseId, reload]);

  useEffect(() => {
    if (booking) successTitle.current?.focus();
  }, [booking]);

  function resetSlots(nextCourseId) {
    setSlots([]);
    setSlotId('');
    setScheduleError('');
    setLoadingSlots(Boolean(nextCourseId));
  }

  function changeCourse(event) {
    const nextCourseId = event.target.value;
    resetSlots(nextCourseId);
    setCourseId(nextCourseId);
    setError('');
  }

  function refreshSlots() {
    resetSlots(courseId);
    setReload((current) => current + 1);
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    setError('');
    setSaving(true);
    try {
      const result = await bookTrial({
        courseId,
        slotId,
        name: fields.get('name'),
        email: fields.get('email'),
      });
      setBooking(result);
    } catch (failure) {
      setError(failure.message);
      if (failure.code === 'SLOT_UNAVAILABLE') refreshSlots();
    } finally {
      setSaving(false);
    }
  }

  let slotHint = 'Selecione um horário';
  if (!courseId) slotHint = 'Escolha o idioma primeiro';
  else if (loadingSlots) slotHint = 'Carregando horários…';
  else if (!slots.length) slotHint = 'Sem horários disponíveis';

  return (
    <Modal titleId={titleId} onClose={onClose} busy={saving}>
      {booking ? (
        <>
          <span className="verbo-dialog__success-mark" aria-hidden="true">✓</span>
          <h2 ref={successTitle} id={titleId} tabIndex="-1">Aula agendada!</h2>
          <p className="verbo-dialog__intro">{booking.name}, sua reserva de demonstração foi salva neste navegador.</p>
          <dl className="verbo-dialog__details">
            <div><dt>Idioma</dt><dd>{booking.courseName}</dd></div>
            <div><dt>Horário local</dt><dd>{booking.slotLabel}</dd></div>
          </dl>
          <button className="verbo-dialog__primary" type="button" onClick={onClose}>Concluir</button>
        </>
      ) : (
        <>
          <h2 id={titleId} tabIndex="-1">Aula experimental</h2>
          <p className="verbo-dialog__intro">Escolha um idioma e um horário para uma conversa online de 30 minutos.</p>
          <form className="verbo-dialog__form" onSubmit={submit}>
            <fieldset disabled={saving}>
              <label>Idioma
                <select value={courseId} onChange={changeCourse} required>
                  <option value="" disabled>Selecione um idioma</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
              </label>
              <label>Horário local
                <select value={slotId} onChange={(event) => setSlotId(event.target.value)} required disabled={!slots.length || loadingSlots}>
                  <option value="" disabled>{slotHint}</option>
                  {slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
                </select>
              </label>
              {scheduleError && (
                <div className="verbo-dialog__error" role="alert">
                  {scheduleError}{' '}
                  <button type="button" onClick={refreshSlots}>Tentar novamente</button>
                </div>
              )}
              <label>Seu nome
                <input name="name" autoComplete="name" placeholder="Como podemos chamar você?" required minLength="2" maxLength="100" />
              </label>
              <label>E-mail
                <input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength="254" />
              </label>
            </fieldset>
            {error && <p className="verbo-dialog__error" role="alert">{error}</p>}
            <p className="verbo-dialog__note">Esta é uma simulação. Os dados ficam apenas neste navegador.</p>
            <button className="verbo-dialog__primary" type="submit" disabled={saving || !slotId}>
              {saving ? 'Agendando…' : 'Confirmar agendamento'}
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}

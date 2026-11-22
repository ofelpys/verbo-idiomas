import React, { useId } from 'react';
import Modal from './Modal.jsx';

export default function CourseDialog({ course, onClose, onTrial }) {
  const titleId = useId();

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <p className="verbo-dialog__greeting" lang={course.lang}>{course.greeting}</p>
      <h2 id={titleId} tabIndex="-1">Curso de {course.name.toLocaleLowerCase('pt-BR')}</h2>
      <p className="verbo-dialog__intro">{course.description}</p>
      <dl className="verbo-dialog__details">
        <div><dt>Níveis</dt><dd>{course.level}</dd></div>
        <div><dt>Formato</dt><dd>Online ao vivo</dd></div>
      </dl>
      <h3>O que você vai praticar</h3>
      <ul className="verbo-dialog__topics">
        {course.topics.map((topic) => <li key={topic}>{topic}</li>)}
      </ul>
      <button className="verbo-dialog__primary" type="button" onClick={() => onTrial(course.id)}>
        Agendar aula experimental
      </button>
    </Modal>
  );
}

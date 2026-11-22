import { useState } from 'react'
import Icon from './Icon.jsx'

const destinations = { ingles: 'Londres', espanhol: 'Barcelona', frances: 'Paris', italiano: 'Roma', alemao: 'Berlim', japones: 'Quioto' }

function CourseCard({ course, onSelect }) {
  return (
    <article className={'course-card course-' + course.id}>
      <button type="button" className="card-action" aria-label={'Conhecer curso de ' + course.name} onClick={() => onSelect(course)}>
        <span className="postcard" aria-hidden="true">
          <span className="language-code">{course.lang.toUpperCase()}</span>
          <span className="postcard-greeting" lang={course.lang}>{course.greeting}</span>
          <span className="postcard-location"><Icon name="pin" size={14} />{destinations[course.id]}</span>
          <img src={'/images/' + course.id + '.svg'} alt="" width="200" height="150" loading="lazy" />
        </span>
        <span className="card-body"><span className="card-title">{course.name}</span><span className="card-plus"><Icon name="plus" size={17} /></span>
          <span className="card-description">{course.description}</span>
        </span>
      </button>
    </article>
  )
}

export default function CourseCatalog({ courses, loadError, onRetry, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const visibleCourses = expanded ? courses : courses.slice(0, 3)

  return (
    <section id="idiomas" className="catalog">
      <div className="container">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow"><span />Nossos cursos</p>
            <h2 className="section-title">Escolha seu idioma<span>.</span></h2>
            <p className="section-intro">Seis idiomas, muitas maneiras de se conectar.</p>
          </div>
          {courses.length > 3 && <button className="button button--outline catalog-more" onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded} aria-controls="course-list">{expanded ? 'Mostrar menos' : 'Ver todos os cursos'}<Icon name={expanded ? 'minus' : 'plus'} size={16} /></button>}
        </div>
        {!courses.length && (loadError ? <p role="alert">Não foi possível carregar os cursos. <button onClick={onRetry}>Tentar novamente</button></p> : <p role="status">Carregando cursos…</p>)}
        <div id="course-list" className="course-grid">{visibleCourses.map(course => <CourseCard key={course.id} course={course} onSelect={onSelect} />)}</div>
      </div>
    </section>
  )
}

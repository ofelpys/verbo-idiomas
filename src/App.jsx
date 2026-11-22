import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import CourseCatalog from './components/CourseCatalog.jsx'
import SchoolGuide from './components/SchoolGuide.jsx'
import CourseDialog from './components/CourseDialog.jsx'
import TrialDialog from './components/TrialDialog.jsx'
import { listCourses } from './services/schoolApi.js'

export default function App() {
  const [courses, setCourses] = useState([])
  const [loadError, setLoadError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let active = true
    setLoadError(false)
    listCourses()
      .then(items => { if (active) setCourses(items) })
      .catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [attempt])

  const openTrial = (courseId = '') => setDialog({ type: 'trial', courseId })
  const closeDialog = () => setDialog(null)

  return (
    <>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      <Header onTrial={openTrial} />
      <main id="conteudo">
        <Hero />
        <CourseCatalog courses={courses} loadError={loadError} onRetry={() => setAttempt(attempt + 1)}
          onSelect={course => setDialog({ type: 'course', course })} />
        <SchoolGuide onTrial={openTrial} />
      </main>
      {dialog?.type === 'course' && <CourseDialog course={dialog.course} onClose={closeDialog} onTrial={openTrial} />}
      {dialog?.type === 'trial' && <TrialDialog initialCourseId={dialog.courseId} courses={courses} onClose={closeDialog} />}
    </>
  )
}

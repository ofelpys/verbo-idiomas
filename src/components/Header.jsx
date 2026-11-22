import { useEffect, useRef, useState } from 'react'
import Brand from './Brand.jsx'
import Icon from './Icon.jsx'

const links = [['Idiomas', '#idiomas'], ['Nosso método', '#metodo'], ['Dúvidas', '#duvidas']]

export default function Header({ onTrial }) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handleKey(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        toggle.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  return (
    <header className="site-header" id="inicio">
      <div className="container header-row">
        <Brand />
        <nav id="navegacao" className={'main-nav' + (isOpen ? ' is-open' : '')} aria-label="Navegação principal">
          {links.map(([label, href]) => <a key={href} href={href} onClick={() => setIsOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="button button--blue header-trial" onClick={() => { setIsOpen(false); onTrial() }}>Aula experimental</button>
          <button ref={toggle} className="menu-toggle" aria-controls="navegacao" aria-expanded={isOpen}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setIsOpen(!isOpen)}>
            <Icon name={isOpen ? 'close' : 'menu'} size={23} />
          </button>
        </div>
      </div>
    </header>
  )
}

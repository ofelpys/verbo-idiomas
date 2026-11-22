import Icon from './Icon.jsx'

const greetings = [['Hello!', 'en'], ['¡Hola!', 'es'], ['Bonjour !', 'fr'], ['Ciao!', 'it'], ['Hallo!', 'de'], ['こんにちは', 'ja']]

function LanguageRibbon() {
  return (
    <div className="language-ribbon" aria-hidden="true">
      <div className="ribbon-track">
        {[...greetings, ...greetings].map(([word, lang], index) =>
          <span className="ribbon-item" key={index}><span lang={lang}>{word}</span><span className="ribbon-star">✳</span></span>
        )}
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-layout">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker"><span />Escola de idiomas</p>
            <h1 id="hero-title">O mundo <br />começa com <br /><em>um olá.</em></h1>
            <p className="hero-description">Aprenda um novo idioma com conversas reais, trocas culturais e aulas online ao vivo.</p>
            <a className="button button--yellow" href="#idiomas"><Icon name="globe" />Explorar idiomas</a>
          </div>
          <div className="hero-art">
            <div className="photo-mat">
              <img className="hero-photo" src="/images/conversa.webp" width="1448" height="1086"
                fetchPriority="high" alt="Dois estudantes conversam à mesa de um café ao ar livre." />
            </div>
            <div className="sticker sticker--hola" aria-hidden="true" lang="es">¡Hola!</div>
            <div className="sticker sticker--hello" aria-hidden="true" lang="en">Hello!</div>
            <svg className="photo-rays" aria-hidden="true" viewBox="0 0 60 47" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round">
              <path pathLength="1" d="M7 28 14 7M22 31 39 9M32 41l22-9" />
            </svg>
          </div>
        </div>
      </section>
      <LanguageRibbon />
    </>
  )
}

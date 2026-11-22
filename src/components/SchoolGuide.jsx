import React, { useEffect, useId, useRef, useState } from 'react';
import Brand from './Brand.jsx';
import '../styles/guide.css';

const lessonSteps = [
  {
    label: 'Escutar',
    speaker: 'Barista',
    phrase: 'What can I get for you?',
    translation: 'O que você vai pedir?',
    tip: 'Reconheça a pergunta que abre a conversa, mesmo quando as palavras saem em sequência.',
  },
  {
    label: 'Praticar',
    speaker: 'Cliente',
    phrase: 'Could I have a coffee, please?',
    translation: 'Pode me trazer um café, por favor?',
    tip: 'Troque “coffee” por “tea” e use a mesma estrutura para fazer outro pedido.',
  },
  {
    label: 'Conversar',
    speaker: 'Cliente',
    phrase: 'To go, please.',
    translation: 'Para viagem, por favor.',
    tip: 'O barista pergunta “For here or to go?”. Responda “For here” se quiser ficar no café.',
  },
];

const questions = [
  {
    question: 'Posso começar do zero?',
    answer: 'Sim. Todos os idiomas têm um percurso para iniciantes. Nos detalhes de cada curso você encontra os níveis disponíveis e exemplos do que vai praticar.',
  },
  {
    question: 'Como funcionam as aulas?',
    answer: 'As aulas são online e ao vivo. Você escuta diálogos, ensaia expressões e conversa com o professor em situações como pedir comida, planejar uma viagem e conhecer alguém.',
  },
  {
    question: 'Quanto tempo dura a aula experimental?',
    answer: 'A aula experimental tem 30 minutos. No agendamento você escolhe o idioma e vê os horários disponíveis no fuso do seu dispositivo.',
  },
  {
    question: 'O que acontece quando eu agendo?',
    answer: 'Este site é uma demonstração. A confirmação aparece na tela e os dados ficam salvos apenas neste navegador. O horário escolhido sai da lista de opções para aquele idioma.',
  },
];

function PhraseAudio({ phrase }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [feedback, setFeedback] = useState('');
  const active = useRef(null);

  useEffect(() => () => {
    if (active.current) {
      active.current.onend = null;
      active.current.onerror = null;
      window.speechSynthesis.cancel();
    }
  }, []);

  function listen() {
    const voice = new SpeechSynthesisUtterance(phrase);
    voice.lang = 'en-US';
    voice.rate = 0.88;
    voice.onend = () => { active.current = null; setFeedback(''); };
    voice.onerror = () => {
      active.current = null;
      setFeedback('A voz em inglês está indisponível neste navegador.');
    };
    active.current = voice;
    setFeedback('Reproduzindo…');
    window.speechSynthesis.speak(voice);
  }

  if (!supported) return null;
  return (
    <div className="guide-audio">
      <button type="button" disabled={feedback === 'Reproduzindo…'} onClick={listen}>
        <span aria-hidden="true" className="guide-audio__play" /> Ouvir em inglês
      </button>
      <span role="status">{feedback}</span>
    </div>
  );
}

function LessonPreview() {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabList = useRef(null);

  function moveFocus(event, index) {
    const last = lessonSteps.length - 1;
    const destinations = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const nextIndex = destinations[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    setSelected(nextIndex);
    tabList.current.querySelectorAll('[role="tab"]')[nextIndex].focus();
  }

  return (
    <div className="guide-lesson">
      <div className="guide-lesson__tabs" role="tablist" aria-label="Etapas da atividade" ref={tabList}>
        {lessonSteps.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            id={id + '-tab-' + index}
            aria-selected={selected === index}
            aria-controls={id + '-panel-' + index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => moveFocus(event, index)}
          >{item.label}</button>
        ))}
      </div>
      {lessonSteps.map((item, index) => (
        <div
          key={item.label}
          role="tabpanel"
          id={id + '-panel-' + index}
          aria-labelledby={id + '-tab-' + index}
          hidden={selected !== index}
          tabIndex={0}
          className="guide-lesson__panel"
        >
          <p className="guide-lesson__speaker">{item.speaker}</p>
          <p className="guide-lesson__phrase" lang="en">{item.phrase}</p>
          <p className="guide-lesson__translation">{item.translation}</p>
          {selected === index && <PhraseAudio phrase={item.phrase} />}
          <p className="guide-lesson__tip">{item.tip}</p>
        </div>
      ))}
    </div>
  );
}

export default function SchoolGuide({ onTrial }) {
  return (
    <>
      <section id="metodo" className="school-guide" aria-labelledby="guide-heading">
        <div className="container guide-layout">
          <div className="guide-intro">
            <p className="eyebrow">Nosso método</p>
            <h2 id="guide-heading">Da escuta <br />à conversa.</h2>
            <p className="guide-intro__copy">
              Um pedido em um café já rende uma aula de inglês. Explore três maneiras de praticar a mesma conversa.
            </p>
          </div>
          <LessonPreview />
        </div>
      </section>
      <section id="duvidas" className="school-faq" aria-labelledby="faq-heading">
        <div className="container faq-layout">
          <h2 id="faq-heading">Dúvidas <br />frequentes.</h2>
          <div>
            {questions.map(({ question, answer }) => (
              <details key={question} name="perguntas-verbo" className="school-faq__item">
                <summary>{question}<span aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <footer className="guide-footer">
        <div className="container guide-footer__row">
          <Brand />
          <div className="guide-footer__links">
            <a href="#inicio">Voltar ao início</a>
            <button type="button" className="button button--blue" onClick={() => onTrial()}>Agendar aula experimental</button>
          </div>
        </div>
      </footer>
    </>
  );
}

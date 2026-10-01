// Catalog of the tools featured in the /showcase cinematic deck.
// Each entry carries its own palette so the "stills" (ToolArt) read as
// different shots of the same film, like the episode frames in the reference.

export type ToolArtKind =
  | 'lyrics'
  | 'questions'
  | 'stories'
  | 'vocabulary'
  | 'livetalk'
  | 'picture'
  | 'translator'
  | 'dictation'
  | 'vocabchat'
  | 'cancionero';

export interface ShowcaseTool {
  id: ToolArtKind;
  name: string;
  /** Short name for bubbles / circles. */
  short: string;
  tagline: string;
  description: string;
  href: string;
  /** Three highlight features shown in the spotlight slide. */
  features: [string, string, string];
  /** Gradient stops used by the art + glows. */
  palette: { from: string; via: string; to: string; glow: string };
}

export const SHOWCASE_TOOLS: ShowcaseTool[] = [
  {
    id: 'lyrics',
    name: 'Lyrics',
    short: 'Lyrics',
    tagline: 'Aprende cantando',
    description:
      'Letras sincronizadas con el video, modo tipeo con WPM, desglose alemán línea por línea y una grabadora para cantar y escucharte.',
    href: '/lyrics',
    features: ['Letra sincronizada', 'Modo tipeo WPM', 'Cantar y grabarme'],
    palette: { from: '#1e1b4b', via: '#7e22ce', to: '#f472b6', glow: '#f0abfc' },
  },
  {
    id: 'questions',
    name: 'Question Generator',
    short: 'Questions',
    tagline: 'Nunca te quedes sin tema',
    description:
      'Preguntas de conversación por nivel y por tema, generadas con IA, con modo pronunciación para responder en voz alta.',
    href: '/question-generator',
    features: ['Por nivel CEFR', 'Temas infinitos', 'Responde con tu voz'],
    palette: { from: '#0c1445', via: '#2563eb', to: '#22d3ee', glow: '#a5f3fc' },
  },
  {
    id: 'stories',
    name: 'German Short Stories',
    short: 'Stories',
    tagline: 'Lee alemán de verdad',
    description:
      'Historias graduadas de A1 a C1 con lector interactivo, vocabulario, flashcards, desglose gramatical y shadowing.',
    href: '/german-short-stories',
    features: ['Lector interactivo', 'Desglose gramatical', 'Shadowing'],
    palette: { from: '#1c1003', via: '#b45309', to: '#fcd34d', glow: '#fde68a' },
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    short: 'Vocabulary',
    tagline: 'Palabras que se quedan',
    description:
      'Tu vocabulario guardado desde cualquier app, con repaso espaciado, listas por nivel y juegos para fijarlo para siempre.',
    href: '/vocabulary',
    features: ['Repaso espaciado', 'Guardado en un clic', 'Juegos de memoria'],
    palette: { from: '#022c22', via: '#059669', to: '#a3e635', glow: '#bbf7d0' },
  },
  {
    id: 'livetalk',
    name: 'Live Talk AI',
    short: 'Live Talk',
    tagline: 'Habla con alguien, siempre',
    description:
      'Chats y llamadas de voz con personajes IA que te escuchan, te corrigen con naturalidad y repiten lo que dijiste antes de responder.',
    href: '/live-talk',
    features: ['Llamadas de voz', 'Grupos tipo Telegram', 'Correcciones suaves'],
    palette: { from: '#1e0b3a', via: '#6d28d9', to: '#c084fc', glow: '#e9d5ff' },
  },
  {
    id: 'picture',
    name: 'Picture Mode',
    short: 'Picture',
    tagline: 'Describe lo que ves',
    description:
      'Elige una escena de película o sube tu foto: la IA la mira contigo, te da vocabulario y te guía a describirla con tus palabras.',
    href: '/picturemode',
    features: ['Visión con IA', 'Escenas de cine', 'Descripción guiada'],
    palette: { from: '#2a0a12', via: '#e11d48', to: '#fb923c', glow: '#fecdd3' },
  },
  {
    id: 'translator',
    name: 'Live Translator',
    short: 'Translator',
    tagline: 'Traduce mientras hablas',
    description:
      'Traducción en tiempo real mientras conversas, con chats que puedes reabrir y palabras guardadas directo a tu repaso.',
    href: '/live-translator',
    features: ['Tiempo real', 'Chats reabribles', 'Palabras a SRS'],
    palette: { from: '#071a2e', via: '#0284c7', to: '#818cf8', glow: '#bae6fd' },
  },
  {
    id: 'dictation',
    name: "Nicos Weg",
    short: 'Nicos Weg',
    tagline: 'Escucha. Escribe. Entiende.',
    description:
      'Dictados sobre video con subtítulos, transcripción y el desglose gramatical de cada frase que escuchas.',
    href: '/dictation',
    features: ['Video + dictado', 'Subtítulos', 'Desglose por frase'],
    palette: { from: '#111827', via: '#0f766e', to: '#5eead4', glow: '#ccfbf1' },
  },
  {
    id: 'vocabchat',
    name: 'Vocab Chat',
    short: 'Vocab Chat',
    tagline: 'Practica con Mia y Leo',
    description:
      'Conversaciones con avatares animados que usan tus listas B2, C1 y C2 y te leen cada respuesta en voz alta.',
    href: '/vocab-chat',
    features: ['Avatares animados', 'Listas B2 · C1 · C2', 'Voz natural'],
    palette: { from: '#1a0b2e', via: '#db2777', to: '#a78bfa', glow: '#fbcfe8' },
  },
  {
    id: 'cancionero',
    name: 'Cancionero',
    short: 'Cancionero',
    tagline: 'Tu songbook con acordes',
    description:
      'Más de cien canciones con acordes, capo y transposición, y un reproductor de acordes para tocar sin perderte.',
    href: '/cancionero',
    features: ['Acordes y capo', 'Transposición', 'Chord Player'],
    palette: { from: '#1f0f00', via: '#c2410c', to: '#facc15', glow: '#fed7aa' },
  },
];

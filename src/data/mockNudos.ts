import {
  filterNudos,
  type Nudo,
  type NudoFilter,
} from "../../shared/nudo";

export type { Nudo, NudoFilter, ExportPeriod } from "../../shared/nudo";
export { filterNudos };

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_NUDOS: Nudo[] = [
  {
    id: "nudo-1",
    date: daysAgo(0),
    title: "Ansiedad por la reunión de evaluación",
    emotion: "Ansiedad",
    summary:
      "Conversación sobre la presión de presentar un proyecto ante el equipo y el miedo a ser percibido como un fraude.",
    excerpt: "Situación de ansiedad anticipatoria antes de una reunión de evaluación laboral.",
    abc: {
      antecedent:
        "El jefe anunció que mañana debo presentar el proyecto delante de todo el equipo.",
      belief:
        '"Voy a hacer el ridículo y todos van a ver que no sé lo que hago." Revisión compulsiva de la presentación hasta altas horas.',
      consequence:
        "Nudo en el estómago, insomnio y sensación de agotamiento. Alivio momentáneo al evitar pensar en ello, pero más ansiedad al día siguiente.",
    },
    alternativeThought:
      "He trabajado el proyecto con esfuerzo. Si la presentación no sale perfecta, puedo aprender y corregir sin que eso defina mi valía.",
  },
  {
    id: "nudo-2",
    date: daysAgo(3),
    title: "Discusión con mi pareja",
    emotion: "Tristeza",
    summary:
      "Desahogo tras una discusión por mensajes. Sensación de no ser escuchado y de culparse por reaccionar mal.",
    excerpt: "Conflicto por mensajes cuando llegué tarde a casa sin avisar.",
    abc: {
      antecedent:
        "Llegué tarde a casa sin avisar y mi pareja me escribió varios mensajes molestos.",
      belief:
        '"Siempre lo estropeo todo." Me quedé en silencio y evité responder durante horas.',
      consequence:
        "Tristeza profunda y distancia emocional durante la noche. Dificultad para conciliar el sueño.",
    },
    alternativeThought:
      "Puedo reconocer mi parte sin convertir un error puntual en una etiqueta sobre quién soy.",
  },
  {
    id: "nudo-3",
    date: daysAgo(12),
    title: "Comparación en redes sociales",
    emotion: "Culpa",
    summary:
      "Rumiación tras ver publicaciones de conocidos que parecen tener todo bajo control mientras yo me siento estancado.",
    excerpt: "Scroll nocturno en redes que disparó pensamientos de comparación.",
    abc: {
      antecedent:
        "Antes de dormir, revisé redes sociales y vi a varios conocidos celebrando logros profesionales.",
      belief:
        '"Todos avanzan menos yo." Me reproché no haber hecho más ese día y dejé el móvil encendido.',
      consequence:
        "Culpa y autoexigencia. Menos descanso y ánimo bajo a la mañana siguiente.",
    },
    alternativeThought:
      "Lo que veo en redes es una versión editada. Mi ritmo no tiene por qué ser el de los demás.",
  },
  {
    id: "nudo-4",
    date: daysAgo(25),
    title: "Miedo a hablar en grupo",
    emotion: "Vergüenza",
    summary:
      "Episodio en una clase grupal donde evité participar por miedo a que notaran mi nerviosismo.",
    excerpt: "Clase grupal donde el profesor pidió voluntarios para exponer.",
    abc: {
      antecedent:
        "En clase, el profesor pidió voluntarios para exponer un tema delante de los compañeros.",
      belief:
        '"Van a notar que me tiembla la voz." Bajé la mirada y no levanté la mano.',
      consequence:
        "Alivio inmediato al no exponerme, pero frustración y vergüenza al salir de clase.",
    },
    alternativeThought:
      "Muchas personas sienten nervios al hablar en público. Practicar en un entorno seguro puede ayudarme.",
  },
];

export function getNudoById(id: string): Nudo | undefined {
  return MOCK_NUDOS.find((n) => n.id === id);
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

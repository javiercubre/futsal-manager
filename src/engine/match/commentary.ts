/**
 * Match Commentary System
 *
 * Generates dynamic commentary for match events in multiple languages.
 * Supports English, Portuguese, and Spanish.
 */

import type { MatchEvent, MatchEventType } from '@/types';
import type { MatchSimulationState } from './types';

type Language = 'en' | 'pt' | 'es';

// Commentary templates for each event type
const commentaryTemplates: Record<MatchEventType, Record<Language, string[]>> = {
  goal: {
    en: [
      "GOAL! {player} scores! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "It's in! {player} finds the net!",
      "What a finish by {player}! The crowd goes wild!",
      "{player} makes no mistake! GOAL!",
      "Clinical finish from {player}!",
      "That's a brilliant goal from {player}!",
    ],
    pt: [
      "GOLO! {player} marca! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "Está lá dentro! {player} marca!",
      "Que finalização de {player}! O público vai ao delírio!",
      "{player} não falha! GOLO!",
      "Finalização clínica de {player}!",
      "Que golaço de {player}!",
    ],
    es: [
      "¡GOL! ¡{player} marca! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "¡Está dentro! ¡{player} anota!",
      "¡Qué definición de {player}! ¡La afición enloquece!",
      "¡{player} no falla! ¡GOL!",
      "¡Definición clínica de {player}!",
      "¡Golazo de {player}!",
    ],
  },

  assist: {
    en: [
      "Assisted by {player}",
      "Great pass from {player} to set up the goal",
      "{player} with the assist",
    ],
    pt: [
      "Assistência de {player}",
      "Grande passe de {player} para o golo",
      "{player} com a assistência",
    ],
    es: [
      "Asistencia de {player}",
      "Gran pase de {player} para el gol",
      "{player} con la asistencia",
    ],
  },

  shot: {
    en: [
      "{player} shoots!",
      "{player} tries his luck!",
      "{player} lets fly!",
      "Shot from {player}!",
      "{player} goes for goal!",
    ],
    pt: [
      "{player} remata!",
      "{player} tenta a sua sorte!",
      "{player} arrisca!",
      "Remate de {player}!",
      "{player} tenta o golo!",
    ],
    es: [
      "¡{player} dispara!",
      "¡{player} prueba suerte!",
      "¡{player} intenta!",
      "¡Tiro de {player}!",
      "¡{player} va a por el gol!",
    ],
  },

  shot_on_target: {
    en: [
      "Good effort from {player}!",
      "{player}'s shot tests the goalkeeper!",
      "That one was heading in!",
    ],
    pt: [
      "Boa tentativa de {player}!",
      "O remate de {player} obriga o guarda-redes a trabalhar!",
      "Essa ia para golo!",
    ],
    es: [
      "¡Buen intento de {player}!",
      "¡El disparo de {player} exige al portero!",
      "¡Esa iba adentro!",
    ],
  },

  save: {
    en: [
      "Great save by {player}!",
      "{player} denies the shot!",
      "Brilliant stop from {player}!",
      "What a save!",
      "{player} keeps his team in it!",
    ],
    pt: [
      "Grande defesa de {player}!",
      "{player} nega o golo!",
      "Defesa brilhante de {player}!",
      "Que defesa!",
      "{player} mantém a sua equipa viva!",
    ],
    es: [
      "¡Gran parada de {player}!",
      "¡{player} evita el gol!",
      "¡Atajada brillante de {player}!",
      "¡Qué parada!",
      "¡{player} mantiene vivo a su equipo!",
    ],
  },

  foul: {
    en: [
      "Foul by {player}",
      "{player} brings down his opponent",
      "Free kick after a foul by {player}",
      "{player} commits a foul",
    ],
    pt: [
      "Falta de {player}",
      "{player} derruba o adversário",
      "Livre após falta de {player}",
      "{player} comete falta",
    ],
    es: [
      "Falta de {player}",
      "{player} derriba al rival",
      "Tiro libre tras falta de {player}",
      "{player} comete falta",
    ],
  },

  yellow_card: {
    en: [
      "Yellow card for {player}!",
      "{player} is booked!",
      "The referee shows yellow to {player}",
      "{player} goes into the book",
    ],
    pt: [
      "Cartão amarelo para {player}!",
      "{player} é admoestado!",
      "O árbitro mostra amarelo a {player}",
      "{player} vai para o livro de advertências",
    ],
    es: [
      "¡Tarjeta amarilla para {player}!",
      "¡{player} es amonestado!",
      "El árbitro muestra amarilla a {player}",
      "{player} va al libro de amonestaciones",
    ],
  },

  red_card: {
    en: [
      "RED CARD! {player} is sent off!",
      "{player} sees red!",
      "The referee shows a straight red to {player}!",
      "{player} is dismissed!",
    ],
    pt: [
      "CARTÃO VERMELHO! {player} é expulso!",
      "{player} vê vermelho!",
      "O árbitro mostra vermelho direto a {player}!",
      "{player} é expulso do jogo!",
    ],
    es: [
      "¡TARJETA ROJA! ¡{player} es expulsado!",
      "¡{player} ve la roja!",
      "¡El árbitro muestra roja directa a {player}!",
      "¡{player} es expulsado!",
    ],
  },

  second_yellow: {
    en: [
      "Second yellow! {player} is sent off!",
      "{player} picks up a second booking and is off!",
      "That's two yellows and a red for {player}!",
    ],
    pt: [
      "Segundo amarelo! {player} é expulso!",
      "{player} recebe o segundo cartão e sai!",
      "São dois amarelos e um vermelho para {player}!",
    ],
    es: [
      "¡Segunda amarilla! ¡{player} es expulsado!",
      "¡{player} recibe la segunda amarilla y se va!",
      "¡Son dos amarillas y una roja para {player}!",
    ],
  },

  substitution: {
    en: [
      "Substitution: {player} comes on",
      "Change for {team}: {player} enters the court",
      "{player} is brought on",
    ],
    pt: [
      "Substituição: {player} entra",
      "Alteração no {team}: {player} entra em campo",
      "{player} é chamado a entrar",
    ],
    es: [
      "Sustitución: {player} entra",
      "Cambio en {team}: {player} entra a la cancha",
      "{player} es traído al juego",
    ],
  },

  timeout: {
    en: [
      "{team} calls a timeout",
      "Timeout for {team}",
      "{team} takes their timeout",
    ],
    pt: [
      "{team} pede tempo",
      "Tempo para {team}",
      "{team} usa o seu tempo",
    ],
    es: [
      "{team} pide tiempo muerto",
      "Tiempo muerto para {team}",
      "{team} usa su tiempo",
    ],
  },

  penalty: {
    en: [
      "PENALTY! {player} steps up...",
      "Penalty kick for {team}!",
      "{player} places the ball on the spot...",
    ],
    pt: [
      "PENÁLTI! {player} vai bater...",
      "Penálti para {team}!",
      "{player} coloca a bola na marca...",
    ],
    es: [
      "¡PENALTI! {player} se prepara...",
      "¡Penalti para {team}!",
      "{player} coloca el balón en el punto...",
    ],
  },

  penalty_saved: {
    en: [
      "SAVED! {player} stops the penalty!",
      "The goalkeeper guessed right! Penalty saved!",
      "{player} is the hero! Penalty saved!",
    ],
    pt: [
      "DEFESA! {player} defende o penálti!",
      "O guarda-redes acertou! Penálti defendido!",
      "{player} é o herói! Penálti defendido!",
    ],
    es: [
      "¡PARADA! ¡{player} detiene el penalti!",
      "¡El portero acertó! ¡Penalti detenido!",
      "¡{player} es el héroe! ¡Penalti detenido!",
    ],
  },

  penalty_missed: {
    en: [
      "He's missed it! The penalty goes wide!",
      "What a miss! {player} puts it over!",
      "The penalty is wasted!",
    ],
    pt: [
      "Falhou! O penálti vai para fora!",
      "Que falhanço! {player} manda por cima!",
      "O penálti é desperdiçado!",
    ],
    es: [
      "¡Lo ha fallado! ¡El penalti va fuera!",
      "¡Qué fallo! ¡{player} lo manda afuera!",
      "¡El penalti se desperdicia!",
    ],
  },

  accumulated_foul_penalty: {
    en: [
      "Accumulated foul penalty! That's the 6th team foul!",
      "Penalty from 10 meters! Too many fouls this half!",
      "The accumulated fouls catch up! Penalty kick!",
    ],
    pt: [
      "Penálti por faltas acumuladas! É a 6ª falta da equipa!",
      "Penálti dos 10 metros! Demasiadas faltas nesta parte!",
      "As faltas acumuladas cobram o seu preço! Penálti!",
    ],
    es: [
      "¡Penalti por faltas acumuladas! ¡Es la 6ª falta del equipo!",
      "¡Penalti desde los 10 metros! ¡Demasiadas faltas en este tiempo!",
      "¡Las faltas acumuladas pasan factura! ¡Penalti!",
    ],
  },

  period_end: {
    en: [
      "The referee blows the whistle. End of the {period}.",
      "That's {period}!",
      "The {period} comes to an end.",
    ],
    pt: [
      "O árbitro apita. Fim da {period}.",
      "É o fim da {period}!",
      "A {period} chega ao fim.",
    ],
    es: [
      "El árbitro pita. Fin del {period}.",
      "¡Es el final del {period}!",
      "El {period} llega a su fin.",
    ],
  },

  match_end: {
    en: [
      "FULL TIME! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "The final whistle! It ends {homeGoals}-{awayGoals}!",
      "That's all! The match is over!",
    ],
    pt: [
      "FINAL DO JOGO! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "O apito final! Termina {homeGoals}-{awayGoals}!",
      "É tudo! O jogo terminou!",
    ],
    es: [
      "¡FINAL DEL PARTIDO! {homeTeam} {homeGoals} - {awayGoals} {awayTeam}",
      "¡El pitido final! ¡Termina {homeGoals}-{awayGoals}!",
      "¡Es todo! ¡El partido ha terminado!",
    ],
  },
};

// Period names for translations
const periodNames: Record<Language, Record<string, string>> = {
  en: { '1': 'first half', '2': 'second half' },
  pt: { '1': 'primeira parte', '2': 'segunda parte' },
  es: { '1': 'primer tiempo', '2': 'segundo tiempo' },
};

/**
 * Generate commentary for a match event
 */
export function generateCommentary(
  event: MatchEvent,
  state: MatchSimulationState,
  language: Language = 'en'
): string {
  const templates = commentaryTemplates[event.type]?.[language];
  if (!templates || templates.length === 0) {
    return event.description || '';
  }

  // Pick a random template
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Find player name
  let playerName = '';
  if (event.playerId) {
    const homePlayer = state.home.players.find(p => p.playerId === event.playerId);
    const awayPlayer = state.away.players.find(p => p.playerId === event.playerId);
    playerName = homePlayer?.player.name || awayPlayer?.player.name || 'Unknown';
  }

  // Determine which team
  const team = event.teamId === state.home.team.id ? state.home.team : state.away.team;

  // Replace placeholders
  const commentary = template
    .replace(/{player}/g, playerName)
    .replace(/{team}/g, team.shortName)
    .replace(/{homeTeam}/g, state.home.team.shortName)
    .replace(/{awayTeam}/g, state.away.team.shortName)
    .replace(/{homeGoals}/g, state.homeGoals.toString())
    .replace(/{awayGoals}/g, state.awayGoals.toString())
    .replace(/{period}/g, periodNames[language][state.period.toString()] || '');

  return commentary;
}

/**
 * Generate ambient commentary for quiet moments
 */
export function generateAmbientCommentary(
  state: MatchSimulationState,
  language: Language = 'en'
): string | null {
  // Only generate occasionally
  if (Math.random() > 0.02) return null;

  const ambientTemplates: Record<Language, string[]> = {
    en: [
      "{possessionTeam} maintaining possession...",
      "Good passing from {possessionTeam}.",
      "The ball is moving quickly around the court.",
      "{possessionTeam} looking for an opening.",
      "Both teams pressing hard.",
      "High tempo here!",
      "Great defensive work from {defendingTeam}.",
      "The crowd is really getting into this!",
    ],
    pt: [
      "{possessionTeam} mantém a posse de bola...",
      "Bom passe do {possessionTeam}.",
      "A bola move-se rapidamente pelo campo.",
      "{possessionTeam} procura uma abertura.",
      "Ambas as equipas pressionam forte.",
      "Ritmo alto aqui!",
      "Grande trabalho defensivo do {defendingTeam}.",
      "O público está mesmo envolvido nisto!",
    ],
    es: [
      "{possessionTeam} mantiene la posesión...",
      "Buen pase de {possessionTeam}.",
      "El balón se mueve rápidamente por la cancha.",
      "{possessionTeam} busca una apertura.",
      "Ambos equipos presionan fuerte.",
      "¡Alto ritmo aquí!",
      "Gran trabajo defensivo de {defendingTeam}.",
      "¡La afición está muy metida en esto!",
    ],
  };

  const templates = ambientTemplates[language];
  const template = templates[Math.floor(Math.random() * templates.length)];

  const possessionTeam = state.ball.possessionTeam === 'home'
    ? state.home.team.shortName
    : state.away.team.shortName;

  const defendingTeam = state.ball.possessionTeam === 'home'
    ? state.away.team.shortName
    : state.home.team.shortName;

  return template
    .replace(/{possessionTeam}/g, possessionTeam)
    .replace(/{defendingTeam}/g, defendingTeam);
}

/**
 * Get excitement level based on match situation
 */
export function getExcitementLevel(state: MatchSimulationState): 'low' | 'medium' | 'high' | 'extreme' {
  const scoreDiff = Math.abs(state.homeGoals - state.awayGoals);
  const isLateGame = state.minute > 17;
  const isCloseGame = scoreDiff <= 1;

  if (isLateGame && isCloseGame) return 'extreme';
  if (isLateGame || isCloseGame) return 'high';
  if (scoreDiff >= 3) return 'low';
  return 'medium';
}

/**
 * Get score context description
 */
export function getScoreContext(
  state: MatchSimulationState,
  language: Language = 'en'
): string {
  const diff = state.homeGoals - state.awayGoals;

  const contexts: Record<Language, Record<string, string>> = {
    en: {
      tied: "The scores are level",
      homeWinning: `${state.home.team.shortName} leading`,
      awayWinning: `${state.away.team.shortName} leading`,
      homeDominating: `${state.home.team.shortName} in complete control`,
      awayDominating: `${state.away.team.shortName} running away with it`,
    },
    pt: {
      tied: "O jogo está empatado",
      homeWinning: `${state.home.team.shortName} a vencer`,
      awayWinning: `${state.away.team.shortName} a vencer`,
      homeDominating: `${state.home.team.shortName} em controlo total`,
      awayDominating: `${state.away.team.shortName} a golear`,
    },
    es: {
      tied: "El partido está empatado",
      homeWinning: `${state.home.team.shortName} ganando`,
      awayWinning: `${state.away.team.shortName} ganando`,
      homeDominating: `${state.home.team.shortName} en control total`,
      awayDominating: `${state.away.team.shortName} goleando`,
    },
  };

  const ctx = contexts[language];

  if (diff === 0) return ctx.tied;
  if (diff > 3) return ctx.homeDominating;
  if (diff < -3) return ctx.awayDominating;
  if (diff > 0) return ctx.homeWinning;
  return ctx.awayWinning;
}

export default {
  generateCommentary,
  generateAmbientCommentary,
  getExcitementLevel,
  getScoreContext,
};

import type { ComponentType } from "react";
import { CrossLesson, F2LIntuitiveLesson, IntroLesson } from "./foundations";
import { FirstSolvesLesson, OLL2Lesson, PLL2Lesson } from "./lastLayer";
import { LBL_LESSONS } from "./lbl";
import { AdvancedLesson, F2LFullLesson, OLLFullLesson, PLLFullLesson } from "./advanced";

export interface Lesson {
  id: string;
  title: string;
  short: string;
  description: string;
  phase: string;
  color: string;
  minutes: number;
  badge?: string;
  component: ComponentType;
}

export const LESSONS: Lesson[] = [
  {
    id: "introduction", title: "Le CFOP en un coup d'œil", short: "Intro", phase: "Fondations", color: "var(--accent)", minutes: 5,
    description: "Les 4 étapes de la méthode, l'orientation du cube et le parcours à suivre.", component: IntroLesson,
  },
  {
    id: "croix", title: "La croix efficace", short: "C", phase: "Fondations", color: "var(--c-white)", minutes: 15,
    description: "Faire la croix en bas, en 8 mouvements maximum, et la planifier pendant l'inspection.", badge: "Exercice intégré", component: CrossLesson,
  },
  {
    id: "f2l-intuitif", title: "F2L intuitif", short: "F2L", phase: "Fondations", color: "var(--c-green)", minutes: 25,
    description: "Former des paires coin-arête et les insérer : les 4 cas de base et comment s'y ramener.", badge: "4 cas", component: F2LIntuitiveLesson,
  },
  {
    id: "oll-2-temps", title: "OLL en 2 temps", short: "OLL", phase: "Dernière couche en 2 temps", color: "var(--c-yellow)", minutes: 20,
    description: "La croix jaune (3 cas) puis l'orientation des coins (7 cas).", badge: "10 algos", component: OLL2Lesson,
  },
  {
    id: "pll-2-temps", title: "PLL en 2 temps", short: "PLL", phase: "Dernière couche en 2 temps", color: "var(--c-red)", minutes: 20,
    description: "Placer les coins (2 cas) puis les arêtes (4 cas).", badge: "6 algos", component: PLL2Lesson,
  },
  {
    id: "premieres-resolutions", title: "Premières résolutions chronométrées", short: "⏱", phase: "Dernière couche en 2 temps", color: "var(--c-blue)", minutes: 10,
    description: "Mélange officiel, inspection, pénalités, ao5 et ao12 : mesurer ses progrès.", component: FirstSolvesLesson,
  },
  {
    id: "f2l-avance", title: "F2L avancé : les 41 cas", short: "F2L+", phase: "CFOP complet", color: "var(--c-green)", minutes: 60,
    description: "Une solution efficace pour chaque configuration d'une paire.", badge: "41 cas", component: F2LFullLesson,
  },
  {
    id: "oll-complete", title: "OLL complète", short: "OLL+", phase: "CFOP complet", color: "var(--c-yellow)", minutes: 120,
    description: "Orienter la dernière couche en un seul algorithme.", badge: "57 cas", component: OLLFullLesson,
  },
  {
    id: "pll-complete", title: "PLL complète", short: "PLL+", phase: "CFOP complet", color: "var(--c-orange)", minutes: 60,
    description: "Finir le cube en un seul algorithme, quelle que soit la permutation.", badge: "21 cas", component: PLLFullLesson,
  },
  {
    id: "techniques-avancees", title: "Techniques avancées", short: "Pro", phase: "Aller plus loin", color: "var(--accent-2)", minutes: 15,
    description: "Lookahead, finger tricks, X-cross, AUF : gagner en fluidité.", component: AdvancedLesson,
  },
];

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

// ---------------------------------------------------------------------------
// Parcours
// ---------------------------------------------------------------------------


export interface Track {
  id: "cfop" | "lbl";
  /** Chemin de base des pages (sans slash final). */
  base: string;
  eyebrow: string;
  title: string;
  intro: string;
  lessons: Lesson[];
}

export const CFOP_TRACK: Track = {
  id: "cfop",
  base: "/parcours",
  eyebrow: "Parcours CFOP",
  title: "Apprendre le CFOP, étape par étape",
  intro: "Un parcours progressif : on commence par des versions simplifiées de chaque étape, puis on passe à la méthode complète. Tout reste accessible librement, l'ordre est simplement celui que nous conseillons.",
  lessons: LESSONS,
};

export const LBL_TRACK: Track = {
  id: "lbl",
  base: "/debutant",
  eyebrow: "Méthode débutant",
  title: "Résoudre le cube pour la première fois",
  intro: "La méthode couche par couche (LBL) : 7 étapes et seulement 7 algorithmes courts pour résoudre le Rubik's Cube. Idéale si vous n'avez jamais terminé un cube, et parfaite pour préparer le CFOP.",
  lessons: LBL_LESSONS,
};

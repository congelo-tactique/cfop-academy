import type { Color, CubeState, Sticker, Vec3 } from "./cube";
import type { MaskId } from "../data/types";

export type DisplayColor = Color | "X";

export const STICKER_HEX: Record<DisplayColor, string> = {
  W: "#f3f4f1",
  Y: "#ffd43b",
  G: "#16b45b",
  B: "#2f6bed",
  R: "#e0322f",
  O: "#ff7b1c",
  X: "#555b68",
};

export const COLOR_NAME_FR: Record<Color, string> = {
  W: "blanc",
  Y: "jaune",
  G: "vert",
  B: "bleu",
  R: "rouge",
  O: "orange",
};

const isEdge = (p: Vec3) => p.filter((v) => v !== 0).length === 2;
const isCorner = (p: Vec3) => p.filter((v) => v !== 0).length === 3;
const isCenter = (p: Vec3) => p.filter((v) => v !== 0).length === 1;

/** Couleur affichée d'un sticker selon le masque (X = grisé). */
export function maskedColor(s: Sticker, mask: MaskId = "full"): DisplayColor {
  const top = s.home[1] === 1;
  switch (mask) {
    case "full":
    case "pll":
      return s.color;
    case "oll":
      if (top) return s.homeFace === "U" ? s.color : "X";
      return s.color;
    case "oll-edges":
      if (top) {
        if (isCorner(s.home)) return "X";
        return s.homeFace === "U" ? s.color : "X";
      }
      return s.color;
    case "pll-corners":
      if (top && isEdge(s.home)) return s.homeFace === "U" ? s.color : "X";
      return s.color;
    case "f2l":
      if (top && !isCenter(s.home)) return "X";
      return s.color;
    case "cross":
      if (isCenter(s.home)) return s.color;
      if (s.home[1] === -1 && isEdge(s.home)) return s.color;
      return "X";
  }
}

export function maskedState(state: CubeState, mask: MaskId): DisplayColor[] {
  return state.map((s) => maskedColor(s, mask));
}

# CFOP Academy

Application web pour apprendre la méthode CFOP (Fridrich) et résoudre le Rubik's Cube plus vite.

## Lancer l'application

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

- **Le plus simple** (Windows) :
  1. double-cliquez sur `Installer les prerequis.bat` : il installe Node.js LTS via `winget` s'il est absent ou trop ancien, puis les dépendances du projet ;
  2. double-cliquez sur `Lancer CFOP Academy.bat` : l'application démarre et le navigateur s'ouvre.
- **En ligne de commande** :

```bash
npm install
npm run dev
```

puis ouvrez http://localhost:5173.

Pour une version optimisée : `npm run build` puis `npm run preview`. Le dossier `dist/` peut aussi être hébergé tel quel sur n'importe quel hébergement statique (GitHub Pages, Netlify…).

## Contenu

| Section | Ce qu'on y trouve |
| --- | --- |
| **Notation** | Faces, prime/double, mouvements larges, tranches M/E/S, rotations x/y/z, lecture d'algorithmes, bac à sable (saisie au clavier possible). |
| **Méthode débutant** | La méthode couche par couche (LBL) en 9 leçons : marguerite et croix blanche, coins blancs, deuxième couche, croix jaune, arêtes et coins jaunes, aide-mémoire. 7 algorithmes, tous animés et vérifiés. |
| **Parcours CFOP** | 10 leçons progressives : vue d'ensemble → croix → F2L intuitif → OLL et PLL en 2 temps → premières résolutions → F2L 41 cas → OLL 57 → PLL 21 → techniques avancées. |
| **Algorithmes** | Bibliothèque des 135 cas (OLL/PLL 2 temps, F2L, OLL, PLL) avec animation 3D, alternatives, algorithme préféré et statut d'apprentissage. |
| **Entraînement** | Chronomètre (inspection WCA, +2/DNF, ao5/ao12/ao100, graphique), trainer d'algorithmes (aléatoire ou répétition espacée, chrono d'exécution, mélange de mise en place), quiz de reconnaissance. Chaque outil s'utilise indépendamment. |
| **Mélangeur** | Mélanges *random-state* (norme WCA) via [cubing.js](https://js.cubing.net/cubing/), aperçu 2D/3D, série de compétition, solution optimale de la croix. |

La progression est enregistrée dans le navigateur (`localStorage`) ; la page **Réglages** permet d'exporter/importer une sauvegarde JSON.

## Orientation

- Résolution : **croix blanche en bas, jaune en haut, vert devant** (orange à droite).
- Mélange : blanc en haut, vert devant (norme WCA), puis `z2`.

## Fiabilité des algorithmes

Tous les algorithmes sont vérifiés mécaniquement par le moteur de cube de l'application :

```bash
npm run verify-algs   # chaque cas : algorithme valide, F2L préservé, alternatives cohérentes, cas tous distincts
npm run check-setup   # les mélanges de mise en place du trainer reproduisent bien les cas
```

Les 41 cas de F2L ont été énumérés et résolus par recherche exhaustive (`scripts/gen-f2l.ts`), leur numérotation est donc propre à l'application.

## Structure

```
src/
  cube/        moteur (état, mouvements, objectifs), rendu three.js, solveur de croix, mélanges
  data/        cas et algorithmes (OLL, PLL, F2L, 2 temps)
  lessons/     contenu des leçons
  pages/       pages de l'application
  components/  cube 3D, lecteur d'algorithmes, schémas 2D, interface
  store/       sauvegarde (zustand + localStorage), répétition espacée
scripts/       génération et vérification des données, pré-assemblage de cubing.js
```

`cubing.js` est pré-assemblé dans `public/vendor/cubing` (automatiquement avant `npm run dev` et `npm run build`) puis chargé par URL : s'il était ré-empaqueté par Vite, ses web workers ne fonctionneraient pas en production.

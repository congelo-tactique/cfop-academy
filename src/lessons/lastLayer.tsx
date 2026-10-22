import { Link } from "react-router-dom";
import { Callout } from "../components/ui";
import { Demo, Practice, SetGallery, StateFigure } from "./kit";

export function OLL2Lesson() {
  return (
    <>
      <p>
        Une fois le F2L terminé, il faut rendre la face du haut entièrement jaune : c'est l'<strong>OLL</strong>. La version
        complète compte 57 cas, mais on peut la faire <strong>en deux temps</strong> avec seulement 10 algorithmes :
        d'abord la croix jaune (orienter les arêtes), puis les coins.
      </p>
      <Callout kind="tip" title="Bonne nouvelle">
        <p>Vous connaissez sûrement déjà certains de ces algorithmes grâce à votre méthode débutant (la croix jaune avec
          <code> F R U R' U' F'</code>, la Sune…). On les range simplement dans le bon ordre.</p>
      </Callout>

      <h2>Étape 1 · La croix jaune</h2>
      <p>On ne regarde que les <strong>arêtes</strong> (les coins sont grisés ci-dessous). Il y a trois situations :</p>
      <ul>
        <li><strong>Ligne</strong> : deux arêtes jaunes opposées. Tenez la ligne à l'horizontale.</li>
        <li><strong>L</strong> : deux arêtes jaunes voisines. Placez le L en haut à gauche.</li>
        <li><strong>Point</strong> : aucune arête jaune. On enchaîne deux algorithmes.</li>
      </ul>
      <SetGallery set="oll2" filter={(id) => ["oll2-line", "oll2-l", "oll2-dot"].includes(id)} />
      <Demo alg="F (R U R' U') F'" mask="oll-edges" view="top" title="Exemple : la ligne">
        <p>Le « trigger » <code>R U R' U'</code> (souvent appelé <em>sexy move</em>) encadré par <code>F</code> et <code>F'</code>.</p>
      </Demo>

      <h2>Étape 2 · Les coins</h2>
      <p>
        La croix jaune est faite. On regarde maintenant les <strong>coins</strong> : combien sont jaunes sur le dessus, et
        où sont les autocollants jaunes sur les côtés.
      </p>
      <ul>
        <li><strong>0 coin jaune dessus</strong> : H (deux paires de phares) ou Pi (phares d'un seul côté).</li>
        <li><strong>1 coin jaune dessus</strong> : Sune ou Anti-Sune (la forme d'un petit poisson).</li>
        <li><strong>2 coins jaunes dessus</strong> : Phares, T (Caméléon) ou Nœud papillon (coins en diagonale).</li>
      </ul>
      <div className="figure-row">
        <StateFigure kind="ll" alg="R U R' U R U2 R'" mask="oll" caption="Sune" />
        <StateFigure kind="ll" alg="R U2 R' U' R U' R'" mask="oll" caption="Anti-Sune" />
        <StateFigure kind="ll" alg="R U2 R2 U' R2 U' R2 U2 R" mask="oll" caption="Pi" />
      </div>
      <SetGallery set="oll2" filter={(id) => !["oll2-line", "oll2-l", "oll2-dot"].includes(id)} />
      <Demo alg="R U R' U R U2 R'" mask="oll" view="top" title="La Sune, l'algorithme le plus célèbre">
        <p>Apprenez-la parfaitement : elle revient partout, y compris dans d'autres algorithmes.</p>
      </Demo>

      <Callout title="Astuce de reconnaissance">
        <p>Regardez les côtés, pas seulement le dessus. Les « phares » (deux autocollants de même couleur aux deux bouts d'un
          côté) sont l'indice le plus rapide pour distinguer H, Pi et Phares.</p>
      </Callout>
      <Practice title="Entraînez l'OLL en 2 temps" text="Commencez par le trainer pour mémoriser, puis passez au quiz pour travailler la reconnaissance." set="oll2" quiz />
    </>
  );
}

export function PLL2Lesson() {
  return (
    <>
      <p>
        La face jaune est faite, il reste à mettre les pièces de la dernière couche à leur place : c'est la
        <strong> PLL</strong>. En deux temps, on place d'abord les coins, puis les arêtes, avec 6 algorithmes.
      </p>

      <h2>Étape 1 · Les coins</h2>
      <p>
        Cherchez des <strong>phares</strong> : deux coins de la même couleur sur un même côté. Trois possibilités :
      </p>
      <ul>
        <li><strong>Phares sur les quatre côtés</strong> : les coins sont déjà bons, passez à l'étape 2 (en alignant avec U).</li>
        <li><strong>Phares sur un seul côté</strong> : placez-les à gauche et faites la <strong>T-perm</strong>.</li>
        <li><strong>Aucun phare</strong> : les coins s'échangent en diagonale, faites la <strong>Y-perm</strong>.</li>
      </ul>
      <SetGallery set="pll2" filter={(id) => ["pll2-adj", "pll2-diag"].includes(id)} />
      <Demo alg="(R U R' U') R' F R2 U' R' U' (R U R' F')" mask="pll-corners" view="top" title="La T-perm">
        <p>Elle échange deux coins voisins (et deux arêtes, ce qui n'est pas grave : l'étape 2 s'en occupe).</p>
      </Demo>

      <h2>Étape 2 · Les arêtes</h2>
      <p>Les coins sont en place. Il reste au plus quatre cas :</p>
      <ul>
        <li><strong>Ua / Ub</strong> : un côté est complet. Mettez-le à l'arrière ; les trois autres arêtes tournent dans un sens ou dans l'autre.</li>
        <li><strong>H</strong> : les arêtes s'échangent avec le côté opposé.</li>
        <li><strong>Z</strong> : les arêtes s'échangent avec un côté voisin.</li>
      </ul>
      <SetGallery set="pll2" filter={(id) => !["pll2-adj", "pll2-diag"].includes(id)} />
      <Demo alg="M2 U M U2 M' U M2" mask="pll" view="top" title="Ua-perm avec la tranche M">
        <p>Les mouvements <code>M</code> se font avec l'annulaire de la main gauche (ou en tirant vers vous avec la droite). Si M vous gêne, utilisez l'alternative en R et U.</p>
      </Demo>

      <Callout kind="tip" title="L'AUF">
        <p>Avant et après chaque algorithme, il faut souvent tourner la face du haut pour bien positionner le cas ou pour
          finir le cube. Ce petit <code>U</code> s'appelle l'<strong>AUF</strong> (Adjust U Face). Avec l'habitude, on
          l'anticipe pendant l'algorithme.</p>
      </Callout>
      <Practice title="Entraînez la PLL en 2 temps" text="Révisez les 6 cas jusqu'à les reconnaître sans réfléchir." set="pll2" quiz />
    </>
  );
}

export function FirstSolvesLesson() {
  return (
    <>
      <p>
        Félicitations : vous avez maintenant un <strong>CFOP complet</strong> ! Croix, F2L intuitif, OLL et PLL en 2 temps.
        Il est temps de mesurer vos progrès avec le chronomètre.
      </p>

      <h2>Comment se déroule une résolution</h2>
      <ol>
        <li><strong>Mélanger</strong> : appliquez le mélange en tenant le cube <strong>blanc en haut, vert devant</strong> (norme WCA).</li>
        <li><strong>Inspecter</strong> (15 s) : retournez le cube (blanc en bas) et planifiez votre croix, voire la première paire.</li>
        <li><strong>Résoudre</strong> : le chrono démarre quand vous relâchez la barre espace, et s'arrête quand vous appuyez à nouveau.</li>
      </ol>
      <Callout kind="warn" title="Règles d'inspection WCA">
        <p>Au-delà de 15 s d'inspection, vous prenez une pénalité de <strong>+2 s</strong>. Au-delà de 17 s, la résolution est
          comptée <strong>DNF</strong> (non terminée). Le chronomètre de l'application applique ces règles automatiquement.</p>
      </Callout>

      <h2>Comprendre ses statistiques</h2>
      <ul>
        <li><strong>ao5</strong> (moyenne de 5) : on retire le meilleur et le pire temps des 5 derniers, et on fait la moyenne des 3 restants. C'est le format des compétitions.</li>
        <li><strong>ao12</strong> : même principe sur 12 temps. C'est un bon indicateur de votre niveau réel.</li>
        <li><strong>Meilleur temps</strong> : agréable, mais beaucoup moins représentatif.</li>
      </ul>

      <h2>Comment progresser maintenant</h2>
      <ul>
        <li>Faites des séries de 12 résolutions et suivez votre ao12.</li>
        <li>Repérez l'étape la plus lente. Au début, c'est presque toujours le <strong>F2L</strong> : travaillez la fluidité plutôt que la vitesse.</li>
        <li>Commencez à apprendre la PLL complète (elle compte peu d'algorithmes et fait gagner beaucoup de temps), puis le F2L avancé et l'OLL complète.</li>
      </ul>
      <div className="figure-row">
        <StateFigure kind="ll" alg="(R U R' U') R' F R2 U' R' U' (R U R' F')" caption="Un cas que vous savez déjà résoudre…" />
      </div>
      <p>
        Les cas des sets complets que vous connaissez déjà (Sune, T-perm, Ua…) sont communs : vous partez donc avec une
        bonne avance. Consultez la <Link to="/algorithmes">bibliothèque d'algorithmes</Link> pour suivre vos statuts.
      </p>
      <Practice title="À vous de jouer" text="Faites au moins une ao12 au chronomètre pour connaître votre point de départ." timer />
    </>
  );
}

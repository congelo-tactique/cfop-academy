import { Link } from "react-router-dom";
import { Callout } from "../components/ui";
import { AlgText } from "../components/AlgText";
import { Demo, Practice, StateFigure } from "./kit";
import { LBL, LBL_DEMOS } from "./lblAlgs";
import type { Lesson } from "./index";

function AlgBox({ name, alg, note }: { name: string; alg: string; note?: string }) {
  return (
    <div className="card flat" style={{ padding: 14 }}>
      <div className="small muted" style={{ fontWeight: 600 }}>{name}</div>
      <AlgText alg={alg} />
      {note && <div className="small muted" style={{ marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function LblIntro() {
  return (
    <>
      <p>
        La <strong>méthode débutant</strong>, aussi appelée méthode « couche par couche » (LBL, pour <em>Layer By Layer</em>),
        résout le cube en 7 étapes simples. Elle demande seulement une poignée d'algorithmes courts : c'est la meilleure
        porte d'entrée avant le CFOP, qui en reprend d'ailleurs la logique.
      </p>

      <h2>Les pièces du cube</h2>
      <ul>
        <li><strong>6 centres</strong> (une couleur) : ils ne bougent jamais les uns par rapport aux autres. Le centre donne la couleur de sa face.</li>
        <li><strong>12 arêtes</strong> (deux couleurs) : entre deux centres.</li>
        <li><strong>8 coins</strong> (trois couleurs) : aux angles.</li>
      </ul>
      <Callout kind="tip" title="L'idée clé">
        <p>On ne résout pas « une face », mais des <strong>pièces</strong> : une arête blanc-vert va toujours entre le centre
          blanc et le centre vert. Le blanc est opposé au jaune, le vert au bleu, le rouge à l'orange.</p>
      </Callout>

      <h2>Les 7 étapes</h2>
      <div className="figure-row">
        <StateFigure mask="cross" caption="1. Croix blanche" />
        <StateFigure mask="first-layer" caption="2. Coins blancs" />
        <StateFigure mask="f2l" caption="3. Deuxième couche" />
        <StateFigure kind="ll" alg={LBL.yellowCross} mask="oll-edges" caption="4. Croix jaune" />
      </div>
      <ol>
        <li><strong>La croix blanche</strong>, construite autour du centre jaune (la « marguerite »).</li>
        <li><strong>Les coins blancs</strong> : la première couche est terminée.</li>
        <li><strong>La deuxième couche</strong> : les 4 arêtes du milieu.</li>
        <li><strong>La croix jaune</strong> sur le dessus.</li>
        <li><strong>Les arêtes jaunes</strong> à leur place.</li>
        <li><strong>Les coins jaunes</strong> à leur place.</li>
        <li><strong>L'orientation des coins jaunes</strong> : le cube est résolu !</li>
      </ol>

      <Callout title="Orientation du cube">
        <p>Pendant toute la méthode, on garde le <strong>jaune en haut et le blanc en bas</strong>. C'est exactement la même
          orientation que pour le CFOP : rien à réapprendre ensuite.</p>
      </Callout>
      <Callout kind="info" title="Prérequis">
        <p>Il suffit de connaître les mouvements R, L, U, D, F, leurs versions prime (') et doubles (2). Si besoin, faites un tour
          par la <Link to="/notation">section Notation</Link>.</p>
      </Callout>
    </>
  );
}

function LblCross() {
  return (
    <>
      <p>
        Première étape : les 4 arêtes blanches. L'astuce des débutants consiste à les rassembler d'abord <strong>autour du
        centre jaune</strong>, comme les pétales d'une fleur : c'est la <strong>marguerite</strong>. Ensuite, on les descend
        une à une vers le bas.
      </p>
      <div className="figure-row">
        <StateFigure kind="ll" setup="F2 R2 B2 L2 U" mask="cross" caption="La marguerite : 4 arêtes blanches autour du jaune" size={140} />
      </div>

      <h2>1. Construire la marguerite</h2>
      <ul>
        <li>Tenez le cube jaune en haut. Cherchez une arête blanche.</li>
        <li>Si elle est en bas ou au milieu, ramenez-la en haut, blanc vers le haut, en tournant la face où elle se trouve (F, R, L ou B).</li>
        <li><strong>Attention</strong> : avant de monter une arête, tournez le haut (U) pour qu'un « pétale » libre se trouve juste au-dessus, sinon vous chasseriez une arête déjà placée.</li>
        <li>Si l'autocollant blanc regarde sur le côté, tournez cette face d'un quart de tour pour amener l'arête dans la couche du milieu, puis montez-la.</li>
      </ul>

      <h2>2. Descendre les arêtes</h2>
      <p>
        Regardez l'autre couleur d'un pétale (sur le côté). Tournez le haut (<code>U</code>) jusqu'à ce qu'elle soit au-dessus
        du centre de la même couleur, puis faites un demi-tour de cette face : l'arête passe en bas, blanc vers le bas.
        Recommencez pour les 4 arêtes.
      </p>
      <Demo setup={LBL_DEMOS.daisy.setup} alg={LBL_DEMOS.daisy.alg} mask="cross" title="De la marguerite à la croix">
        <p>Ici, un seul <code>U'</code> aligne les quatre arêtes avec leur centre ; il ne reste qu'à faire <code>F2</code>, <code>R2</code>, <code>B2</code> et <code>L2</code>.
          En général, on aligne et on descend une arête à la fois.</p>
      </Demo>
      <Callout kind="tip" title="Vérification">
        <p>Retournez le cube : vous devez voir une croix blanche, et chaque arête doit avoir sa deuxième couleur alignée avec le centre de côté.</p>
      </Callout>
    </>
  );
}

function LblCorners() {
  return (
    <>
      <p>
        On place maintenant les 4 coins blancs pour terminer la première couche. Un seul petit algorithme suffit, à répéter :
      </p>
      <AlgBox name="L'algorithme à répéter" alg={LBL.sexy} note="Souvent appelé « sexy move ». À répéter 1, 3 ou 5 fois." />

      <h2>La méthode</h2>
      <ol>
        <li>Trouvez un coin blanc dans la couche du haut. Regardez ses deux autres couleurs (par exemple vert et orange).</li>
        <li>Tournez le haut (<code>U</code>) pour amener ce coin <strong>juste au-dessus de sa place</strong> : entre les centres vert et orange.</li>
        <li>Tournez le cube pour que ce coin soit <strong>devant à droite</strong>.</li>
        <li>Répétez <code>R U R' U'</code> jusqu'à ce que le coin soit en place, blanc vers le bas : 1, 3 ou 5 fois selon son orientation.</li>
      </ol>
      <Demo setup={LBL_DEMOS.corner1.setup} alg={LBL_DEMOS.corner1.alg} mask="first-layer" title="Une seule répétition" />
      <Demo setup={LBL_DEMOS.corner3.setup} alg={LBL_DEMOS.corner3.alg} mask="first-layer" title="Trois répétitions" />
      <Demo setup={LBL_DEMOS.corner5.setup} alg={LBL_DEMOS.corner5.alg} mask="first-layer" title="Cinq répétitions">
        <p>Pas besoin de compter : répétez simplement jusqu'à ce que le coin tombe en place.</p>
      </Demo>

      <h2>Cas particulier : un coin blanc coincé en bas</h2>
      <p>
        Si un coin blanc est déjà en bas mais au mauvais endroit (ou mal tourné), placez-le devant à droite et faites une fois
        <code> R U R' U'</code> : il remonte dans la couche du haut. Vous retombez alors sur le cas normal.
      </p>
      <Callout kind="tip">
        <p>Pendant les répétitions, le reste du cube semble se mélanger : c'est normal, tout se remet en place à la fin.</p>
      </Callout>
    </>
  );
}

function LblMiddle() {
  return (
    <>
      <p>
        La première couche est faite : on la garde en bas. Il faut maintenant placer les 4 arêtes de la couche du milieu
        (celles qui n'ont pas de jaune).
      </p>
      <h2>La méthode</h2>
      <ol>
        <li>Trouvez dans la couche du haut une arête <strong>sans jaune</strong>.</li>
        <li>Tournez le haut pour que la couleur de son côté (face avant) soit au-dessus du centre de la même couleur : l'arête forme un « T » renversé avec le centre.</li>
        <li>Regardez sa couleur du dessus : elle indique si l'arête doit partir <strong>à droite</strong> ou <strong>à gauche</strong>.</li>
      </ol>
      <div className="grid grid-2">
        <AlgBox name="L'arête va à droite" alg={LBL.rightEdge} />
        <AlgBox name="L'arête va à gauche" alg={LBL.leftEdge} />
      </div>
      <Demo alg={LBL.rightEdge} mask="f2l" title="Vers la droite">
        <p>La couleur du dessus de l'arête (ici l'orange) correspond au centre de droite.</p>
      </Demo>
      <Demo alg={LBL.leftEdge} mask="f2l" title="Vers la gauche">
        <p>Même chose dans l'autre sens : c'est le miroir exact du premier algorithme.</p>
      </Demo>
      <h2>Cas particulier : une arête coincée au milieu</h2>
      <p>
        Si une arête est déjà dans la couche du milieu mais mal placée ou retournée, placez-la devant à droite et faites
        l'algorithme « vers la droite » avec n'importe quelle arête du haut : elle ressort en haut, et vous pouvez la placer
        normalement.
      </p>
    </>
  );
}

function LblYellowCross() {
  return (
    <>
      <p>Les deux premières couches sont faites. On fait maintenant une croix jaune sur le dessus, avec un seul algorithme :</p>
      <AlgBox name="Croix jaune" alg={LBL.yellowCross} />
      <p>On ne regarde que les arêtes (les coins ne comptent pas encore). Trois situations possibles :</p>
      <ul>
        <li><strong>Une ligne</strong> : tenez-la à l'horizontale et faites l'algorithme une fois.</li>
        <li><strong>Un L</strong> : placez-le en haut à gauche (arêtes arrière et gauche) et faites l'algorithme deux fois.</li>
        <li><strong>Un point</strong> (aucune arête jaune) : faites l'algorithme une fois ; vous obtenez un L, et vous continuez.</li>
      </ul>
      <Demo alg={LBL.yellowCross} mask="oll-edges" view="top" title="La ligne" />
      <Demo setup={LBL_DEMOS.crossL.setup} alg={LBL_DEMOS.crossL.alg} mask="oll-edges" view="top" title="Le L, en haut à gauche">
        <p>La première fois donne une ligne, la deuxième la croix.</p>
      </Demo>
      <Demo setup={LBL_DEMOS.crossDot.setup} alg={LBL_DEMOS.crossDot.alg} mask="oll-edges" view="top" title="Le point">
        <p>Après la première fois, le L apparaît devant à droite : <code>U2</code> le replace en haut à gauche.</p>
      </Demo>
    </>
  );
}

function LblYellowEdges() {
  return (
    <>
      <p>
        La croix jaune est faite, mais ses arêtes ne sont pas forcément alignées avec les centres des côtés. Tournez le haut
        (<code>U</code>) jusqu'à ce qu'au moins deux arêtes soient bien placées (leur couleur de côté correspond au centre).
      </p>
      <AlgBox name="Échanger deux arêtes" alg={LBL.edgeSwap} note="Échange les arêtes de devant et de gauche ; celles de derrière et de droite ne bougent pas." />
      <ul>
        <li><strong>Deux arêtes voisines bien placées</strong> : mettez-les derrière et à droite, faites l'algorithme une fois.</li>
        <li><strong>Deux arêtes opposées bien placées</strong> : faites l'algorithme une fois depuis n'importe quel côté ; vous retombez sur le cas précédent.</li>
        <li><strong>Les quatre bien placées</strong> : passez directement à l'étape suivante.</li>
      </ul>
      <Demo alg={LBL.edgeSwap} mask="ll-edges" view="top" title="Arêtes voisines derrière et à droite">
        <p>Les coins sont grisés : ils bougent pendant l'algorithme, ce n'est pas grave à ce stade.</p>
      </Demo>
    </>
  );
}

function LblYellowCorners() {
  return (
    <>
      <p>
        On place maintenant chaque coin jaune à sa place, <strong>sans se soucier de son orientation</strong>. Un coin est
        « bien placé » s'il se trouve entre ses trois bonnes couleurs, même si le jaune ne regarde pas vers le haut.
      </p>
      <AlgBox name="Faire tourner trois coins" alg={LBL.cornerCycle} note="Le coin devant à droite ne bouge pas ; les trois autres tournent." />
      <ol>
        <li>Cherchez un coin bien placé et tenez-le <strong>devant à droite</strong>.</li>
        <li>Faites l'algorithme, une ou deux fois, jusqu'à ce que les quatre coins soient bien placés.</li>
        <li>Si aucun coin n'est bien placé, faites l'algorithme une fois depuis n'importe où : un coin le deviendra.</li>
      </ol>
      <Demo alg={LBL.cornerCycle} view="top" title="Trois coins à faire tourner">
        <p>Le coin devant à droite est déjà à sa place ; les trois autres tournent ensemble.</p>
      </Demo>
    </>
  );
}

function LblOrient() {
  return (
    <>
      <p>Dernière étape ! Il reste à tourner les coins jaunes sur eux-mêmes pour que le jaune regarde vers le haut.</p>
      <AlgBox name="Tourner un coin" alg={LBL.cornerTwist} note="À répéter 2 ou 4 fois par coin." />
      <ol>
        <li>Tenez le cube avec un coin mal orienté <strong>devant à droite</strong>.</li>
        <li>Répétez <code>R' D' R D</code> jusqu'à ce que le jaune de ce coin soit sur le dessus (2 ou 4 fois).</li>
        <li><strong>Sans tourner le cube</strong>, tournez seulement le haut (<code>U</code>) pour amener le coin mal orienté suivant devant à droite, et recommencez.</li>
        <li>Quand tous les coins sont jaunes sur le dessus, un dernier <code>U</code> termine le cube.</li>
      </ol>
      <Callout kind="warn" title="Ne paniquez pas !">
        <p>Pendant cette étape, les couches du bas semblent se mélanger complètement. C'est normal : elles se remettent en place
          toutes seules une fois le dernier coin orienté. Surtout, ne tournez pas le cube entier entre deux coins.</p>
      </Callout>
      <Demo alg="(R' D' R D) (R' D' R D) U (R' D' R D) (R' D' R D) (R' D' R D) (R' D' R D) U'" title="Deux coins à tourner">
        <p>Deux répétitions pour le premier coin, puis <code>U</code> pour amener le suivant, et quatre répétitions : le bas se remet en place à la fin.</p>
      </Demo>
    </>
  );
}

function LblRecap() {
  return (
    <>
      <p>Bravo, vous savez résoudre le Rubik's Cube ! Voici tous les algorithmes de la méthode sur une seule page :</p>
      <div className="grid grid-2">
        <AlgBox name="2. Coins blancs (à répéter)" alg={LBL.sexy} />
        <AlgBox name="3. Arête vers la droite" alg={LBL.rightEdge} />
        <AlgBox name="3. Arête vers la gauche" alg={LBL.leftEdge} />
        <AlgBox name="4. Croix jaune" alg={LBL.yellowCross} />
        <AlgBox name="5. Échanger deux arêtes jaunes" alg={LBL.edgeSwap} />
        <AlgBox name="6. Placer les coins jaunes" alg={LBL.cornerCycle} />
        <AlgBox name="7. Orienter un coin (2 ou 4 fois)" alg={LBL.cornerTwist} />
      </div>

      <h2>Et maintenant ?</h2>
      <ul>
        <li>Résolvez le cube plusieurs fois de suite sans regarder les leçons.</li>
        <li>Chronométrez-vous : une résolution débutant tourne en général entre 1 et 3 minutes au début.</li>
        <li>Quand la méthode est bien ancrée (autour de 1 min 30), passez au <Link to="/parcours">parcours CFOP</Link> : vous y retrouverez la croix, le F2L qui remplace les étapes 2 et 3, et une dernière couche plus rapide.</li>
      </ul>
      <Practice title="Mesurez votre temps" text="Le chronomètre génère des mélanges officiels et calcule vos moyennes." timer />
    </>
  );
}

export const LBL_LESSONS: Lesson[] = [
  { id: "lbl-intro", title: "Comprendre le cube", short: "0", phase: "Avant de commencer", color: "var(--accent)", minutes: 5,
    description: "Centres, arêtes, coins, et les 7 étapes de la méthode.", component: LblIntro },
  { id: "lbl-croix", title: "La croix blanche", short: "1", phase: "Première couche", color: "var(--c-white)", minutes: 15,
    description: "La marguerite autour du centre jaune, puis la croix blanche en bas.", badge: "Intuitif", component: LblCross },
  { id: "lbl-coins-blancs", title: "Les coins blancs", short: "2", phase: "Première couche", color: "var(--c-white)", minutes: 15,
    description: "Un seul algorithme à répéter pour finir la première couche.", badge: "1 algo", component: LblCorners },
  { id: "lbl-deuxieme-couche", title: "La deuxième couche", short: "3", phase: "Deuxième couche", color: "var(--c-green)", minutes: 20,
    description: "Placer les 4 arêtes du milieu, vers la droite ou vers la gauche.", badge: "2 algos", component: LblMiddle },
  { id: "lbl-croix-jaune", title: "La croix jaune", short: "4", phase: "Dernière couche", color: "var(--c-yellow)", minutes: 10,
    description: "Point, L ou ligne : un algorithme pour faire la croix jaune.", badge: "1 algo", component: LblYellowCross },
  { id: "lbl-aretes-jaunes", title: "Placer les arêtes jaunes", short: "5", phase: "Dernière couche", color: "var(--c-yellow)", minutes: 10,
    description: "Aligner les arêtes de la croix avec les centres.", badge: "1 algo", component: LblYellowEdges },
  { id: "lbl-coins-jaunes", title: "Placer les coins jaunes", short: "6", phase: "Dernière couche", color: "var(--c-orange)", minutes: 10,
    description: "Mettre chaque coin à sa place, sans s'occuper de son orientation.", badge: "1 algo", component: LblYellowCorners },
  { id: "lbl-orienter-coins", title: "Orienter les coins jaunes", short: "7", phase: "Dernière couche", color: "var(--c-red)", minutes: 15,
    description: "Tourner les coins sur eux-mêmes pour finir le cube.", badge: "1 algo", component: LblOrient },
  { id: "lbl-recap", title: "Aide-mémoire et suite", short: "✓", phase: "Bilan", color: "var(--accent-2)", minutes: 5,
    description: "Tous les algorithmes sur une page, et comment passer au CFOP.", component: LblRecap },
];

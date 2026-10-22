import { Link } from "react-router-dom";
import { Callout } from "../components/ui";
import { CrossTrainer } from "../components/CrossTrainer";
import { Demo, Practice, SetGallery, StateFigure } from "./kit";

export function IntroLesson() {
  return (
    <>
      <p>
        <strong>CFOP</strong> (aussi appelée méthode Fridrich, du nom de Jessica Fridrich qui l'a popularisée) est la méthode
        utilisée par la grande majorité des speedcubers, y compris pour les records du monde. Elle découpe la résolution en
        quatre étapes, dont les initiales donnent son nom.
      </p>

      <div className="figure-row">
        <StateFigure mask="cross" caption={<><strong>C</strong>ross · la croix</>} />
        <StateFigure mask="f2l" caption={<><strong>F</strong>2L · deux couches</>} />
        <StateFigure alg="(R U R' U') R' F R2 U' R' U' (R U R' F')" mask="oll" caption={<><strong>O</strong>LL · orienter</>} />
        <StateFigure caption={<><strong>P</strong>LL · permuter</>} />
      </div>

      <h2>Les quatre étapes</h2>
      <ol>
        <li><strong>Cross (la croix)</strong> : on place les 4 arêtes blanches en croix sur la face du bas, chacune alignée avec ses centres. Environ 6 à 8 mouvements, entièrement intuitif.</li>
        <li><strong>F2L (First Two Layers)</strong> : on résout les deux premières couches en insérant 4 paires « coin + arête » d'un seul coup. C'est l'étape la plus longue et la plus importante.</li>
        <li><strong>OLL (Orientation of the Last Layer)</strong> : on rend toute la face du haut jaune, sans se soucier de la position des pièces.</li>
        <li><strong>PLL (Permutation of the Last Layer)</strong> : on déplace les pièces de la dernière couche pour finir le cube.</li>
      </ol>

      <h2>Pourquoi le CFOP ?</h2>
      <ul>
        <li>Une solution moyenne de 55 à 60 mouvements, avec des gestes très fluides (beaucoup de R et de U).</li>
        <li>Une progression naturelle : chaque étape peut d'abord être apprise en version simplifiée, avec très peu d'algorithmes.</li>
        <li>Une énorme communauté et énormément de ressources.</li>
      </ul>

      <h2>Le parcours proposé</h2>
      <p>
        Vous connaissez déjà une méthode débutant : vous savez donc faire une croix et finir la dernière couche. On va
        transformer votre méthode petit à petit :
      </p>
      <ol>
        <li><strong>Fondations</strong> : la croix efficace (en bas !) et le F2L intuitif, qui remplace « coins puis arêtes ».</li>
        <li><strong>Dernière couche en 2 temps</strong> : OLL et PLL avec seulement 16 algorithmes au total (10 + 6).</li>
        <li><strong>CFOP complet</strong> : les 41 cas de F2L, les 57 OLL et les 21 PLL, à apprendre à votre rythme.</li>
        <li><strong>Aller plus loin</strong> : anticipation (lookahead), finger tricks, croix avancées…</li>
      </ol>

      <Callout kind="tip" title="Orientation utilisée dans toute l'application">
        <p>Pour résoudre : <strong>croix blanche en bas, jaune en haut, vert devant</strong> (donc orange à droite et rouge à gauche).
          Pour mélanger : blanc en haut, vert devant, comme en compétition.</p>
      </Callout>

      <h2>Objectifs de temps indicatifs</h2>
      <ul>
        <li>Méthode débutant bien maîtrisée : 1 min 30 à 2 min.</li>
        <li>CFOP avec dernière couche en 2 temps et F2L intuitif : 40 s à 1 min.</li>
        <li>CFOP complet bien rodé : 15 à 25 s. Le reste, c'est de l'entraînement !</li>
      </ul>

      <Callout title="Avant de commencer">
        <p>Assurez-vous de bien lire la notation des mouvements (R, U', F2, r, M…). Si besoin, passez par la section{" "}
          <Link to="/notation">Notation</Link> : elle contient aussi un bac à sable pour tester n'importe quelle séquence.</p>
      </Callout>
    </>
  );
}

export function CrossLesson() {
  return (
    <>
      <p>
        La croix, vous savez déjà la faire. Mais en CFOP, on la fait <strong>en bas</strong> et on cherche à la faire en
        <strong> 8 mouvements maximum</strong>, idéalement en la planifiant entièrement pendant les 15 secondes d'inspection.
      </p>

      <h2>Pourquoi la faire en bas ?</h2>
      <p>
        Si vous faites la croix en haut puis retournez le cube, vous perdez du temps et vous perdez de vue les pièces du F2L.
        Croix en bas, vous voyez directement les paires à insérer. Au début c'est déroutant : on ne voit pas la croix se former.
        C'est normal, et ça vient vite avec un peu de pratique.
      </p>
      <Callout kind="tip" title="Les bonnes couleurs">
        <p>Chaque arête blanche doit être alignée avec <strong>son</strong> centre. Avec le blanc en bas et le vert devant : l'orange
          est à droite, le bleu derrière, le rouge à gauche.</p>
      </Callout>

      <h2>Les situations de base</h2>
      <p>Voici comment insérer une arête blanche selon l'endroit où elle se trouve (les autres pièces sont grisées).</p>

      <Demo alg="F2" mask="cross" title="Arête en haut, blanc vers le haut">
        <p>Alignez-la au-dessus de sa place (avec U), puis un demi-tour de la face : <code>F2</code>.</p>
      </Demo>
      <Demo alg="U F2" mask="cross" title="Arête en haut, mais pas au-dessus de sa place">
        <p>On tourne d'abord le haut pour l'amener au-dessus du bon centre, puis <code>F2</code>.</p>
      </Demo>
      <Demo alg="F" mask="cross" title="Arête dans la couche du milieu">
        <p>Un seul quart de tour suffit quand le blanc regarde sur le côté : ici <code>F</code>.</p>
      </Demo>
      <Demo alg="D R' D'" mask="cross" title="Arête du milieu, blanc vers l'avant">
        <p>On écarte la place visée avec <code>D</code>, on descend l'arête avec <code>R'</code>, puis on remet avec <code>D'</code>.</p>
      </Demo>
      <Demo alg="U' R' F R" mask="cross" title="Arête en haut, blanc vers l'avant">
        <p>On la décale sur le côté, on la passe dans la couche du milieu, puis on l'insère. <code>R</code> à la fin remet l'arête de droite en place.</p>
      </Demo>
      <Demo alg="F D' L D" mask="cross" title="Arête en place mais retournée">
        <p>On la sort (<code>F</code>), on décale la croix pour libérer la place de gauche, on insère, et on revient.</p>
      </Demo>

      <h2>Bien planifier</h2>
      <ul>
        <li>Pendant l'inspection, repérez les 4 arêtes blanches et cherchez d'abord les arêtes « faciles » (1 ou 2 mouvements).</li>
        <li>Pensez <strong>relatif</strong> : deux arêtes peuvent être bien placées l'une par rapport à l'autre avant d'être alignées avec leurs centres. Un <code>D</code> à la fin règle tout.</li>
        <li>Profitez des mouvements qui placent deux arêtes à la fois.</li>
        <li>Visez d'abord de planifier 2 arêtes, puis 3, puis la croix complète.</li>
        <li>Ne regardez pas votre croix pendant que vous la faites : vos yeux doivent déjà chercher la première paire du F2L.</li>
      </ul>
      <Callout kind="info" title="Le saviez-vous ?">
        <p>Toute croix peut être résolue en 8 mouvements au plus, et la moyenne optimale est d'environ 5,8 mouvements.</p>
      </Callout>

      <h2>Entraînement intégré</h2>
      <CrossTrainer />
      <Practice title="Continuez au chronomètre" text="Le chronomètre affiche aussi, sur demande, la solution optimale de la croix pour chaque mélange." timer />
    </>
  );
}

export function F2LIntuitiveLesson() {
  return (
    <>
      <p>
        Avec la méthode débutant, vous placiez d'abord les 4 coins blancs, puis les 4 arêtes de la couche du milieu. Le F2L
        fait les deux en même temps : on <strong>forme une paire</strong> (un coin et l'arête qui va à côté), puis on
        <strong> l'insère</strong> dans son emplacement (le « slot »). 4 paires et les deux premières couches sont faites.
      </p>
      <div className="figure-row">
        <StateFigure alg="R U R'" mask="f2l" caption="Coin et arête séparés…" />
        <StateFigure alg="U R U' R'" mask="f2l" caption="…on les réunit en paire…" />
        <StateFigure mask="f2l" caption="…puis on l'insère." />
      </div>

      <h2>1. Les quatre cas de base</h2>
      <p>
        Ce sont les seuls cas à connaître par cœur : tous les autres se ramènent à eux. Le coin a son autocollant blanc sur
        le côté, et l'arête est placée de façon à ce qu'un simple mouvement insère tout.
      </p>
      <Demo alg="R U R'" mask="f2l" view="iso" title="Coin au-dessus de l'emplacement, arête derrière">
        <p><code>R</code> soulève le coin contre l'arête : la paire se forme. <code>U</code> la place au-dessus de l'emplacement et <code>R'</code> l'insère.</p>
      </Demo>
      <Demo alg="U (R U' R')" mask="f2l" view="iso" title="Paire déjà formée">
        <p><code>U</code> écarte la paire, <code>R</code> ouvre l'emplacement, <code>U'</code> y glisse la paire et <code>R'</code> referme.</p>
      </Demo>
      <Demo alg="F' U' F" mask="f2l" view="iso" title="Version face avant">
        <p>Le symétrique du premier cas, par la face avant. On peut aussi tourner le cube : <code>y'</code> puis <code>R' U' R</code>.</p>
      </Demo>
      <Demo alg="U' (F' U F)" mask="f2l" view="iso" title="Paire formée, version face avant">
        <p>Le symétrique du deuxième cas (ou <code>y' U' R' U R</code>).</p>
      </Demo>

      <h2>2. Ramener les autres cas aux cas de base</h2>
      <p>Trois principes suffisent pour tout le reste :</p>
      <ul>
        <li><strong>Utiliser l'emplacement vide</strong> : tant qu'un emplacement n'est pas rempli, tourner sa face (<code>R</code>, <code>R'</code>…) ne casse rien de définitif. C'est votre espace de travail.</li>
        <li><strong>Séparer une mauvaise paire</strong> : si coin et arête sont collés mais mal assortis, on les sépare pour retomber sur un cas de base.</li>
        <li><strong>Sortir les pièces coincées</strong> : un coin ou une arête bloqué dans le mauvais emplacement est d'abord remonté dans la couche du haut.</li>
      </ul>

      <Demo alg="(R U2 R') U' (R U R')" mask="f2l" view="iso" title="Coin blanc vers le haut">
        <p><code>R U2 R'</code> place le coin pour que le blanc parte sur le côté : on retombe sur un cas de base, <code>U' R U R'</code>.</p>
      </Demo>
      <Demo alg="(R U R') U2 (R U' R')" mask="f2l" view="iso" title="Paire mal assortie">
        <p>On sépare avec <code>R U R'</code>, on repositionne avec <code>U2</code>, et on insère avec <code>R U' R'</code>.</p>
      </Demo>
      <Demo alg="(R U' R') U (R U' R')" mask="f2l" view="iso" title="Coin coincé dans l'emplacement">
        <p>Le coin est en bas mais mal orienté : <code>R U' R'</code> le sort de l'emplacement, <code>U</code> prépare et <code>R U' R'</code> insère la paire.</p>
      </Demo>

      <h2>3. Les emplacements de gauche et de derrière</h2>
      <p>
        Tous les exemples utilisent l'emplacement avant-droit. Pour l'emplacement avant-gauche, faites le <strong>miroir</strong>
        (R devient L', U devient U') ou tournez le cube avec <code>y'</code>. Pour les emplacements arrière, tournez le cube
        (<code>y</code> ou <code>y2</code>) afin de les amener devant.
      </p>
      <Demo alg="L' U' L" mask="f2l" view="iso" title="Miroir à gauche">
        <p><code>L' U' L</code> est le miroir exact de <code>R U R'</code>.</p>
      </Demo>

      <Callout kind="tip" title="Conseils pour progresser">
        <ul style={{ marginBottom: 0 }}>
          <li>Prenez votre temps : un F2L lent mais sans pause vaut mieux qu'un F2L rapide plein d'hésitations.</li>
          <li>Cherchez la paire suivante pendant que vous insérez la paire actuelle.</li>
          <li>Évitez d'insérer une paire en cassant une autre paire déjà formée.</li>
        </ul>
      </Callout>

      <h2>Les cas de base, à revoir</h2>
      <SetGallery set="f2l" filter={(_, tags) => !!tags?.includes("basic")} />
      <Practice title="Entraînez les cas de base" text="Le trainer vous montre un cas : faites-le sur votre cube et notez votre réussite." set="f2l" cases={["f2l-1", "f2l-2", "f2l-3", "f2l-4"]} />
    </>
  );
}

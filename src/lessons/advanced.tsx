import { Callout } from "../components/ui";
import { Demo, Practice, SetGallery } from "./kit";

export function F2LFullLesson() {
  return (
    <>
      <p>
        Le F2L intuitif fonctionne pour tous les cas, mais certaines configurations demandent beaucoup de réflexion ou
        des solutions longues. Connaître les <strong>41 cas</strong> avec une solution efficace permet de les résoudre
        sans hésiter, en 7 à 11 mouvements.
      </p>
      <Callout kind="tip" title="Ne tout apprendre par cœur">
        <p>Ces algorithmes sont presque tous des combinaisons de cas de base. Essayez de <strong>comprendre</strong> chaque
          solution (« ici on sépare, là on forme la paire ») plutôt que de l'apprendre comme une suite de lettres. C'est
          aussi ce qui vous permettra de les adapter aux emplacements arrière.</p>
      </Callout>

      <h2>Comment s'y prendre</h2>
      <ol>
        <li>Commencez par les cas où le <strong>coin a le blanc sur le côté</strong> : ce sont les plus fréquents.</li>
        <li>Puis les cas <strong>coin blanc vers le haut</strong>, souvent résolus avec <code>R U2 R'</code> pour remettre le coin de côté.</li>
        <li>Enfin, les cas où une pièce est <strong>déjà dans l'emplacement</strong> : ils sont plus rares mais coûtent cher quand on les rate.</li>
      </ol>
      <Demo alg="(R U' R') U' (R U R') U2 (R U' R')" mask="f2l" view="iso" title="Exemple : coin et arête dans l'emplacement, mal orientés">
        <p>On sort la paire (<code>R U' R'</code>), on la reforme correctement, puis on l'insère.</p>
      </Demo>

      <h2>Les 41 cas</h2>
      <p className="muted small">Algorithmes calculés et vérifiés pour l'emplacement avant-droit. La numérotation est propre à l'application.</p>
      <SetGallery set="f2l" />
      <Practice title="Entraînez le F2L" text="Choisissez un groupe à la fois dans le trainer, puis mélangez-les." set="f2l" quiz />
    </>
  );
}

export function OLLFullLesson() {
  return (
    <>
      <p>
        L'OLL complète permet d'orienter toute la dernière couche en <strong>un seul algorithme</strong> au lieu de deux.
        57 cas, c'est beaucoup : prenez votre temps, quelques cas par semaine suffisent.
      </p>
      <h2>Ordre d'apprentissage conseillé</h2>
      <ol>
        <li>Les <strong>7 cas « croix déjà faite »</strong> : vous les connaissez déjà avec l'OLL en 2 temps.</li>
        <li>Les cas très courts, souvent dérivés d'algorithmes connus : formes en <strong>T</strong>, <strong>P</strong>, <strong>carrés</strong>, <strong>poissons</strong>, <strong>éclairs</strong>.</li>
        <li>Les formes en <strong>L</strong>, en <strong>I</strong> et en <strong>C</strong>.</li>
        <li>Les cas <strong>« point »</strong> (aucune arête orientée) : les plus longs, mais aussi les plus rares.</li>
      </ol>
      <Callout title="Reconnaître par la forme">
        <p>On reconnaît un cas d'OLL d'abord à la <strong>forme</strong> que dessinent les autocollants jaunes sur le dessus
          (le nom des groupes ci-dessous), puis à la position des autocollants jaunes sur les côtés.</p>
      </Callout>
      <Demo alg="F (R U R' U') F'" mask="oll" view="top" title="OLL 45 : un vieil ami">
        <p>C'est l'algorithme de la ligne de l'OLL en 2 temps. Beaucoup de cas complets réutilisent ces briques.</p>
      </Demo>
      <h2>Les 57 cas</h2>
      <SetGallery set="oll" />
      <Practice title="Entraînez l'OLL" text="Sélectionnez un groupe dans le trainer, et utilisez le quiz pour la reconnaissance." set="oll" quiz />
    </>
  );
}

export function PLLFullLesson() {
  return (
    <>
      <p>
        La PLL complète compte <strong>21 cas</strong>, dont 6 que vous connaissez déjà. C'est souvent le premier set complet
        qu'on apprend : peu d'algorithmes, et un gain de temps immédiat.
      </p>
      <h2>Ordre d'apprentissage conseillé</h2>
      <ol>
        <li>Ce que vous savez déjà : <strong>T, Y, Ua, Ub, H, Z</strong>.</li>
        <li>Les cas très fréquents et faciles : <strong>Ja, Jb, Aa, Ab</strong>.</li>
        <li>Puis <strong>Ra, Rb, F, V, Na, Nb, E</strong>.</li>
        <li>Enfin les 4 <strong>perms G</strong>, les plus difficiles à reconnaître.</li>
      </ol>
      <Callout title="La reconnaissance en 2 côtés">
        <p>En regardant seulement deux faces (avant et droite), on peut identifier n'importe quelle PLL. Cherchez les
          <strong> phares</strong>, les <strong>blocs</strong> de 2 ou 3 autocollants identiques, et les couleurs opposées.
          Les flèches sur les schémas montrent où vont les pièces.</p>
      </Callout>
      <Demo alg="(R U R' F') (R U R' U') R' F R2 U' R'" mask="pll" view="top" title="Jb-perm">
        <p>Très fréquente, très rapide, et elle ne contient que des mouvements R, U et F.</p>
      </Demo>
      <h2>Les 21 cas</h2>
      <SetGallery set="pll" />
      <Practice title="Entraînez la PLL" text="Travaillez la reconnaissance au quiz, l'exécution au trainer." set="pll" quiz />
    </>
  );
}

export function AdvancedLesson() {
  return (
    <>
      <p>
        Connaître les algorithmes ne suffit pas : ce qui fait la différence, c'est la <strong>fluidité</strong>. Voici les
        techniques qui séparent un solveur à 30 s d'un solveur à 15 s.
      </p>

      <h2>Lookahead : anticiper</h2>
      <p>
        Le lookahead consiste à <strong>chercher la pièce suivante pendant que vous résolvez la pièce actuelle</strong>.
        En F2L, pendant que vous insérez une paire, vos yeux cherchent déjà la suivante.
      </p>
      <ul>
        <li>Tournez <strong>plus lentement</strong> pour ne jamais vous arrêter. Un rythme régulier bat toujours une alternance rapide/pause.</li>
        <li>Exercez-vous avec un métronome, ou en vous imposant de ne jamais faire de pause.</li>
        <li>Limitez les rotations du cube (<code>y</code>) : elles font perdre de vue les pièces.</li>
      </ul>

      <h2>Finger tricks</h2>
      <ul>
        <li><code>U</code> avec l'index droit, <code>U'</code> avec l'index gauche : on ne tourne jamais le haut avec toute la main.</li>
        <li><code>R</code> et <code>R'</code> avec le poignet, en gardant le cube tenu par les pouces.</li>
        <li><code>F</code> et <code>F'</code> avec le pouce ou l'index, selon ce qui précède dans l'algorithme.</li>
        <li><code>M</code> et <code>M'</code> avec l'annulaire de la main gauche, sans lâcher le cube.</li>
        <li>Choisissez des algorithmes « RU » quand c'est possible : ce sont les plus rapides à exécuter.</li>
      </ul>
      <Demo alg="(R U R' U') (R U R' U') (R U R' U') (R U R' U') (R U R' U') (R U R' U')" setup="" title="Le sexy move en boucle">
        <p>Six répétitions de <code>R U R' U'</code> ramènent le cube à son état initial. Excellent échauffement pour les doigts : visez 2 secondes pour 6 répétitions.</p>
      </Demo>

      <h2>Croix et première paire</h2>
      <ul>
        <li>Planifiez la croix entière pendant l'inspection, puis cherchez où sont les pièces de la première paire.</li>
        <li><strong>X-cross</strong> : résoudre la croix et une première paire en même temps. C'est l'étape suivante une fois la croix maîtrisée.</li>
        <li><strong>Couleur neutre</strong> : savoir faire la croix sur n'importe quelle couleur donne des croix plus courtes, mais demande un gros entraînement. Restez sur le blanc pour l'instant.</li>
      </ul>

      <h2>Optimiser la fin du F2L</h2>
      <ul>
        <li>Utilisez les emplacements vides pour former vos paires plus vite.</li>
        <li>Choisissez la paire la plus facile parmi celles visibles plutôt que de suivre un ordre fixe.</li>
        <li>Évitez d'insérer une paire en cassant une paire déjà formée dans la couche du haut.</li>
      </ul>

      <h2>Dernière couche</h2>
      <ul>
        <li><strong>Anticiper l'AUF</strong> : pendant l'OLL, repérez déjà la PLL qui va suivre.</li>
        <li>Pendant la PLL, regardez où sera la face complète à la fin pour finir par le bon <code>U</code>.</li>
        <li>Apprenez plusieurs angles pour les PLL fréquentes afin d'éviter les <code>U</code> avant l'algorithme.</li>
      </ul>

      <Callout kind="tip" title="Une routine d'entraînement efficace">
        <ul style={{ marginBottom: 0 }}>
          <li>5 min d'échauffement (sexy moves, PLL favorites).</li>
          <li>10 min de trainer sur les cas « en cours d'apprentissage » en révision espacée.</li>
          <li>Une ou deux ao12 au chronomètre, en vous concentrant sur une seule chose (pas de pause en F2L, par exemple).</li>
        </ul>
      </Callout>
      <Practice title="Mettez tout ça en pratique" text="Le chronomètre et le trainer vous attendent." timer set="pll" />
    </>
  );
}

<p align="center">
  <img src="./banner.png" alt="DSHcraft — Play Your Agent Workspace" width="100%">
</p>

[![npm](https://img.shields.io/npm/v/dsh-minecraft-ui?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/dsh-minecraft-ui) [![Démo vidéo](https://img.shields.io/badge/Bilibili-Video_Demo-00A1D6?style=for-the-badge&logo=bilibili&logoColor=white)](https://www.bilibili.com/video/BV1d48c6BEPj) [![Afdian](https://img.shields.io/badge/Afdian-Support_Me-FF69B4?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.ifdian.net/item/1a20ed042f0711f1865a52540025c377) [![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.creem.io/payment/prod_1yc40mIhKwwrc7iqFOG9G2) [![GitHub Stars](https://img.shields.io/github/stars/TFboy1/dsh-minecraft-ui?style=for-the-badge&logo=github&color=F5C542)](https://github.com/TFboy1/dsh-minecraft-ui/stargazers) [![Licence](https://img.shields.io/github/license/TFboy1/dsh-minecraft-ui?style=for-the-badge&color=4C8EDA)](../LICENSE)

[![CI](https://img.shields.io/github/actions/workflow/status/TFboy1/dsh-minecraft-ui/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/TFboy1/dsh-minecraft-ui/actions/workflows/ci.yml) [![npm downloads](https://img.shields.io/npm/dm/dsh-minecraft-ui?style=flat-square&logo=npm)](https://www.npmjs.com/package/dsh-minecraft-ui) [![DSH](https://img.shields.io/badge/DeepSeek_Harness-Web-5CDB95?style=flat-square)](#présentation) [![Three.js](https://img.shields.io/badge/Three.js-0.180-000000?style=flat-square&logo=threedotjs)](https://threejs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-22+-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![简体中文](https://img.shields.io/badge/简体中文-README-blue?style=flat-square)](../README.md) [![English](https://img.shields.io/badge/English-README-blue?style=flat-square)](./README_EN.md) [![日本語](https://img.shields.io/badge/日本語-README-blue?style=flat-square)](./README_JA.md) [![Français](https://img.shields.io/badge/Français-Langue_actuelle-red?style=flat-square)](#) [![Deutsch](https://img.shields.io/badge/Deutsch-README-blue?style=flat-square)](./README_DE.md)

<p align="center">
  Transformez DeepSeek Harness en espace de travail Agent jouable, inspiré de Minecraft.<br>
  <sub>Explorez un monde voxel · Équipez des modèles · Enchantez l'effort de raisonnement · Aventurez-vous avec les Agents actifs</sub>
</p>

## Installation

DSHcraft est un paquet combiné officiel déclarant à la fois `dsh.bundle` et `dsh.client`. Une fois installé, il ajoute la ligne Cordis stable `minecraft-ui` et s'identifie dans le navigateur sous le nom `dsh-minecraft-ui`.

N'activez pas une version candidate directement dans votre profil Web principal. Installez-la d'abord dans un profil canary isolé, vérifiez la couche de composition, puis faites-la progresser avec le flux Guardian stage / canary / promote.

### npm (recommandé)

```bash
dsh plugin --profile <canary> add dsh-minecraft-ui
dsh --profile <canary> --dump-config
```

### Tarball local

```bash
pnpm install
pnpm run verify
pnpm pack
dsh plugin --profile <canary> add ./dsh-minecraft-ui-0.3.0.tgz
dsh --profile <canary> --dump-config
```

### Épingler un commit Git

```bash
dsh plugin --profile <canary> add github:TFboy1/dsh-minecraft-ui#<commit-sha>
```

L'installation Git exécute le build `prepare`. Avec pnpm 10+, l'utilisateur doit autoriser explicitement ce script. N'autorisez que du code source fiable et configurez `allowBuilds: dsh-minecraft-ui` avec la clé exacte indiquée par DSH. Utilisez le paquet npm précompilé ou le tarball si vous ne souhaitez pas accorder cette permission.

Désinstallation :

```bash
dsh plugin --profile <canary> remove dsh-minecraft-ui
```

## Présentation

DSHcraft ne réimplémente pas l'interface de discussion. Ce Cordis Client Plugin se monte dans le `shell.overlay` officiel et conserve les composants natifs DSH : Workspace, Session, Conversation, Trajectory, Composer, permissions, sélection du modèle et statistiques de contexte. Il transforme uniquement le mode d'accès, la métaphore spatiale et l'apparence en un monde de blocs.

## Aperçu de l'interface

<p align="center">
  <a href="https://www.bilibili.com/video/BV1d48c6BEPj"><strong>▶ Voir la démonstration vidéo complète de DSHcraft sur Bilibili</strong></a>
</p>

<table>
  <tr>
    <td align="center" width="50%"><strong>Monde voxel jouable</strong><br><img src="./screenshots/voxel-world.png" alt="Monde voxel et HUD de DSHcraft"></td>
    <td align="center" width="50%"><strong>Inventaire et fabrication</strong><br><img src="./screenshots/inventory-crafting.png" alt="Inventaire, barre rapide et fabrication DSHcraft"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>Coffre des plugins Agent</strong><br><img src="./screenshots/agent-plugin-chest.png" alt="Coffre des plugins Agent et détails d'un outil"></td>
    <td align="center" width="50%"><strong>Dépôt de modèles</strong><br><img src="./screenshots/model-chest.png" alt="Dépôt et équipement de modèles"></td>
  </tr>
  <tr>
    <td align="center" width="50%"><strong>Enchantements de raisonnement</strong><br><img src="./screenshots/reasoning-enchantment.png" alt="Sélection de l'effort de raisonnement"></td>
    <td align="center" width="50%"><strong>Installations sémantiques</strong><br><img src="./screenshots/enchanting-table.png" alt="Table d'enchantement et indication d'interaction"></td>
  </tr>
</table>

## Métaphores principales

| Concept DSH | Représentation DSHcraft |
| --- | --- |
| Travail en cours | Un chien qui travaille dans le bâtiment |
| Dernière progression de l'Agent | Une pancarte d'état au-dessus du chien |
| Model | Équipement |
| Reasoning effort | Enchantement |
| Capacité Tool / Plugin | Objets rangés dans les coffres |
| Chat / Composer | Établi |
| Context / Token | Barre d'expérience et pression de l'inventaire |
| Memory | Métaphore de stockage longue durée façon coffre de l'Ender (réservée) |
| MCP | Système de redstone (réservé) |
| Workspace / Project | Carte et table de cartographie |
| Community Plugin | Coffres communautaires statiques dans le monde |

## Fonctionnalités

### Monde de blocs

- Monde voxel à la première personne propulsé par Three.js.
- Déplacement, saut, sprint, discrétion, minage, placement de blocs et changement de case rapide.
- Persistance des différences du monde, de la position, de l'inventaire, des coffres et de la sélection.
- Les blocs détruits deviennent des objets physiques avec éjection, chute, rotation, délai de ramassage et collecte de proximité.
- Si l'inventaire est plein, la quantité restante demeure dans le monde.

### Établi DSH natif

Appuyez sur `G` ou utilisez l'établi intérieur pour ouvrir l'interface DSH native inspirée de Minecraft :

- Déployer, réduire et trier les dossiers Workspace / Project.
- Créer, ouvrir, renommer, forker et archiver des Sessions.
- Utiliser les vues Conversation / Trajectory et la pagination d'historique natives.
- Conserver Composer, Queue, Steer, Stop, Slash Command et la logique des pièces jointes.
- Conserver les modes de permission, approbations, modèles, effort de raisonnement, statistiques Context et Token.
- Profiter d'une grille de fabrication 3×3 supplémentaire sans remplacer la conversation native.

### Chiens au travail

- Un chien n'apparaît que pour un travail **actuellement en cours** ; aucune créature pour une Session inactive.
- Un chien correspond à un travail de Session actif.
- Sa pancarte couvre la réflexion, le flux de réponse, les Tool Calls, commandes, files d'attente, approbations, erreurs et compactage de contexte.
- Les Tool Calls guident le chien vers l'installation adaptée : Read → bibliothèque, Command → terminal Agent, Web Search → table de cartographie, Write / Edit → établi.
- Un clic droit sur le chien bascule vers sa Session et ouvre directement l'établi natif.

### Installations sémantiques

| Installation | Fonction | Raccourci |
| --- | --- | --- |
| Établi | Conversation DSH native et fabrication 3×3 | `G` |
| Coffre des modèles | Parcourir et équiper les modèles | `M` |
| Coffre des plugins | Gérer les outils de l'Agent actuel | `P` |
| Table d'enchantement | Régler l'effort de raisonnement | `R` |
| Table de cartographie | Parcourir les cartes Workspace / Project | `N` |
| Coffre communautaire | Explorer le catalogue de plugins | `L` |
| Bibliothèque de référence | Emplacement d'activité des outils Read | — |
| Terminal Agent | Emplacement d'activité des outils Command | — |
| Panneau d'information | Tutoriel des commandes | — |

Les installations détruites laissent tomber leur propre objet, peuvent entrer dans l'inventaire et être replacées. Les installations principales perdues à cause d'anciennes règles erronées sont restaurées une fois dans les anciennes sauvegardes.

## Commandes

| Entrée | Action |
| --- | --- |
| `W A S D` | Se déplacer |
| `Space` | Sauter |
| `Ctrl` | Sprinter |
| `Shift` | Se déplacer discrètement |
| Mouvement de la souris | Regarder autour de soi |
| Maintenir le clic gauche | Miner |
| Clic droit | Utiliser un bloc, une installation ou un chien |
| Clic central | Sélectionner le bloc ciblé |
| Molette / `1`–`9` | Changer de case rapide |
| `E` | Inventaire |
| `F` | Échanger avec la main secondaire |
| `T` | Discussion en jeu |
| `Tab` | Liste des Sessions |
| `Esc` | Menu du jeu |
| `G` | Établi natif |
| `M` | Coffre des modèles |
| `P` | Coffre des plugins |
| `R` | Table d'enchantement |
| `N` | Carte Workspace |
| `L` | Coffre communautaire |

Le navigateur demande le Pointer Lock après le premier clic. L'ouverture d'une installation libère immédiatement la souris.

## Configuration

Le Bundle fournit des valeurs sûres. Elles peuvent être remplacées dans un patch ultérieur du profile ciblé :

```yaml
- id: minecraft-ui
  config:
    dataDirectory: dshcraft
    catalogUrl: https://awesome-dsh-plugin.com/plugins.json
    catalogCacheTtlMs: 21600000
    catalogLimit: 2000
    confirmationTtlMs: 60000
```

| Champ | Valeur par défaut | Description |
| --- | ---: | --- |
| `dataDirectory` | `dshcraft` | Répertoire relatif sûr dans `$DSH_HOME` |
| `catalogUrl` | URL du catalogue communautaire | HTTP(S) uniquement |
| `catalogCacheTtlMs` | `21600000` | Durée du cache du catalogue |
| `catalogLimit` | `2000` | Nombre maximal d'entrées, de 1 à 5000 |
| `confirmationTtlMs` | `60000` | Durée de validité du jeton de confirmation |

Cordis valide cette configuration avec Schemastery et complète les valeurs par défaut. Un chemin, protocole ou intervalle invalide provoque immédiatement une erreur à l'activation.

## Sécurité des plugins communautaires

Le processus suit Découvrir → Collecter → Examiner → Confirmer explicitement. Le résultat reste toujours un **dry-run**. DSHcraft ne lance jamais le CLI et ne modifie jamais un profile seul. Chaque candidat doit passer par Guardian stage, être vérifié dans un canary isolé, puis être promu sur décision de l'utilisateur.

## Architecture

```text
dsh-minecraft-ui/
├─ src/index.js                    # Plugin Host, Config, RPC et persistance
├─ cordis.patch.yml                # Couche de composition dsh.bundle
├─ client/src/index.jsx            # Enregistrement shell.overlay et cycle des styles
├─ client/src/game-root.jsx        # Liaison d'état DSH et composition de l'UI
├─ client/src/engine.js            # Monde Three.js, interactions, objets et chiens
├─ client/src/world.js             # Terrain, bâtiments, blocs et migrations
├─ client/src/inventory/           # Fabrication, conteneurs et machine d'état
├─ client/src/dsh/                 # Projections Session et routage des outils
├─ client/src/ui/                  # Établi, coffres, carte et HUD
├─ scripts/build.mjs               # Build déterministe Host / Client
├─ lib/index.js                    # Point d'entrée Host compilé
├─ lib/client.js                   # Bundle navigateur lazy-CJS
└─ test/                           # Tests Node test runner
```

Le Root et l'AppFrame officiels de DSH restent propriétaires de Sidebar, Conversation, Details et Composer. DSHcraft n'enregistre qu'un Overlay réversible. Cela évite de monter une deuxième fois Session / Conversation dans un autre React Root et protège les brouillons, pièces jointes, flux et cycles de vie.

## Développement

Prérequis : Node.js 22+, pnpm 11+ et un environnement DeepSeek Harness Web fonctionnel.

```bash
pnpm install
pnpm test
pnpm run build
pnpm run package:check
pnpm run verify
pnpm pack --dry-run
```

Relancez `pnpm run build` après toute modification du Client. Effectuez la validation manuelle du frontend dans un profile canary isolé.

## Persistance

```text
$DSH_HOME/dshcraft/capabilities.json
$DSH_HOME/dshcraft/community.json
$DSH_HOME/dshcraft/community-cache.json
```

Les sauvegardes du monde, du joueur et de l'inventaire sont gérées par le service de persistance du jeu. Ne modifiez pas directement les journaux DSH Session.

## Limites connues

- Interaction prévue pour clavier et souris ; le mode tactile n'est pas pris en charge.
- Il s'agit d'un thème et client spatial pour DSH, pas d'une implémentation complète de Minecraft.
- Si le catalogue communautaire est indisponible, le cache ou les candidats intégrés sont utilisés.
- Certaines installations sont des métaphores DSH et ne se comportent pas exactement comme les blocs Minecraft d'origine.
- Le bundle Client contient Three.js et une police intégrée, avec un budget explicite inférieur à 2 Mo.

## Licence

Le code du projet est publié sous [licence MIT](../LICENSE).

La police pixel est Monocraft ; sa licence se trouve dans [`licenses/Monocraft-LICENSE.txt`](../licenses/Monocraft-LICENSE.txt). Minecraft est une marque de Mojang Studios. Ce projet n'est affilié ni à Mojang Studios ni à Microsoft.

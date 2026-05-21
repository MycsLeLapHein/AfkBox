// ═══════════════════════════════════════════════════════
// synergies.js — Équipes recommandées par héros
// Modifie ce fichier pour mettre à jour les synergies
// ═══════════════════════════════════════════════════════

const SYN={
"Shemira":[
  {name:"Full Mort-vivant sustain",heroes:["Shemira","Daimon","Ludovic","Bonnie","Thoran"],desc:"Synergie Mort-vivant : vol de vie permanent, Daimon tank, Ludovic soins, Thoran renvoie les dégâts.",mode:"Story Stages"},
  {name:"Shemira carry PvP",heroes:["Shemira","Velara","Silven","Zanie","Hugin"],desc:"Velara affaiblit, Silven et Hugin amplifient les dégâts magiques de Shemira.",mode:"PvP"},
],
"Galahad":[
  {name:"Galahad Pugiliste Assault",heroes:["Galahad","Shakir","Smokey & Meerky","Koko","Nazrik"],desc:"Synergie Pugiliste : Galahad carry magique, Smokey soigne, Koko réduit dégâts, Shakir et Nazrik en front.",mode:"PvE & PvP"},
  {name:"Galahad batterie énergie",heroes:["Galahad","Rowan","Hugin","Tasi","Aurora"],desc:"Rowan régénère énergie, Tasi contrôle, Hugin booste, Aurora bonus Céleste.",mode:"Dream Realm"},
],
"Daimon":[
  {name:"Daimon tank frontline",heroes:["Daimon","Shemira","Ludovic","Rowan","Tasi"],desc:"Daimon absorbe en front, Shemira DPS, Ludovic soins, Rowan énergie, Tasi contrôle.",mode:"Story Stages"},
  {name:"Daimon DR boss",heroes:["Daimon","Cyran","Tasi","Odie","Aurora"],desc:"Daimon tank boss, Cyran DR 4.0, Odie DPS, Tasi contrôle, Aurora bonus Céleste.",mode:"Dream Realm"},
],
"Tasi":[
  {name:"Tasi contrôle masse",heroes:["Tasi","Faramor","Shemira","Velara","Hugin"],desc:"Tasi contrôle les vagues, Faramor anti-buff, Shemira DPS, Velara affaiblit, Hugin booste.",mode:"Story Stages"},
  {name:"Tasi DR spécialistes",heroes:["Tasi","Cyran","Odie","Daimon","Rowan"],desc:"Tasi contrôle boss, Cyran et Odie dégâts max DR, Daimon absorbe, Rowan énergie.",mode:"Dream Realm"},
],
"Odie":[
  {name:"Odie DPS universel",heroes:["Odie","Eironn","Tasi","Rowan","Velara"],desc:"Eironn regroupe, Tasi contrôle, Velara affaiblit — Odie DPS dans la zone idéale.",mode:"Dream Realm & Stages"},
],
"Aurora":[
  {name:"Aurora full Céleste",heroes:["Aurora","Elijah & Lailah","Dionel","Reinier","Gunnar"],desc:"Full Céleste/Hypo : bonus faction sur boss. Aurora DPS, Elijah liaison, Dionel zone.",mode:"Dream Realm"},
],
"Cyran":[
  {name:"Cyran DR spécialiste",heroes:["Cyran","Tasi","Odie","Daimon","Rowan"],desc:"Cyran DR 4.0 maximum. Tasi contrôle boss, Odie DPS, Daimon absorbe, Rowan énergie.",mode:"Dream Realm"},
],
"Eironn":[
  {name:"Eironn aspirateur masse",heroes:["Eironn","Tasi","Velara","Arden","Odie"],desc:"Eironn aspire tous les ennemis, Tasi contrôle, Velara affaiblit, Arden foudroie, Odie DPS.",mode:"Story Stages"},
],
"Rowan":[
  {name:"Rowan batterie énergie",heroes:["Rowan","Shemira","Galahad","Tasi","Odie"],desc:"Rowan régénère l'énergie pour des ultimes fréquents. Incontournable en DR.",mode:"Dream Realm"},
],
"Elijah & Lailah":[
  {name:"Full Céleste optimale",heroes:["Elijah & Lailah","Aurora","Dionel","Reinier","Gunnar"],desc:"Full Céleste/Hypo : bonus faction massif. Elijah liaison, Aurora DPS, Dionel zone.",mode:"Dream Realm"},
],
"Lily May":[
  {name:"Lily May DR",heroes:["Lily May","Cyran","Odie","Daimon","Aurora"],desc:"Lily May DR 3.5, combinée avec Cyran et Odie pour maximiser les dégâts boss.",mode:"Dream Realm"},
],
"Frieren":[
  {name:"Frieren Collab stages",heroes:["Frieren","Himmel","Tasi","Rowan","Velara"],desc:"Synergie Collab : Frieren mage puissant, Himmel guerrier, Tasi contrôle, Velara affaiblit.",mode:"Story Stages"},
],
};

function getTeams(n,p){
  if(SYN[n]) return SYN[n];
  const box=state.boxes.find(b=>b.id===p);
  if(!box)return[];
  const bnames=box.heroes.map(b=>b.name);
  const tanks=bnames.filter(x=>x!==n&&TL[x]?.role==='Tank').sort((a,b)=>TL[a].rank-TL[b].rank);
  const soutiens=bnames.filter(x=>x!==n&&TL[x]?.role==='Soutien').sort((a,b)=>TL[a].rank-TL[b].rank);
  const dps=bnames.filter(x=>x!==n&&['Mage','Archer','Assassin','Guerrier'].includes(TL[x]?.role)).sort((a,b)=>TL[a].rank-TL[b].rank);
  const drDps=bnames.filter(x=>x!==n&&TL[x]?.dr>=2.5).sort((a,b)=>TL[b].dr-TL[a].dr);
  const team1=[n];
  if(!['Tank'].includes(TL[n]?.role)&&tanks.length)team1.push(tanks[0]);
  if(!['Soutien'].includes(TL[n]?.role)&&soutiens.length&&team1.length<5)team1.push(soutiens[0]);
  for(const d of dps){if(team1.length>=5)break;if(!team1.includes(d))team1.push(d);}
  const team2=[n];
  if(!['Tank'].includes(TL[n]?.role)&&tanks.length)team2.push(tanks[0]);
  if(!['Soutien'].includes(TL[n]?.role)&&soutiens.length&&team2.length<5)team2.push(soutiens[0]);
  for(const d of drDps){if(team2.length>=5)break;if(!team2.includes(d))team2.push(d);}
  return[
    {name:"Équipe Équilibrée (1T+1S+3DPS)",heroes:team1,desc:"Composition standard : 1 Tank + 1 Soutien + 3 DPS. Adaptée stages et boss.",mode:"Story Stages"},
    {name:"Équipe Dream Realm",heroes:team2,desc:"1 Tank + 1 Soutien + meilleurs scores DR de ta box.",mode:"Dream Realm"},
  ];
}

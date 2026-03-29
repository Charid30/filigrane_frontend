import { Routes } from '@angular/router';
import { Accueil } from '../pages/accueil/accueil';
import { Traitement } from '../pages/traitement/traitement';
import { Resultat } from '../pages/resultat/resultat';
import { APropos } from '../pages/a-propos/a-propos';
import { NotFound } from '../pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'traitement', component: Traitement },
  { path: 'resultat', component: Resultat },
  { path: 'a-propos', component: APropos },
  { path: '**', component: NotFound },
];

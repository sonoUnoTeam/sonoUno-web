import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InicioComponent} from './pages/inicio/inicio.component';
import {HelpComponent} from './pages/help/help.component';

const routes: Routes = [

  { path: 'inicio', component: InicioComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'inicio'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

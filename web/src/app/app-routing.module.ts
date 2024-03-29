import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {InicioComponent} from './pages/inicio/inicio.component';
import {HelpComponent} from './pages/help/help.component';
import { LandingComponent } from './pages/landing/landing.component';
import { QuickstartComponent } from './pages/quickstart/quickstart.component';
import {LandingPageGuard} from "./login.guard";

const routes: Routes = [

  { path: 'home', component: InicioComponent },
  { path: 'help', component: HelpComponent },
  { path: 'quickstart', component: QuickstartComponent },
  { path: 'landing', component: LandingComponent },
  { path: '', component: LandingComponent, canActivate: [LandingPageGuard]},
  { path: '**', pathMatch: 'full', redirectTo: 'landing'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

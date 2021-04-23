import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { NavbarComponent } from './component/shared/navbar/navbar.component';
import {HttpClientModule} from "@angular/common/http";

import { CommonModule } from '@angular/common';

import { PlotComponent } from './pages/plot/plot.component';

import { PlotlyViaCDNModule } from 'angular-plotly.js';
import { HelpComponent } from './pages/help/help.component';
import { LandingComponent } from './pages/landing/landing.component';
import { QuickstartComponent } from './pages/quickstart/quickstart.component';
PlotlyViaCDNModule.setPlotlyVersion('latest'); // 
PlotlyViaCDNModule.setPlotlyBundle('basic'); // '
@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    NavbarComponent,
    PlotComponent,
    HelpComponent,
    LandingComponent,
    QuickstartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
    PlotlyViaCDNModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

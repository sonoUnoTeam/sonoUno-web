import { Component, OnInit } from '@angular/core';
import {ConfigurationService} from "../../configuration.service";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  skippingLandingPage: boolean;

  constructor(private configurationService: ConfigurationService) {
    this.skippingLandingPage = configurationService.isSkippingLandingPage();
  }

  onCheckboxChanged(event) {
    this.configurationService.setSkippingLandingPage(event.target.checked);
  }

  ngOnInit(): void {

  }

}

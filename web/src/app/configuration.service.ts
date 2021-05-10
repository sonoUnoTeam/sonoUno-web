import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor() { }

  // Configure whether to skip the landing page.
  setSkippingLandingPage(skippingLandingPage: boolean) {
    try {
      if (localStorage) {
        localStorage.setItem("sonouno-skip-landing-page",
                             skippingLandingPage ? "true" : "false");
      }
    }
    catch (e) {
      // do nothing
    }
  }

  // Return whether to skip the landing page.
  isSkippingLandingPage() {
    try {
      if (localStorage) {
        return localStorage.getItem("sonouno-skip-landing-page") === "true";
      }
    }
    catch (e) {
      return false;
    }
  }
}

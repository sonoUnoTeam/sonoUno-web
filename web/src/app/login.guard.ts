import {Injectable} from "@angular/core";
import {CanActivate, Router} from "@angular/router";
import {ConfigurationService} from "./configuration.service";

@Injectable()
export class LandingPageGuard implements CanActivate {
  constructor (private router: Router,
               private configurationService: ConfigurationService) {}

  canActivate() {
    const skippingLandingPage = this.configurationService.isSkippingLandingPage();

    if (skippingLandingPage) {
      this.router.navigate(["/inicio"]);
    }

    return true;
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
anchorNav(destino:string){
document.getElementById(destino).scrollIntoView();
document.getElementById(destino).focus();
}
}

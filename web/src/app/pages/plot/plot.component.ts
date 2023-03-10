import { Component, OnInit } from '@angular/core';

declare var Tone: any;

@Component({
  selector: 'plotly-component',
  templateUrl: './plot.component.html'
})

export class PlotComponent {
  //VARIABLES
  datos: number[] = [1, 2, 3, 7, 2, 3, 4, 5, 1, 2, 3, 4, 6, 2, 3, 6, 2, 6, 3, 7, 8, 4, 32, 3, 56, 6, 3, 2, 5, 4, 3, 5, 6, 4, 3, 2, 4, 56, 76, 4, 34, 45, 5,];
  datos_x: number[] = [];
  value: any;
  i: number = 0;
  bar_x: number[] = [];
  bar_y: number[] = [];
  GlobalIndex: number = -1;
  duration: number;
  tempoSlider: number = 50;
  timeouts: any[] = [];
  play:boolean=false;

  data: any[] = [
    { y: this.datos, type: 'scatter', mode: 'lines', line: { color: '#b55400' } }
  ];
  layout: any = { uirevision: 'true', xaxis: { autorange: true }, yaxis: { autorange: true }, showlegend: false };


  Reset() {
    this.timeouts.forEach(function (to) { clearTimeout(to); })
    this.datos = [];
    this.datos_x = [];
    this.bar_y = [];
    this.bar_x = [];
    this.layout.title = '';
    this.data = [
      { mode: 'lines', line: { color: "#b55400" }, y: this.datos },
      { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: this.bar_x }
    ];
    this.GlobalIndex = -1;

  }


  mostrarValores() {
    if (this.datos_x.length) {
      this.data = [
        { mode: 'lines', line: { color: "#b55400" }, x: this.datos_x, y: this.datos },
        { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: this.bar_x }
      ];
    } else {
      this.data = [
        { mode: 'lines', line: { color: "#b55400" }, y: this.datos },
        { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: this.bar_x }
      ];
    };

  }
  Play() {
    this.duration = 2 * (100 - this.tempoSlider) + 10;
    let min = Math.min.apply(null, this.datos);
    let max = Math.max.apply(null, this.datos);
    this.bar_x = [];
    this.bar_y = [min, max];
    //let count=0;
    let indexaux;
    // let datos_x:number[]=this.datos_x;
    let osc = new Tone.Oscillator(440, "sine");
    this.datos.forEach((value, index) => {
      //    indexaux=index;
      //index=index+GlobalIndex;
      if (((index) < (this.datos.length)) && (index > this.GlobalIndex)) {
        this.timeouts.push(setTimeout(
          () => {
            if (this.datos_x.length) {
              this.bar_x = [this.datos_x[index], this.datos_x[index]];
              this.data = [
                { mode: 'lines', line: { color: "#b55400" }, x: this.datos_x, y: this.datos },
                { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: this.bar_x }
              ];
            } else {
              this.bar_x = [index, index];
              this.data = [
                { mode: 'lines', line: { color: "#b55400" }, y: this.datos },
                { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: this.bar_x }
              ];
            }

            osc.frequency.value = 300 + 100 * (value - min) / (max - min);
            osc.fadeOut = 0.05;
            let player = osc.toMaster()
            player.start();
            player.stop("+" + (this.duration / 950 + 0.05));
            this.GlobalIndex = index;
            if (this.GlobalIndex == this.datos.length - 1) {
              this.GlobalIndex = -1;
            }
          }, (index - this.GlobalIndex) * this.duration))
      }
    });
  }

   Pause() {
    this.timeouts.forEach( function(to) {clearTimeout(to);})
  }

  PlayPause() {
    if (!this.play) {
      this.Play();
      this.play=true;
    }else{
      this.Pause();
      this.play=false;
    }
  }
  Stop() {
    // this.PlayPause();
    // // this.play_pause_btn.innerHTML = "Play";
    this.play=false;
    this.timeouts.forEach( function(to) {clearTimeout(to);})
    this.GlobalIndex=-1;
    this.bar_y=[];
    this.bar_x=[];
    this.data = [
      {mode:'lines', line: {color: "#b55400"},y:this.datos},
      {mode:'lines', line: {color: "#393e46"},y:this.bar_y,x:this.bar_x}
                  ];
 }

 ReloadSoundParams() {
  console.log('reload');
  this.PlayPause();
  this.PlayPause();
}

}

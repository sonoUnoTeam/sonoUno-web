import { Component, HostListener, OnInit, } from '@angular/core';


import * as ToneJS from 'tone'
import * as funciones from './utils'
import * as dummyData from './dummyData'

//declare var Tone: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})

export class InicioComponent implements OnInit {




  ngOnInit() {

  }



  //VARIABLES
  graphTitle = "Plot title"
  abscissaTitle = "Abscissa Title"
  ordinateTitle = "Ordinate Title"
  markerStyle = "";
  tipoLinea = "solid";
  colorLinea = "#b55400"
  marcadores: any[] = [];
  datos: number[] = [];
  //datos: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
  datos_x: number[] = [];
  frecuencias: number[] = [];
  value: any;
  i: number = 0;
  sine: boolean = true;
  synthWave: boolean = false;
  flute: boolean = false;
  piano: boolean = false;
  celesta: boolean = false;
  minFreq: number = 300;
  maxFreq: number = 1200;
  minFreqGraph: number = 10;
  maxFreqGraph: number = 20;

  ADSR: {} = {
    "attack": 0,
    "decay": 0.2,
    "sustain": 1,
    "release": 0.8,
  };
  bar_x: number[] = [];
  bar_y: number[] = [];
  grafico: any;
  GlobalIndex: number = 0;
  indiceGrafico: number = 0;
  
  duration: number;
  tempoSlider: number = 50;
  min = Math.min.apply(null, this.datos);
  max = Math.max.apply(null, this.datos);
  timeouts: any[] = [];
  play: boolean = false;
  logaritmic: boolean = false;
  inplay: boolean = false;
  osc = new ToneJS.Oscillator(440, "sine");
  fileToUpload: File = null;
  volumen: number = 50;
  volume = new ToneJS.Volume(0).toDestination();
  //Variables ENVELOPE
  attack: number = 0;
  decay: number = 10;
  sustain: number = 100;
  release: number = 16;
  filtroEnabled: boolean = false;
  env = new ToneJS.AmplitudeEnvelope({
    "attack": 0,
    "decay": 0.2,
    "sustain": 1,
    "release": 0.8,
  }).connect(this.volume);
  synthA = new ToneJS.OmniOscillator(440, "sine").connect(this.env);
  data: any[] = [
    { y: this.datos, type: 'scatter', mode: "lines", line: { color: this.colorLinea, dash: this.tipoLinea, width: 4 } }
  ];

  layout: any = {
    title: {
      text: this.graphTitle,
      font: {
        family: "Nunito, sans-serif",
        size: 24
      }, xref: 'paper',
      x: 0.05,
    },
    uirevision: 'true',
    xaxis: {
      autorange: true, title: {
        text: this.abscissaTitle, font: { family: "Nunito, sans-serif", size: 18 }
      }
    },
    yaxis: {
      range:[(Math.min(...this.datos)),
        (Math.max(...this.datos))],
      autorange: false, title: {
        text: this.ordinateTitle, font: { family: "Nunito, sans-serif", size: 18 }
      }
    },
    showlegend: false
  };
  rangoMin: number = 0;
  rangoMax: number = 0;



  generarFrecuencias() {
    this.min=Math.min(...this.datos);
    this.max=Math.max(...this.datos);
    //Metodo para poblár el array de frecuencias
    this.frecuencias = [];
    if (this.logaritmic) {
      //console.log("log");
      this.datos.forEach(element => {
        let frecuencia = this.minFreq + Math.log10((this.maxFreq - this.minFreq) * (element - this.min) / (this.max - this.min) + 1); //+1 Porque si el dato está en el minimo del grafico da infinito el log
        // console.log(frecuencia);
        this.frecuencias.push(frecuencia)
      });
    } else {
      //console.log("normal");
      this.datos.forEach(element => {
        let frecuencia = this.minFreq + (this.maxFreq - this.minFreq) * (element - this.min) / (this.max - this.min);
        // console.log(frecuencia);
        this.frecuencias.push(frecuencia)
      });
    }
  }
  grabarArchivo() { //Funcion para generar el wav. Usa el secuenciador como forma de concatenar los sonidos en ToneJS offline. 
    //devuelve un buffer de audio que con los headers adecuados se reproduce como wav

    this.duration = 2 * (100 - this.tempoSlider) + 10;
    let bpm = 60 / (this.duration / 1350 + 0.05);  //TODO: Corregir velocidad total
    this.generarFrecuencias();
    this.zoom();
    let frecuencias = this.frecuencias.slice(this.rangoMin, this.rangoMax + 1);
    let duracion = frecuencias.length * (this.duration / 1350 + 0.05);

    let promesa = ToneJS.Offline(({ transport }) => {

      let volume = new ToneJS.Volume((this.volumen - 50) / 4).toDestination();
      const synthA = new ToneJS.Synth({
        envelope: this.ADSR,
        oscillator: {
          type: "sine"
        }
      }).connect(volume);
      const seqA = new ToneJS.Sequence(((time, note) => {
        synthA.triggerAttack(note, time);
      }), frecuencias, "4n").start(0);
      seqA.loop = false;
      // only nodes created in this callback will be recorded
      transport.bpm.value = bpm;
      transport.start();

    }, Math.round(duracion));
    promesa.then((buffer) => funciones.createWav(buffer,this.graphTitle));
  }
  Reset() {
    this.timeouts.forEach(function (to) { clearTimeout(to); })
    this.datos = [];
    this.datos_x = [];
    this.bar_y = [];
    this.bar_x = [];
    this.layout.title = '';
    this.updateGraph();
    this.GlobalIndex = 0;

  }

  zoom() {
    //Corrige las posiciones del indice en el grafico y la sección de datos a reproducir utilizando los rangos del layout del grafico
    this.rangoMin = this.layout["xaxis"]["autorange"] ? 0 : this.layout["xaxis"]['range'][0];
    this.rangoMax = this.layout["xaxis"]["autorange"] ? this.datos.length : this.layout["xaxis"]['range'][1];
    this.GlobalIndex = Math.round((this.indiceGrafico / 100 * (Math.ceil(this.layout['xaxis']["range"][1]) - this.rangoMin)) + this.rangoMin);
    this.generarFrecuencias();

  }
  sliderAbscisa() {
    this.zoom();
    this.GlobalIndex = Math.round((this.indiceGrafico / 100 * (Math.ceil(this.layout['xaxis']["range"][1]) - this.rangoMin)) + this.rangoMin);
    this.reproducirTono(0, false);
  }
  sliderVolumen() {
    this.volume = new ToneJS.Volume((this.volumen - 50) / 4).toDestination();
    this.env = new ToneJS.AmplitudeEnvelope({
      "attack": this.attack*0.02,
      "decay": this.decay*0.02,
      "sustain": this.sustain*0.01,
      "release": this.release*0.05,
    }).connect(this.volume);
    this.synthA = new ToneJS.OmniOscillator(440, "sine").connect(this.env);
  }
  descargarMarcadores() {
   if(this.marcadores.length===0){
     console.log("marcadores está vacío");
  }else{
    funciones.saveMarkers(this.marcadores, this.datos,this.graphTitle);
    this.marcadores=[];
    this.updateGraph();
    //TODO: Preguntar si está bien que se eliminen con el prompt de savefile && Preguntar por el mensaje cuando están vacíos. Alert?
  }
    
  }
  addMarcador() {
    //Se añaden los marcadores a una lista, utilizando el indice de la reproducción para X y el valor de los datos en esa posición para Y
    this.marcadores.push({
      mode: 'markers',
      marker: {
        symbol: this.markerStyle, color: 'blue',
        size: 10,
        line: {
          color: 'blue',
          width: 2
        }
      },
      y: [this.datos[this.GlobalIndex], this.datos[this.GlobalIndex]],
      x: [this.GlobalIndex, this.GlobalIndex]
    })

    // console.log(this.marcadores);
    this.updateGraph();
  }

  deleteMarcador() {
    this.marcadores.pop();
    this.updateGraph();
  }
  updateGraph() {
    //Redibujar el grafico cuando cambia alguna característica: color, añadir o quitar marcadores, tipo de linea, etc

    this.layout.yaxis.range[0]=Math.min(...this.datos)-1;
    this.layout['yaxis']['range'][1]=Math.max(...this.datos)+1;
 
    this.bar_x = [];
    this.bar_y = [this.layout.yaxis.range[0], this.layout.yaxis.range[1]]; //Esto hace que la barra de la reproducción siempre esté en sobre el min y el max de la onda
    //Pero, deja margen arriba y abajo debido a que el grafico está en autorange

    this.bar_x = [this.GlobalIndex, this.GlobalIndex];
    this.data = [
      { mode: "lines", line: { color: this.colorLinea, dash: this.tipoLinea, width: 4 }, y: this.datos },
      { mode: 'lines', line: { color: "#393e46" }, y: this.bar_y, x: [this.GlobalIndex, this.GlobalIndex] },

    ];
    if (this.marcadores != null) {
      this.marcadores.forEach(element => {
        this.data.push(element)

      })
    };

  }

  reproducirTono(duration, error: boolean) { //Reproduce un tono. Index valor donde se dibujará el cursor. Value tono a reproducir

    this.updateGraph();
    this.synthA.frequency.value = this.frecuencias[this.GlobalIndex];
    // this.synthA.frequency.value =  this.minFreq + (this.maxFreq-this.minFreq) * (this.datos[this.GlobalIndex]- this.min) / (this.max - this.min);
    if (error) {
      this.synthA.frequency.value = 160
    }
    this.synthA.start();
    this.env.triggerAttack();
    //synthA.fadeOut(0.5);
    this.synthA.stop("+" + (duration / 950 + 0.05));


    // synthA.triggerAttackRelease(this.frecuencias[this.GlobalIndex],"16n")
  }

  Play() {
    this.zoom();
    this.duration = 2 * (100 - this.tempoSlider) + 10;
    let fin = Math.ceil(this.layout['xaxis']["range"][1]);
    this.GlobalIndex = this.GlobalIndex == 0 ? Math.floor(this.layout["xaxis"]["range"][0]) : this.GlobalIndex;
    this.generarFrecuencias()
    this.datos.forEach((value, index) => {
      
      if (((index) <= (fin)) && (index >= this.GlobalIndex)) {
        this.timeouts.push(setTimeout(
          () => {
            if (this.datos_x.length) {
              this.GlobalIndex = index;
              this.indiceGrafico = (this.GlobalIndex - this.rangoMin) * 100 / (this.rangoMax - this.rangoMin);
              this.updateGraph()
            } else {
              this.GlobalIndex = index;
              this.indiceGrafico = (this.GlobalIndex - this.rangoMin) * 100 / (this.rangoMax - this.rangoMin);
              this.updateGraph()

            }


            this.reproducirTono(this.duration, false);
            if (this.GlobalIndex == fin) {
              this.GlobalIndex = 0;
              this.indiceGrafico = 0;
            }
            if (index == fin) {
              setTimeout(() => {
                this.play = false;
                this.inplay = false;
              }, 1 * this.duration);
            }
            if (index == 0) {
              this.inplay = true;
            }
          }, (index - this.GlobalIndex) * this.duration
        )
        )
      }
    });
  }

  Pause() {
    this.timeouts.forEach(function (to) { clearTimeout(to); })
    this.inplay = false;
  }

  PlayPause() {
    if (!this.play) {
      this.Play();
      this.play = true;
    } else {
      this.Pause();
      this.play = false;
    }
  }
  ToolbarPlay() {
    if (this.inplay == true) {
      this.Pause();
      this.Play();
    }
  }
  Stop() {

    this.play = false;
    this.timeouts.forEach((to) => { clearTimeout(to); })
    this.indiceGrafico = 0;
    this.GlobalIndex = 0;
    this.bar_y = [];
    this.bar_x = [];
    this.updateGraph();
  }

  ReloadSoundParams() {
    console.log('reload');
    this.PlayPause();
    this.PlayPause();
  }


  leerDummyData(numeroData: string) {
    this.datos = dummyData.getDummyData(numeroData);
    this.generarFrecuencias();
    this.updateGraph();

  }

  fileContent: string = '';

  lines: any;
  public onChange(fileList: FileList): void {
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    this.graphTitle=file.name.split('.')[0];
    this.layout.title.text = this.graphTitle;
 
    let delimiter;
    fileReader.onloadend = x => {
      this.fileContent = fileReader.result as string;

      this.lines = this.fileContent.split('\n').slice(0);
      let linea = [];
      this.datos = [];
      delimiter = this.findDelimiter(this.lines[0]);
      let aux=0;
      this.lines.forEach((line, index) => {
        linea = line.split(delimiter);

        // linea.forEach(numero => {
        //   this.datos.push(numero);
        // });
        if (isNaN(linea[0]) && isNaN(linea[1])) {
          aux++;          console.log(aux);
          this.layout.xaxis.title.text = linea[0];
          this.layout.yaxis.title.text = linea[1];
        }else{ 
          if(linea[1]!=null){
        this.datos.push(Number(linea[1]));}}
//TODO: Arreglar caso de ultimo enter. inserta un no numero Quizás lo arregla ese if null
      }

      );
      
      console.log(this.datos);
      this.updateGraph();
  

    }
    fileReader.readAsText(file);

  }
  findDelimiter(text: string) {
    var delimiter = null;
    let allowedDelimiters = [',', ';', '\t'];
    allowedDelimiters.forEach(function (d) {
      if (text.includes(d)) delimiter = d;
    })
    return (delimiter);
  }
  sliderADSR() {
   
    this.duration = 2 * (100 - this.tempoSlider) + 10;
    let duracionTono=this.duration / 950 + 0.05; 

    let sumaDuraciones= duracionTono * this.attack/100  +  duracionTono * this.decay/100  +  duracionTono * this.release/100;
    //this.attack*0.02+this.decay*0.02+this.sustain*0.01+this.release*0.05;
    console.log(duracionTono);
    console.log(sumaDuraciones);
    if (this.filtroEnabled) {
    //Configuración ADSR del envelope filter
    //Los rangos están expresados en segundos
    //this.duration / 950 + 0.05
    if(sumaDuraciones>duracionTono){
      console.log("duracion demasiado larga")
      // this.attack=this.ADSR["attack"]/0.02;
      // this.decay=this.ADSR["decay"]/0.02;
      // this.sustain=this.ADSR["sustain"]/0.01;
      // this.release=this.ADSR["release"]/0.05;
    }else{
      //TODO: los valores no son proporcionales al rango de cada elemento del ADSR. También jamás podrían estar a más del 25% los cuatro a la vez
      //Rango 0 a 2: 
      this.ADSR["attack"] = duracionTono * this.attack/100;
      //Rango 0 a 2:
      this.ADSR["decay"] = duracionTono * this.decay/100;
      //Rango 0 a 1:
      this.ADSR["sustain"] = duracionTono * this.sustain/100;
      //Rango 0 a 5:
      this.ADSR["release"] = duracionTono * this.release/100;
      this.env = new ToneJS.AmplitudeEnvelope(this.ADSR).toDestination();
      this.synthA = new ToneJS.OmniOscillator(440, "sine").connect(this.env);
    } } else {
      //Volver a la config ADSR default
      console.log("Está inhabilitado el filtro");
      this.ADSR={
        "attack": 0,
        "decay": 0.2,
        "sustain": 1,
        "release": 0.8,
       
      };
      this.attack=this.ADSR["attack"]/0.02;
      this.decay=this.ADSR["decay"]/0.02;
      this.sustain=this.ADSR["sustain"]/0.01;
      this.release=this.ADSR["release"]/0.05;
      
    }

  }


  seleccionarInstrumento(event: any) {
    console.log(event);
  }
  setMinMax() {
    if (this.maxFreq < this.minFreqGraph * 30 || this.minFreq > this.maxFreqGraph * 60) {
      this.minFreqGraph = this.minFreq / 30;
      this.maxFreqGraph = this.maxFreq / 60;
      this.reproducirTono(1, true);
    }
    else {
      this.minFreq = this.minFreqGraph * 30;
      this.maxFreq = this.maxFreqGraph * 60;
      this.generarFrecuencias();
    }
  }
  logaritmico() {
    if (this.logaritmic) {
      this.logaritmic = false;
      this.generarFrecuencias();//      
    } else {
      this.logaritmic = true;
      this.generarFrecuencias();
    }
  }
  seleccionarTipoLinea(tipo: string) {
    this.tipoLinea = tipo;
    this.updateGraph();

  }
  seleccionarColorLinea(color: string) {
    this.colorLinea = color;
    this.updateGraph();

  }
  seleccionarMarkerStyle(markerStyle: string) {
    this.markerStyle = markerStyle;
    this.marcadores.forEach(element => {
      element.marker.symbol = this.markerStyle;
    });
    this.updateGraph();

  }

  @HostListener('document:keyup', ['$event'])
  public onKeyUp(eventData: KeyboardEvent) {
    if (this.frecuencias[0] == null) {
      this.zoom();
    }
    switch (eventData.key) {
      case "ArrowLeft":
        this.GlobalIndex -= 1;
        this.indiceGrafico = (this.GlobalIndex - this.rangoMin) * 100 / (this.rangoMax - this.rangoMin);
        this.reproducirTono(5, false);
        break;
      case "ArrowRight":
        this.GlobalIndex += 1;
        this.indiceGrafico = (this.GlobalIndex - this.rangoMin) * 100 / (this.rangoMax - this.rangoMin);
        this.reproducirTono(5, false);
        break;
      case "S":
        this.Stop();
        break;
      case "D":
        this.deleteMarcador();
        break;
      case "f":
        this.addMarcador();
        break;
      case "O":
        console.log("carga archivos"); //TODO: Implementar
      case "P":
        this.PlayPause();  
      default:
        //console.log(eventData.key)
        break;
    }

  }
  handleTitles(evento, caso ) {
    this.layout.yaxis.title.text = this.ordinateTitle;
    this.layout.xaxis.title.text = this.abscissaTitle;
    this.layout.title.text = this.graphTitle;
    this.updateGraph();
  }
}

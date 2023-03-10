
// Returns Uint8Array of WAV bytes
  function getWavBytes(buffer, options) {
  console.log("buff"+buffer)
  const type = options.isFloat ? Float32Array : Uint16Array
  const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT

  const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
  const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

  // prepend header, then add pcmBytes
  wavBytes.set(headerBytes, 0)
  wavBytes.set(new Uint8Array(buffer), headerBytes.length)

  return wavBytes
}

// adapted from https://gist.github.com/also/900023
// returns Uint8Array of WAV header bytes
function getWavHeader(options) {
  const numFrames = options.numFrames
  const numChannels = options.numChannels || 2
  const sampleRate = options.sampleRate || 44100
  const bytesPerSample = options.isFloat ? 4 : 2
  const format = options.isFloat ? 3 : 1

  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = numFrames * blockAlign

  const buffer = new ArrayBuffer(44)
  const dv = new DataView(buffer)

  let p = 0

  function writeString(s) {
    for (let i = 0; i < s.length; i++) {
      dv.setUint8(p + i, s.charCodeAt(i))
    }
    p += s.length
  }

  function writeUint32(d) {
    dv.setUint32(p, d, true)
    p += 4
  }

  function writeUint16(d) {
    dv.setUint16(p, d, true)
    p += 2
  }

  writeString('RIFF')              // ChunkID
  writeUint32(dataSize + 36)       // ChunkSize
  writeString('WAVE')              // Format
  writeString('fmt ')              // Subchunk1ID
  writeUint32(16)                  // Subchunk1Size
  writeUint16(format)              // AudioFormat
  writeUint16(numChannels)         // NumChannels
  writeUint32(sampleRate)          // SampleRate
  writeUint32(byteRate)            // ByteRate
  writeUint16(blockAlign)          // BlockAlign
  writeUint16(bytesPerSample * 8)  // BitsPerSample
  writeString('data')              // Subchunk2ID
  writeUint32(dataSize)            // Subchunk2Size

  return new Uint8Array(buffer)
}
 function downloadBlob(blob, name) {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}
export function createWav(buffer,name) {
  // Float32Array samples
  const [left, right] = [buffer.getChannelData(0), buffer.getChannelData(1)]

  // interleaved
  const interleaved = new Float32Array(left.length + right.length)
  for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
    interleaved[dst] = left[src]
    interleaved[dst + 1] = right[src]
  }

  // get WAV file bytes and audio params of your audio source
  const wavBytes = getWavBytes(interleaved.buffer, {
    isFloat: true,       // floating point or 16-bit integer
    numChannels: 2,
    sampleRate: 48000,
  })
  
  const wav = new Blob([wavBytes], { type: 'audio/wav' })

  // create download link and append to Dom
  downloadBlob(wav,name);
}
export function saveMarkers(marcadores: number[],datos:number[],datos_x:number[],graphTitle:string) {
  console.log(marcadores);
  console.log("marcadores");
  
  if (marcadores == undefined) { console.log('No hay marcadores') }
  else {
    // let csvContent = "data:text/csv;charset=utf-8,";
    //Para añadir los datos de y habría que traer el array de datos y grabar la posición
    let csvContent="";
    marcadores.forEach(element => {
      console.log("X: "+ element['x'][0]);
      console.log(findIndex(element['x'][0],datos_x));
      csvContent += element['x'][0] + ",";
      csvContent += datos[findIndex(element['x'][0],datos_x)] + ",",
      csvContent+="\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', graphTitle+' markers.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    }
  }
}
function findIndex(globalIndex, datos_x) {
  var indice;

  for (let index = 0; index < datos_x.length; index++) {
    if (datos_x[index] >= globalIndex) {
     indice = index;
      break;
    }
  }
  return indice;
}
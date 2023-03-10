import * as A from "arcsecond";
import * as B from "arcsecond-binary";

export function getAudioData(file, gate) {
  const riffChunkSize = B.u32LE.chain((size) => {
    //TODO: check health... File length is undefined
    if (size !== file.byteLength - 8) {
      return A.fail(`Invalid file size: ${file.length}. Expected ${size}`);
    }
    return A.succeedWith(size);
  });

  const riffChunk = A.sequenceOf([A.str("RIFF"), riffChunkSize, A.str("WAVE")]);

  const fmtSubChunk = A.coroutine(function* () {
    const id = yield A.str("fmt ");
    const subChunk1Size = yield B.u32LE;
    const audioFormat = yield B.u16LE;
    const numChannels = yield B.u16LE;
    const sampleRate = yield B.u32LE;
    const byteRate = yield B.u32LE;
    const blockAlign = yield B.u16LE;
    const bitsPerSample = yield B.u16LE;

    const expectedByteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    if (byteRate !== expectedByteRate) {
      yield A.fail(
        `Invalid byte rate: ${byteRate}, expected ${expectedByteRate}`
      );
    }

    const expectedBlockAlign = (numChannels * bitsPerSample) / 8;
    if (blockAlign !== expectedBlockAlign) {
      yield A.fail(
        `Invalid block align: ${blockAlign}, expected ${expectedBlockAlign}`
      );
    }

    const fmtChunkData = {
      id,
      subChunk1Size,
      audioFormat,
      numChannels,
      sampleRate,
      byteRate,
      blockAlign,
      bitsPerSample,
    };

    yield A.setData(fmtChunkData);

    return fmtChunkData;
  });

  const listInfo = A.coroutine(function* () {

  });

  const dataSubChunk = A.coroutine(function* () {
    var aux = yield B.u8;
    console.log(aux);
   
    if (aux === 76) {
      console.log("LIST")
      var id=yield A.str("IST");
      const sizeList=yield B.u32LE;
      const getINFO= yield A.str("INFO");
      console.log(sizeList);
      for (let index = 0; index < sizeList-4; index++) {
        const element = yield B.s8;
        
      }
       id = yield A.str("data");
    } else {
      if(aux==100){
        console.log("Solo DATA")
        const id = yield A.str("ata");
      }
      
    }
    
    const size = yield B.u32LE;

    const fmtData = yield A.getData;

    const samples = size / fmtData.numChannels / (fmtData.bitsPerSample / 8);
    const channelData = Array.from({ length: fmtData.numChannels }, () => []);

    let sampleParser;
    if (fmtData.bitsPerSample === 8) {
      sampleParser = B.s8;
    } else if (fmtData.bitsPerSample === 16) {
      sampleParser = B.s16LE;
    } else if (fmtData.bitsPerSample === 32) {
      sampleParser = B.s32LE;
    } else {
      yield A.fail(`Unsupported bits per sample: ${fmtData.bitsPerSample}`);
    }

    for (let sampleIndex = 0; sampleIndex < samples; sampleIndex++) {
      for (let i = 0; i < fmtData.numChannels; i++) {
        const sampleValue = yield sampleParser;
        channelData[i].push(sampleValue);
      }
    }
    return {
      id,
      size,
      channelData,
    };
  });

  //Combinador de todos los metodos
  const parser = A.sequenceOf([
    riffChunk,
    fmtSubChunk,
    dataSubChunk,
   // A.endOfInput,
  ]).map(([riffChunk, fmtSubChunk, dataSubChunk]) => ({
    riffChunk,
    fmtSubChunk,
    dataSubChunk,
  }));

  const output = parser.run(file);
  if (output.isError) {
    throw new Error(output.error);
  }

  console.log(output.result["fmtSubChunk"]["sampleRate"]);
  gate =
    ((output.result["fmtSubChunk"]["sampleRate"] /
      output.result["fmtSubChunk"]["sampleRate"]) *
      100) /
    gate;
  var arrayDatos = output.result["dataSubChunk"]["channelData"][0];
  var arrayFinal = [];

  //output.result['dataSubChunk']['channelData'][0] Array datos
  for (let index = 0; index < arrayDatos.length; index) {
    var aux = 0;
    for (var i = 0; i < gate; i++) {
      aux += arrayDatos[i + index] * arrayDatos[i + index];
    }
    var aux2=Math.sqrt(aux / gate);
    if(isNaN(aux2))
    {}else{arrayFinal.push(Math.sqrt(aux / gate));}
    
    index = i + index;
  }
  console.log(
    "----------------------------Resultado---------------------------"
  );
  console.log(arrayDatos);
  console.log(arrayFinal);
  return arrayFinal;
}

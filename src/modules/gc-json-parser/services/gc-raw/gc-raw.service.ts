// tslint:disable: max-line-length
import { Injectable } from '@nestjs/common';

@Injectable()
export class GcRawService {
    private COMMA_WORDS = `,"words"`;
    constructor() {}

    processString(rawString: string): string {
        const partialJson = rawString.replace(/\bdata\b/g, `"data" :`).replace(/\bstart_time\b/g, `"start_time" :`).replace(/\bwords\b/g, `,"words" :`).replace(/\bend_time\b/g, `,"end_time" :`).replace(/\bnanos\b/g, `,"nanos"`).replace(/\bword\b/g, `, "word"`).replace(/\bspeaker_tag\b/g, `, "speaker_tag"`).replace(/\bseconds\b/g, `" seconds"`);
        const indexOfCommaWords = partialJson.indexOf(this.COMMA_WORDS);
        console.log('first index of comma words', indexOfCommaWords);

        const firstHalf = partialJson.substring(0, indexOfCommaWords + this.COMMA_WORDS.length + 1);
        const secondHalf = partialJson.slice(firstHalf.length - 1);

        const correctWords = firstHalf.replace(`,"words"`, `"words"`);

        console.log('first half now is ', firstHalf + firstHalf.length);
        console.log('correct words now is ', correctWords + correctWords.length);
        // join this in the begining
        const compconsteJSON = correctWords + secondHalf;
        // let c = compconsteJSON.replace(`", "words""`, `, "words"`);
        let finalString = `{ ${compconsteJSON} }`;
 //       console.log(JSON.parse(finalString));
        return finalString;
    }
}

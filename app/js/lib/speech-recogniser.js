'use strict';

const p = Object.freeze({
  isListening: Symbol('isListening'),
  recognition: Symbol('recognition'),
  supportsRecognition: Symbol('supportsRecognition'),
});

export default class SpeechRecogniser {
  constructor() {
    this[p.isListening] = false;

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this[p.supportsRecognition] = !!Recognition;

    if (Recognition) {
      this[p.recognition] = new Recognition();
    } else {
      this[p.recognition] = {};
    }
  }

  listenForUtterance() {
    if (!this[p.supportsRecognition]) {
      return Promise.reject(
          new Error('Speech recognition not supported in this browser'));
    }

    return new Promise((resolve, reject) => {
      if (this[p.isListening]) {
        return reject(new Error('Speech recognition is already listening'));
      }

      this[p.isListening] = true;

      this[p.recognition].onresult = (event) => {
        this[p.recognition].stop();
        this[p.isListening] = false;

        // Always take first result
        const result = event.results[0][0];

        return resolve({
          confidence: result.confidence,
          utterance: result.transcript,
        });
      };

      this[p.recognition].start();
    });
  }
}

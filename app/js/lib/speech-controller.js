'use strict';

import EventDispatcher from './common/event-dispatcher';
import WakeWordRecogniser from './wakeword/recogniser.js';
import SpeechRecogniser from './speech-recogniser';

const p = Object.freeze({
  // Properties
  wakewordRecogniser: Symbol('wakewordRecogniser'),
  wakewordModelUrl: Symbol('wakewordModelUrl'),
  speechRecogniser: Symbol('speechRecogniser'),

  // Methods
  initialiseSpeechRecognition: Symbol('initialiseSpeechRecognition'),
  startListeningForWakeword: Symbol('startListeningForWakeword'),
  stopListeningForWakeword: Symbol('stopListeningForWakeword'),
  handleKeywordSpotted: Symbol('handleKeywordSpotted'),
  startSpeechRecognition: Symbol('startSpeechRecognition'),
  handleSpeechRecognitionEnd: Symbol('handleSpeechRecognitionEnd'),
  parseIntent: Symbol('parseIntent'),
  actOnIntent: Symbol('actOnIntent'),
});

const EVENT_INTERFACE = [
  // Emit when the wakeword is being listened for
  'wakelistenstart',

  // Emit when the wakeword is no longer being listened for
  'wakelistenstop',

  // Emit when the wakeword is heard
  'wakeheard',

  // Emit when the speech recognition engine starts listening
  // (And _could_ be sending speech over the network)
  'speechrecognitionstart',

  // Emit when the speech recognition engine returns a recognised phrase
  'speechrecognitionstop',
];

export default class SpeechController extends EventDispatcher {
  constructor() {
    super(EVENT_INTERFACE);

    const wakeWordRecogniser = new WakeWordRecogniser();
    const speechRecogniser = new SpeechRecogniser();

    wakeWordRecogniser.setOnKeywordSpottedCallback(
      this[p.handleKeywordSpotted].bind(this));

    this[p.wakewordRecogniser] = wakeWordRecogniser;
    this[p.wakewordModelUrl] = '/data/wakeword_model.json';

    this[p.speechRecogniser] = speechRecogniser;
  }

  [p.initialiseSpeechRecognition]() {
    return fetch('/data/wakeword_model.json')
      .then((response) => response.json())
      .then((model) => {
        this[p.wakewordRecogniser].loadModel(model);
      });
  }

  start() {
    return this[p.initialiseSpeechRecognition]()
      .then(this[p.startListeningForWakeword].bind(this));
  }

  [p.startListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[0]);
    return this[p.wakewordRecogniser].startListening();
  }

  [p.stopListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[1]);
    return this[p.wakewordRecogniser].stopListening();
  }

  [p.handleKeywordSpotted]() {
    this.emit(EVENT_INTERFACE[2]);

    return this[p.stopListeningForWakeword]()
      .then(this[p.startSpeechRecognition].bind(this))
      .then(this[p.handleSpeechRecognitionEnd].bind(this))
      .then(this[p.startListeningForWakeword].bind(this));
  }

  [p.startSpeechRecognition]() {
    this.emit(EVENT_INTERFACE[3]);

    return this[p.speechRecogniser]
      .listenForUtterance();
  }

  [p.handleSpeechRecognitionEnd](result) {
    this.emit(EVENT_INTERFACE[4], result);

    // Parse intent
    return this[p.parseIntent](result.phrase)
      .then(this[p.actOnIntent].bind(this));
  }

  [p.parseIntent]() {
    // Parse  - return 'result' (TBD) async
    return Promise.resolve();
  }

  [p.actOnIntent]() {
    // Act - return 'result' (TBD) async
    return Promise.resolve();
  }
}

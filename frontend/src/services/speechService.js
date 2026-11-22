/** @type {SpeechSynthesisUtterance|null} */
let currentUtterance = null;

export const speechService = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Speak the given text in the requested language.
   * @param {string} text
   * @param {'en'|'hi'|'pa'} lang
   * @param {(() => void)|null} onEnd
   * @param {(() => void)|null} onError
   * @returns {boolean}
   */
  speak(text, lang = 'en', onEnd = null, onError = null) {
    this.stop();
    if (!this.isSupported()) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        pa: 'pa-IN',
      };
      utterance.lang = langMap[lang] || 'en-US';
      utterance.rate = 0.88; // Gentle, slower rate for elderly listeners
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try selecting an appropriate voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetPrefix = langMap[lang] || 'en';
        const matchedVoice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(targetPrefix.toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onend = () => {
        currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        currentUtterance = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[speechService] Utterance error:', e.error);
          if (onError) onError(e);
        }
        if (onEnd) onEnd();
      };

      currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('[speechService] Error initiating speech:', err);
      if (onEnd) onEnd();
      return false;
    }
  },

  pause() {
    if (this.isSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  },

  resume() {
    if (this.isSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  },

  stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
  },

  isSpeaking() {
    return this.isSupported() && window.speechSynthesis.speaking;
  },

  isPaused() {
    return this.isSupported() && window.speechSynthesis.paused;
  },
};

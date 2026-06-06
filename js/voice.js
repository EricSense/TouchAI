export function initVoice(onTranscript, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += text;
      } else {
        interim += text;
      }
    }
    onTranscript(finalTranscript || interim, !!finalTranscript);
  };

  recognition.onend = () => {
    if (finalTranscript.trim()) {
      onEnd(finalTranscript.trim());
    } else {
      onEnd(null);
    }
    finalTranscript = '';
  };

  recognition.onerror = () => {
    onEnd(null);
    finalTranscript = '';
  };

  return recognition;
}

export function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

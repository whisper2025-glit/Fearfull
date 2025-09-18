export interface VoiceSettings {
  voiceURI: string;
  rate: number; // 0.1 - 10 (we will clamp 0.5 - 2 for UX)
  pitch: number; // 0 - 2
  volume: number; // 0 - 1
}

const STORAGE_KEY = 'chat_voice_settings';

export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [] as any;
  return window.speechSynthesis.getVoices();
}

export function loadVoiceSettings(): VoiceSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      voiceURI: String(parsed.voiceURI || ''),
      rate: Math.min(2, Math.max(0.5, Number(parsed.rate ?? 1))),
      pitch: Math.min(2, Math.max(0, Number(parsed.pitch ?? 1))),
      volume: Math.min(1, Math.max(0, Number(parsed.volume ?? 1))),
    };
  } catch {
    return null;
  }
}

export function saveVoiceSettings(v: VoiceSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {}
}

export function speakWithSettings(text: string, settings: VoiceSettings) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const t = text.trim();
  if (!t) return;
  const u = new SpeechSynthesisUtterance(t);
  const list = getSpeechVoices();
  const sel = list.find(v => v.voiceURI === settings.voiceURI) || list[0];
  if (sel) u.voice = sel;
  u.rate = settings.rate;
  u.pitch = settings.pitch;
  u.volume = settings.volume;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

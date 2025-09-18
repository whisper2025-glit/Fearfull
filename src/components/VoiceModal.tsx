import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { VoiceSettings, getSpeechVoices, loadVoiceSettings, saveVoiceSettings, speakWithSettings } from '@/lib/voice';

export interface VoiceModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value?: VoiceSettings | null;
  onSave: (v: VoiceSettings) => void;
}

const HEADER_IMAGE = 'https://cdn.builder.io/api/v1/image/assets%2F420adf53974e411387df983f01823d73%2F392819acbfbd45b29fde5014a4d4d347?format=webp&width=800';

export function VoiceModal({ open, onOpenChange, value, onSave }: VoiceModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(() => value || loadVoiceSettings() || { voiceURI: '', rate: 1, pitch: 1, volume: 1 });
  const [sample, setSample] = useState<string>('Hi! I am your character voice.');

  const load = () => {
    const list = getSpeechVoices();
    setVoices(list);
    if (!settings.voiceURI && list.length) {
      const preferred = list.find(v => /en[-_]/i.test(v.lang)) || list[0];
      setSettings(s => ({ ...s, voiceURI: preferred.voiceURI }));
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.speechSynthesis?.addEventListener?.('voiceschanged', handler);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value) setSettings(value);
  }, [value]);

  const selectedName = useMemo(() => {
    const v = voices.find(v => v.voiceURI === settings.voiceURI);
    return v ? `${v.name} (${v.lang})` : 'Not selected';
  }, [voices, settings.voiceURI]);

  const handleTest = () => speakWithSettings(sample, settings);

  const handleSave = () => {
    saveVoiceSettings(settings);
    onSave(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[80vh] bg-background border-border p-0 rounded-2xl w-[95vw] sm:w-auto sm:max-w-lg !gap-0 !grid-cols-1 !grid-rows-1 flex flex-col overflow-hidden text-xs">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="relative h-28 w-full flex-shrink-0">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HEADER_IMAGE})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <DialogHeader className="px-6 py-0 text-center">
                <DialogTitle className="text-sm font-bold text-white leading-tight flex items-center gap-2 justify-center">
                  Choose Voice
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white">Beta</span>
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto min-h-0 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Voice</label>
              <Select value={settings.voiceURI} onValueChange={(v) => setSettings(s => ({ ...s, voiceURI: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(v => (
                    <SelectItem key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Selected: {selectedName}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Rate: {settings.rate.toFixed(2)}</label>
                <Slider min={0.5} max={2} step={0.05} value={[settings.rate]} onValueChange={([v]) => setSettings(s => ({ ...s, rate: v }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Pitch: {settings.pitch.toFixed(2)}</label>
                <Slider min={0} max={2} step={0.05} value={[settings.pitch]} onValueChange={([v]) => setSettings(s => ({ ...s, pitch: v }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Volume: {settings.volume.toFixed(2)}</label>
                <Slider min={0} max={1} step={0.05} value={[settings.volume]} onValueChange={([v]) => setSettings(s => ({ ...s, volume: v }))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sample</label>
              <Textarea value={sample} onChange={(e) => setSample(e.target.value)} className="min-h-[80px] bg-secondary/50 border-border" />
              <div className="flex gap-2">
                <Button onClick={handleTest} variant="secondary">Test</Button>
                <Button onClick={() => window.speechSynthesis?.cancel?.()} variant="outline">Stop</Button>
              </div>
            </div>
          </div>

          <div className="p-6 flex-shrink-0 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

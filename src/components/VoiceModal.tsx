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
      <DialogContent className="bg-secondary border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Choose Voice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

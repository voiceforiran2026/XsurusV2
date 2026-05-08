// Basit beep sentezleyici — WAV (PCM 16-bit) dosyaları üretir.
// `node scripts/gen-sounds.mjs` ile çalıştırılır.
// Browser'lar mp3 yerine wav'ı da sorunsuz çalar; useNotifications.ts'de
// dosya yolunu .wav uzantısına alacağız.

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(dirname(__filename));
const OUT = join(ROOT, 'public', 'sounds');

const SAMPLE_RATE = 44100;

function envelope(t, total, attack = 0.01, release = 0.1) {
  if (t < attack) return t / attack;
  if (t > total - release) return (total - t) / release;
  return 1;
}

function writeWav(path, samples) {
  const numSamples = samples.length;
  const byteRate = SAMPLE_RATE * 2;
  const blockAlign = 2;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }

  writeFileSync(path, buffer);
}

function tone({ duration, segments }) {
  // segments: [{ freq, dur, gain }]
  const total = duration;
  const samples = new Float32Array(Math.round(total * SAMPLE_RATE));
  let cursor = 0;
  for (const seg of segments) {
    const segLen = Math.round(seg.dur * SAMPLE_RATE);
    for (let i = 0; i < segLen && cursor + i < samples.length; i++) {
      const t = i / SAMPLE_RATE;
      const env = envelope(t, seg.dur, 0.005, Math.min(0.05, seg.dur * 0.4));
      samples[cursor + i] += Math.sin(2 * Math.PI * seg.freq * t) * env * seg.gain;
    }
    cursor += segLen;
  }
  return samples;
}

// Ping — kısa, parlak yeni-talep tonu (yüksek frekans)
const ping = tone({
  duration: 0.28,
  segments: [
    { freq: 988, dur: 0.08, gain: 0.55 }, // B5
    { freq: 1318, dur: 0.18, gain: 0.5 }, // E6
  ],
});

// Success — yumuşak yükselen üçlü
const success = tone({
  duration: 0.55,
  segments: [
    { freq: 523, dur: 0.12, gain: 0.5 }, // C5
    { freq: 659, dur: 0.12, gain: 0.5 }, // E5
    { freq: 784, dur: 0.28, gain: 0.55 }, // G5
  ],
});

// Cancel — alçalan kısa uyarı
const cancel = tone({
  duration: 0.32,
  segments: [
    { freq: 440, dur: 0.13, gain: 0.45 }, // A4
    { freq: 277, dur: 0.18, gain: 0.45 }, // C#4
  ],
});

writeWav(join(OUT, 'ping.wav'), ping);
writeWav(join(OUT, 'success.wav'), success);
writeWav(join(OUT, 'cancel.wav'), cancel);

console.log('OK — generated ping.wav, success.wav, cancel.wav into public/sounds/');

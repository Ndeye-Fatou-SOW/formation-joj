import type { Medal, PodiumGap, PodiumResponse, PodiumStatus } from '@joj/shared';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { podiumsApi } from '../api/podiums.api';

/** Le verdict, en grand bandeau coloré. */
const STATUS_STYLES: Record<PodiumStatus, { label: string; banner: string; text: string }> = {
  certifie: {
    label: '✅ CERTIFIÉ',
    banner: 'bg-emerald-600 text-white',
    text: 'Identique au résultat officiel des Jeux : vous pouvez publier.',
  },
  'en-ecart': {
    label: '🔎 À VÉRIFIER',
    banner: 'bg-amber-400 text-amber-950',
    text: 'Votre podium diffère du résultat officiel : regardez les médailles signalées.',
  },
  provisoire: {
    label: '⏳ PROVISOIRE',
    banner: 'bg-sky-500 text-white',
    text: 'Les Jeux n’ont pas encore publié le résultat officiel de cette épreuve.',
  },
};

/** Les épreuves proposées ; les quatre premières ont un résultat officiel. */
const EVENTS = [
  '100 m filles',
  'Saut en longueur filles',
  'Lutte -60 kg garçons',
  'Basketball 3x3 filles',
  '1500 m garçons',
  'Aviron de mer garçons',
];

const COUNTRIES: Record<string, string> = {
  BRA: 'Brésil',
  CHN: 'Chine',
  CIV: 'Côte d’Ivoire',
  EGY: 'Égypte',
  USA: 'États-Unis',
  FRA: 'France',
  GAM: 'Gambie',
  JPN: 'Japon',
  KEN: 'Kenya',
  MAR: 'Maroc',
  NGA: 'Nigeria',
  SEN: 'Sénégal',
};

const countryName = (code: string) => COUNTRIES[code] ?? code;

/** Une grande carte par médaille, chacune dans sa couleur. */
const MEDAL_CARDS: ReadonlyArray<{
  medal: Medal;
  key: 'gold' | 'silver' | 'bronze';
  icon: string;
  title: string;
  card: string;
}> = [
  { medal: 'or', key: 'gold', icon: '🥇', title: 'OR', card: 'from-yellow-300 to-amber-500' },
  {
    medal: 'argent',
    key: 'silver',
    icon: '🥈',
    title: 'ARGENT',
    card: 'from-slate-200 to-slate-400',
  },
  {
    medal: 'bronze',
    key: 'bronze',
    icon: '🥉',
    title: 'BRONZE',
    card: 'from-orange-300 to-orange-600',
  },
];

type Form = { journalist: string; event: string; gold: string; silver: string; bronze: string };

export function PodiumPage() {
  const [form, setForm] = useState<Form>({
    journalist: '',
    event: '',
    gold: '',
    silver: '',
    bronze: '',
  });
  const [result, setResult] = useState<PodiumResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const medals = [form.gold, form.silver, form.bronze];
  const complete = form.journalist.trim() !== '' && form.event !== '' && medals.every(Boolean);
  const duplicate = medals.every(Boolean) && new Set(medals).size < 3;

  // Vérification en temps réel : dès que le podium est complet et sans doublon.
  useEffect(() => {
    if (!complete || duplicate) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      podiumsApi.submit({ ...form, journalist: form.journalist.trim() }).then(
        (podium) => {
          if (!cancelled) {
            setResult(podium);
            setError(null);
          }
        },
        () => {
          if (!cancelled) setError('Vérification impossible : l’API ne répond pas.');
        },
      );
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form, complete, duplicate]);

  const set = (name: keyof Form) => (value: string) => setForm({ ...form, [name]: value });

  // Un ancien résultat n'est plus montré dès que le podium redevient incomplet.
  const shown = complete && !duplicate ? result : null;
  const status = shown ? STATUS_STYLES[shown.status] : null;
  const gapFor = (medal: Medal): PodiumGap | undefined =>
    shown?.gaps.find((gap) => gap.medal === medal);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
      {/* Bandeau aux couleurs du Sénégal. */}
      <div className="flex h-3">
        <div className="flex-1 bg-emerald-600" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      <header className="flex flex-col items-center gap-1 bg-gradient-to-b from-yellow-50 to-white px-6 pt-8 pb-4 text-center">
        <span className="text-xs font-bold tracking-[0.3em] text-emerald-700 uppercase">
          JOJ Dakar 2026
        </span>
        <h1 className="text-6xl font-black tracking-[0.15em] text-slate-900">
          N<span className="text-emerald-600">D</span>
          <span className="text-yellow-500">A</span>
          <span className="text-red-600">M</span>
        </h1>
        <p className="text-slate-600">
          La victoire, vérifiée en direct contre les résultats officiels.
        </p>
      </header>

      <div className="flex flex-col gap-6 px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journalist">Journaliste</Label>
            <Input
              id="journalist"
              value={form.journalist}
              placeholder="Votre nom"
              maxLength={100}
              onChange={(e) => set('journalist')(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event">Épreuve</Label>
            <NativeSelect
              id="event"
              value={form.event}
              onChange={(e) => set('event')(e.target.value)}
            >
              <option value="">Choisir une épreuve</option>
              {EVENTS.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {MEDAL_CARDS.map((card) => {
            const gap = gapFor(card.medal);
            return (
              <div
                key={card.key}
                className={`flex flex-col gap-3 rounded-2xl bg-gradient-to-br p-4 shadow-md transition ${card.card} ${gap ? 'ring-4 ring-red-500' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{card.icon}</span>
                  <span className="text-lg font-black tracking-widest text-slate-900/80">
                    {card.title}
                  </span>
                </div>
                <NativeSelect
                  aria-label={`Pays médaillé ${card.medal}`}
                  value={form[card.key]}
                  className="bg-white/95 font-semibold"
                  onChange={(e) => set(card.key)(e.target.value)}
                >
                  <option value="">Choisir un pays</option>
                  {Object.entries(COUNTRIES).map(([code, nameFr]) => (
                    <option key={code} value={code}>
                      {nameFr} ({code})
                    </option>
                  ))}
                </NativeSelect>
                {gap && (
                  <p className="rounded-lg bg-white/90 px-3 py-1.5 text-sm text-slate-800">
                    Officiel : <strong>{countryName(gap.official)}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div aria-live="polite">
          {duplicate && (
            <p className="rounded-2xl bg-amber-100 px-5 py-4 text-center font-semibold text-amber-900">
              Un même pays ne peut pas recevoir deux médailles.
            </p>
          )}
          {error && (
            <p className="rounded-2xl bg-slate-100 px-5 py-4 text-center text-slate-800">{error}</p>
          )}
          {!complete && !duplicate && (
            <p className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-4 text-center text-slate-500">
              Choisissez l’épreuve et les trois pays : le verdict s’affiche ici.
            </p>
          )}
          {shown && status && (
            <div
              className={`flex flex-col items-center gap-1 rounded-2xl px-5 py-5 text-center shadow-lg ${status.banner}`}
            >
              <span className="text-3xl font-black tracking-wider">{status.label}</span>
              <span className="font-semibold">{shown.event}</span>
              <span className="opacity-90">{status.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

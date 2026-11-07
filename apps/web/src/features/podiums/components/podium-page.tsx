import type { PodiumResponse, PodiumStatus } from '@joj/shared';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { podiumsApi } from '../api/podiums.api';

/** Couleurs douces : un liseré à gauche et un fond pâle, sans cadre qui couvre la page. */
const STATUS_STYLES: Record<
  PodiumStatus,
  { label: string; panel: string; badge: string; text: string }
> = {
  certifie: {
    label: '✅ Certifié',
    panel: 'border-l-4 border-emerald-500 bg-emerald-50/80',
    badge: 'bg-emerald-600 text-white',
    text: 'Identique au résultat officiel des Jeux : vous pouvez publier.',
  },
  'en-ecart': {
    label: '🔎 À vérifier',
    panel: 'border-l-4 border-orange-400 bg-orange-50/80',
    badge: 'bg-orange-500 text-white',
    text: 'Votre podium diffère du résultat officiel sur les médailles ci-dessous.',
  },
  provisoire: {
    label: '⏳ Provisoire',
    panel: 'border-l-4 border-sky-400 bg-sky-50/80',
    badge: 'bg-sky-600 text-white',
    text: 'Les Jeux n’ont pas encore publié le résultat officiel de cette épreuve.',
  },
};

const MEDAL_LABELS = { or: '🥇 Or', argent: '🥈 Argent', bronze: '🥉 Bronze' } as const;

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

/** Fond décoratif : des anneaux colorés en motif, sur un dégradé chaud de Dakar. */
const PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="none" stroke-width="3" opacity="0.18">' +
    '<circle cx="40" cy="40" r="22" stroke="#0e9f6e"/><circle cx="120" cy="60" r="16" stroke="#f59e0b"/>' +
    '<circle cx="70" cy="120" r="26" stroke="#ef4444"/><circle cx="140" cy="140" r="10" stroke="#0ea5e9"/>' +
    '</svg>',
)}")`;

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

  const countrySelect = (name: 'gold' | 'silver' | 'bronze', label: string) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <NativeSelect
        id={name}
        value={form[name]}
        className="bg-white"
        onChange={(e) => set(name)(e.target.value)}
      >
        <option value="">Choisir un pays</option>
        {Object.entries(COUNTRIES).map(([code, nameFr]) => (
          <option key={code} value={code}>
            {nameFr} ({code})
          </option>
        ))}
      </NativeSelect>
    </div>
  );

  // Un ancien résultat n'est plus montré dès que le podium redevient incomplet.
  const shown = complete && !duplicate ? result : null;
  const status = shown ? STATUS_STYLES[shown.status] : null;

  return (
    <div
      className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-100 p-4 shadow-inner sm:p-8"
      style={{ backgroundImage: PATTERN }}
    >
      <header className="flex flex-col gap-1 text-center">
        <p className="text-sm font-semibold tracking-widest text-orange-700 uppercase">
          JOJ Dakar 2026
        </p>
        <h1 className="bg-gradient-to-r from-emerald-700 via-amber-500 to-red-600 bg-clip-text text-5xl font-extrabold text-transparent">
          Ndam
        </h1>
        <p className="text-slate-700">
          Le podium constaté, comparé en direct aux résultats officiels des Jeux.
        </p>
      </header>

      <div className="flex flex-col gap-5 rounded-2xl bg-white/90 p-5 shadow-lg backdrop-blur sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journalist">Journaliste</Label>
            <Input
              id="journalist"
              value={form.journalist}
              placeholder="Votre nom"
              maxLength={100}
              className="bg-white"
              onChange={(e) => set('journalist')(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event">Épreuve</Label>
            <NativeSelect
              id="event"
              value={form.event}
              className="bg-white"
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
          {countrySelect('gold', '🥇 Or')}
          {countrySelect('silver', '🥈 Argent')}
          {countrySelect('bronze', '🥉 Bronze')}
        </div>

        {/* Le résultat s'affiche ici, juste après le bronze. */}
        <div aria-live="polite">
          {duplicate && (
            <p className="rounded-lg border-l-4 border-orange-400 bg-orange-50 px-4 py-3 text-orange-900">
              Un même pays ne peut pas recevoir deux médailles.
            </p>
          )}
          {error && (
            <p className="rounded-lg border-l-4 border-slate-400 bg-slate-50 px-4 py-3 text-slate-800">
              {error}
            </p>
          )}
          {!complete && !duplicate && (
            <p className="text-center text-sm text-slate-500">
              Choisissez l’épreuve et les trois pays : le résultat s’affiche ici automatiquement.
            </p>
          )}
          {shown && status && (
            <div className={`flex flex-col gap-3 rounded-lg px-4 py-3 ${status.panel}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${status.badge}`}>
                  {status.label}
                </span>
                <span className="font-semibold text-slate-800">{shown.event}</span>
              </div>
              <p className="text-slate-700">{status.text}</p>
              {shown.gaps.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {shown.gaps.map((gap) => (
                    <li key={gap.medal} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{MEDAL_LABELS[gap.medal]}</span>
                      <span className="text-slate-500">vous avez choisi</span>
                      <span className="rounded bg-white px-2 py-0.5">
                        {countryName(gap.submitted)}
                      </span>
                      <span className="text-slate-500">→ officiel</span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                        {countryName(gap.official)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { Medal, PodiumGap, PodiumResponse, PodiumStatus } from '@joj/shared';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { podiumsApi } from '../api/podiums.api';

const STATUS_STYLES: Record<PodiumStatus, { label: string; badge: string; text: string }> = {
  certifie: {
    label: '✅ Certifié',
    badge: 'bg-emerald-400 text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.6)]',
    text: 'Identique au résultat officiel des Jeux : vous pouvez publier.',
  },
  'en-ecart': {
    label: '🔎 À vérifier',
    badge: 'bg-amber-300 text-amber-950 shadow-[0_0_24px_rgba(252,211,77,0.6)]',
    text: 'Votre podium diffère du résultat officiel : les marches concernées sont signalées.',
  },
  provisoire: {
    label: '⏳ Provisoire',
    badge: 'bg-sky-300 text-sky-950 shadow-[0_0_24px_rgba(125,211,252,0.6)]',
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

/** Motif d'anneaux colorés, posé sur un dégradé de nuit. */
const PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" fill="none" stroke-width="2" opacity="0.12">' +
    '<circle cx="45" cy="45" r="24" stroke="#34d399"/><circle cx="130" cy="60" r="18" stroke="#fbbf24"/>' +
    '<circle cx="80" cy="135" r="28" stroke="#f87171"/><circle cx="155" cy="155" r="12" stroke="#38bdf8"/>' +
    '</svg>',
)}")`;

/** Les marches du podium, dans l'ordre d'affichage : argent, or, bronze. */
const STEPS: ReadonlyArray<{
  medal: Medal;
  key: 'gold' | 'silver' | 'bronze';
  icon: string;
  rank: string;
  height: string;
  color: string;
}> = [
  {
    medal: 'argent',
    key: 'silver',
    icon: '🥈',
    rank: '2',
    height: 'h-28',
    color: 'from-slate-200 to-slate-400',
  },
  {
    medal: 'or',
    key: 'gold',
    icon: '🥇',
    rank: '1',
    height: 'h-40',
    color: 'from-yellow-200 to-amber-500',
  },
  {
    medal: 'bronze',
    key: 'bronze',
    icon: '🥉',
    rank: '3',
    height: 'h-20',
    color: 'from-orange-200 to-orange-600',
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

  const fieldClass = 'border-white/20 bg-white/95 text-slate-900';

  return (
    <div
      className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-5 text-white shadow-2xl sm:p-10"
      style={{ backgroundImage: PATTERN }}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

      <header className="relative flex flex-col items-center gap-2 text-center">
        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-amber-200 uppercase">
          JOJ Dakar 2026
        </span>
        <h1 className="bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-400 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl">
          Ndam
        </h1>
        <p className="max-w-md text-white/75">
          La victoire, vérifiée. Chaque podium est comparé en direct aux résultats officiels des
          Jeux.
        </p>
      </header>

      <div className="relative grid gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="journalist" className="text-white/90">
            Journaliste
          </Label>
          <Input
            id="journalist"
            value={form.journalist}
            placeholder="Votre nom"
            maxLength={100}
            className={fieldClass}
            onChange={(e) => set('journalist')(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event" className="text-white/90">
            Épreuve
          </Label>
          <NativeSelect
            id="event"
            value={form.event}
            className={fieldClass}
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

      {/* Le podium visuel : chaque marche porte la liste de son pays. */}
      <div className="relative grid grid-cols-3 items-end gap-3">
        {STEPS.map((step) => {
          const gap = gapFor(step.medal);
          const code = form[step.key];
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <span className="text-4xl drop-shadow-lg">{step.icon}</span>
              <p className="min-h-6 text-center font-bold">{code ? countryName(code) : '—'}</p>
              {gap && (
                <p className="rounded-full bg-amber-300 px-2 py-0.5 text-center text-xs font-semibold text-amber-950">
                  Officiel : {countryName(gap.official)}
                </p>
              )}
              <NativeSelect
                aria-label={`Pays médaillé ${step.medal}`}
                value={code}
                className={`${fieldClass} text-sm`}
                onChange={(e) => set(step.key)(e.target.value)}
              >
                <option value="">Choisir</option>
                {Object.entries(COUNTRIES).map(([value, nameFr]) => (
                  <option key={value} value={value}>
                    {nameFr} ({value})
                  </option>
                ))}
              </NativeSelect>
              <div
                className={`flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-3 text-4xl font-black text-white/90 shadow-lg transition-all duration-500 ${step.color} ${step.height} ${gap ? 'ring-4 ring-amber-300' : ''}`}
              >
                {step.rank}
              </div>
            </div>
          );
        })}
      </div>

      {/* Le verdict, juste sous le podium. */}
      <div
        aria-live="polite"
        className="relative flex min-h-16 flex-col items-center gap-2 text-center"
      >
        {duplicate && (
          <p className="text-amber-200">Un même pays ne peut pas recevoir deux médailles.</p>
        )}
        {error && <p className="text-rose-200">{error}</p>}
        {!complete && !duplicate && (
          <p className="text-white/60">
            Choisissez l’épreuve et les trois pays : le verdict apparaît ici.
          </p>
        )}
        {shown && status && (
          <>
            <span className={`rounded-full px-5 py-2 text-lg font-extrabold ${status.badge}`}>
              {status.label}
            </span>
            <p className="text-white/85">
              <span className="font-semibold">{shown.event}</span> · {status.text}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

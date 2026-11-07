import type { PodiumResponse, PodiumStatus } from '@joj/shared';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { podiumsApi } from '../api/podiums.api';

const STATUS_STYLES: Record<PodiumStatus, { label: string; className: string; text: string }> = {
  certifie: {
    label: '✅ Certifié',
    className: 'border-emerald-600 bg-emerald-50 text-emerald-800',
    text: 'Identique au résultat officiel des Jeux : vous pouvez publier.',
  },
  'en-ecart': {
    label: '⛔ En écart',
    className: 'border-red-600 bg-red-50 text-red-800',
    text: 'Différent du résultat officiel : ne publiez pas avant de vérifier.',
  },
  provisoire: {
    label: '⏳ Provisoire',
    className: 'border-amber-500 bg-amber-50 text-amber-800',
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
      <NativeSelect id={name} value={form[name]} onChange={(e) => set(name)(e.target.value)}>
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
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-gradient-to-r from-emerald-700 via-yellow-500 to-red-600 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Ndam</h1>
        <p className="mt-1 text-white/90">
          Vérifiez un podium contre les résultats officiels des JOJ Dakar 2026 avant de le publier.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Le podium constaté</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
            {countrySelect('gold', '🥇 Or')}
            {countrySelect('silver', '🥈 Argent')}
            {countrySelect('bronze', '🥉 Bronze')}
          </div>
          {!complete && !duplicate && (
            <p className="text-sm text-muted-foreground">
              Le résultat s’affiche automatiquement dès que le podium est complet.
            </p>
          )}
        </CardContent>
      </Card>

      {duplicate && (
        <p role="alert" className="rounded-lg border border-red-600 bg-red-50 p-4 text-red-800">
          Un même pays ne peut pas recevoir deux médailles.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-600 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {shown && status && (
        <section
          aria-live="polite"
          className={`flex flex-col gap-3 rounded-xl border-2 p-5 ${status.className}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">{shown.event}</h2>
            <span className="rounded-full border border-current px-3 py-1 text-sm font-bold">
              {status.label}
            </span>
          </div>
          <p>{status.text}</p>
          <p className="font-medium">
            🥇 {countryName(shown.gold)} · 🥈 {countryName(shown.silver)} · 🥉{' '}
            {countryName(shown.bronze)}
            <span className="font-normal"> — saisi par {shown.journalist}</span>
          </p>
          {shown.gaps.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-1">Médaille</th>
                  <th className="py-1">Saisi</th>
                  <th className="py-1">Officiel</th>
                </tr>
              </thead>
              <tbody>
                {shown.gaps.map((gap) => (
                  <tr key={gap.medal} className="border-t border-current/30">
                    <td className="py-1">{MEDAL_LABELS[gap.medal]}</td>
                    <td className="py-1 line-through">{countryName(gap.submitted)}</td>
                    <td className="py-1 font-bold">{countryName(gap.official)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

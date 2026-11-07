import type { PodiumResponse, PodiumStatus } from '@joj/shared';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { podiumsApi } from '../api/podiums.api';

const STATUS_STYLES: Record<PodiumStatus, { label: string; className: string; text: string }> = {
  certifie: {
    label: 'Certifié',
    className: 'border-emerald-600 bg-emerald-50 text-emerald-800',
    text: 'Identique au résultat officiel des Jeux : vous pouvez publier.',
  },
  'en-ecart': {
    label: 'En écart',
    className: 'border-red-600 bg-red-50 text-red-800',
    text: 'Différent du résultat officiel : ne publiez pas avant de vérifier.',
  },
  provisoire: {
    label: 'Provisoire',
    className: 'border-amber-500 bg-amber-50 text-amber-800',
    text: 'Les Jeux n’ont pas encore publié le résultat officiel de cette épreuve.',
  },
};

const MEDAL_LABELS = { or: '🥇 Or', argent: '🥈 Argent', bronze: '🥉 Bronze' } as const;

const EMPTY = { journalist: '', event: '', gold: '', silver: '', bronze: '' };

export function PodiumPage() {
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState<PodiumResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const field = (name: keyof typeof EMPTY, label: string, placeholder: string, upper = false) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        value={form[name]}
        placeholder={placeholder}
        maxLength={upper ? 3 : 100}
        onChange={(e) =>
          setForm({ ...form, [name]: upper ? e.target.value.toUpperCase() : e.target.value })
        }
      />
    </div>
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      setResult(await podiumsApi.submit(form));
    } catch {
      setResult(null);
      setError('Saisie refusée : vérifiez les noms et les codes pays (3 lettres, sans doublon).');
    } finally {
      setPending(false);
    }
  }

  const status = result ? STATUS_STYLES[result.status] : null;

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
          <CardTitle>Saisir le podium constaté</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('journalist', 'Journaliste', 'Awa')}
              {field('event', 'Épreuve', '100 m filles')}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {field('gold', '🥇 Or', 'CIV', true)}
              {field('silver', '🥈 Argent', 'EGY', true)}
              {field('bronze', '🥉 Bronze', 'JPN', true)}
            </div>
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? 'Vérification…' : 'Vérifier le podium'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="rounded-lg border border-red-600 bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}

      {result && status && (
        <section
          aria-live="polite"
          className={`flex flex-col gap-3 rounded-xl border-2 p-5 ${status.className}`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">{result.event}</h2>
            <span className="rounded-full border border-current px-3 py-1 text-sm font-bold">
              {status.label}
            </span>
          </div>
          <p>{status.text}</p>
          <p className="font-medium">
            🥇 {result.gold} · 🥈 {result.silver} · 🥉 {result.bronze}
            <span className="font-normal"> — saisi par {result.journalist}</span>
          </p>
          {result.gaps.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-1">Médaille</th>
                  <th className="py-1">Saisi</th>
                  <th className="py-1">Officiel</th>
                </tr>
              </thead>
              <tbody>
                {result.gaps.map((gap) => (
                  <tr key={gap.medal} className="border-t border-current/30">
                    <td className="py-1">{MEDAL_LABELS[gap.medal]}</td>
                    <td className="py-1 line-through">{gap.submitted}</td>
                    <td className="py-1 font-bold">{gap.official}</td>
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

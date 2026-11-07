import type { Medal, MedalTableRow, PodiumGap, PodiumResponse, PodiumStatus } from '@joj/shared';
import { useEffect, useState } from 'react';
import { NativeSelect } from '@/components/ui/native-select';
import { podiumsApi } from '../api/podiums.api';

/**
 * Style « Genesis » : cartes blanches à bordure fine, indigo pour l'interactif seulement,
 * couleurs sémantiques pour le statut. Le verdict s'affiche comme un tampon officiel.
 */
const STATUS_STYLES: Record<PodiumStatus, { label: string; stamp: string; text: string }> = {
  certifie: {
    label: 'Certifié',
    stamp: 'border-[#10B981] text-[#10B981]',
    text: 'Identique au résultat officiel des Jeux. Vous pouvez publier.',
  },
  'en-ecart': {
    label: 'À vérifier',
    stamp: 'border-[#EF4444] text-[#EF4444]',
    text: 'Différent du résultat officiel sur les médailles signalées.',
  },
  provisoire: {
    label: 'Provisoire',
    stamp: 'border-[#F59E0B] text-[#F59E0B]',
    text: 'Les Jeux n’ont pas encore publié le résultat officiel de cette épreuve.',
  },
};

/** Ce que dit la mascotte selon le verdict. */
const MASCOT_LINES: Record<PodiumStatus, string> = {
  certifie: 'Wóor na ! Podium certifié.',
  'en-ecart': 'Oups ! Vérifie avant de publier.',
  provisoire: 'Patience, le résultat officiel arrive.',
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

const MEDAL_ROWS: ReadonlyArray<{
  medal: Medal;
  key: 'gold' | 'silver' | 'bronze';
  icon: string;
  title: string;
}> = [
  { medal: 'or', key: 'gold', icon: '🥇', title: 'Or' },
  { medal: 'argent', key: 'silver', icon: '🥈', title: 'Argent' },
  { medal: 'bronze', key: 'bronze', icon: '🥉', title: 'Bronze' },
];

const FIELD =
  'h-[38px] rounded-md border border-[#E8E8EC] bg-white px-3.5 text-sm text-[#0A0A0A] shadow-none focus-visible:border-[#6366F1] focus-visible:ring-[3px] focus-visible:ring-[#6366F1]/15';
const OVERLINE = 'text-[11px] font-medium tracking-[0.12em] text-[#9C9C9C] uppercase';
const HEADING = 'font-[General_Sans,sans-serif] font-bold tracking-[-0.03em]';

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
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
        <div className="flex max-w-xl flex-col gap-4">
          <p className={OVERLINE}>JOJ Dakar 2026 · Résultats certifiés</p>
          <h1 className={`${HEADING} text-6xl leading-[1] sm:text-[72px]`}>
            La victoire,
            <br />
            <span className="text-[#20970B]">vérifiée.</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-[#6B6B6B]">
            Ndam compare chaque podium saisi par un journaliste aux résultats officiels des Jeux,
            avant qu’il soit publié. Une erreur arrêtée ici ne fait pas le tour des réseaux.
          </p>
        </div>
        <div className="relative flex items-end gap-3">
          <span
            aria-hidden="true"
            className="absolute -top-10 left-0 animate-spin text-6xl [animation-duration:3s]"
          >
            🏀
          </span>
          <p className="mb-16 max-w-40 rounded-xl border border-[#E8E8EC] bg-white px-3 py-2 text-[13px] font-medium">
            {shown ? MASCOT_LINES[shown.status] : 'Montre-moi ton podium !'}
          </p>
          <img
            src="/ayo.png"
            alt="Ayo, la mascotte des JOJ Dakar 2026"
            className="h-44 w-auto rounded-xl"
          />
        </div>
      </section>

      <section id="podium" className="grid scroll-mt-20 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Saisie. */}
        <div className="flex flex-col gap-6 rounded-xl border border-[#E8E8EC] bg-white p-6">
          <div className="flex flex-col gap-1">
            <p className={OVERLINE}>Étape 1</p>
            <h2 className={`${HEADING} text-2xl`}>Le podium constaté</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#6B6B6B]">
              Journaliste
              <input
                value={form.journalist}
                placeholder="Votre nom"
                maxLength={100}
                className={`${FIELD} outline-none placeholder:text-[#9C9C9C]`}
                onChange={(e) => set('journalist')(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#6B6B6B]">
              Épreuve
              <NativeSelect
                value={form.event}
                className={FIELD}
                onChange={(e) => set('event')(e.target.value)}
              >
                <option value="">Choisir une épreuve</option>
                {EVENTS.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </NativeSelect>
            </label>
          </div>
          <ul className="flex flex-col divide-y divide-[#E8E8EC] rounded-lg border border-[#E8E8EC]">
            {MEDAL_ROWS.map((row) => {
              const gap = gapFor(row.medal);
              return (
                <li key={row.key} className="flex flex-wrap items-center gap-4 px-4 py-3">
                  <span className="text-2xl">{row.icon}</span>
                  <span className="w-16 text-sm font-medium">{row.title}</span>
                  <NativeSelect
                    aria-label={`Pays médaillé ${row.medal}`}
                    value={form[row.key]}
                    className={`${FIELD} flex-1`}
                    onChange={(e) => set(row.key)(e.target.value)}
                  >
                    <option value="">Choisir un pays</option>
                    {Object.entries(COUNTRIES).map(([code, nameFr]) => (
                      <option key={code} value={code}>
                        {nameFr} ({code})
                      </option>
                    ))}
                  </NativeSelect>
                  {gap && (
                    <span className="rounded-full bg-[#EF4444]/10 px-3 py-1 text-xs font-medium text-[#EF4444]">
                      Officiel : {countryName(gap.official)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Verdict : un tampon officiel. */}
        <div
          aria-live="polite"
          className="flex flex-col justify-between gap-6 rounded-xl border border-[#E8E8EC] bg-white p-6"
        >
          <div className="flex flex-col gap-1">
            <p className={OVERLINE}>Étape 2</p>
            <h2 className={`${HEADING} text-2xl`}>Le verdict</h2>
          </div>
          <div className="flex min-h-48 items-center justify-center">
            {shown && status ? (
              <div
                key={`${shown.id}`}
                className={`flex -rotate-6 animate-[stamp_350ms_ease-out] flex-col items-center gap-1 rounded-lg border-4 border-double px-6 py-4 ${status.stamp}`}
              >
                <span className={`${HEADING} text-4xl uppercase`}>{status.label}</span>
                <span className="text-xs font-medium tracking-[0.2em] uppercase">
                  Ndam · {shown.event}
                </span>
              </div>
            ) : (
              <p className="text-center text-sm text-[#9C9C9C]">
                {duplicate
                  ? 'Un même pays ne peut pas recevoir deux médailles.'
                  : (error ?? 'Le tampon apparaît dès que le podium est complet.')}
              </p>
            )}
          </div>
          <p className="text-sm text-[#6B6B6B]">
            {status ? status.text : 'Comparaison avec les résultats officiels des Jeux.'}
          </p>
        </div>
      </section>

      <MedalTable />
    </div>
  );
}

/** Le tableau des médailles, calculé sur les seuls résultats officiels. */
function MedalTable() {
  const [rows, setRows] = useState<MedalTableRow[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    podiumsApi.medalTable(controller.signal).then(setRows, () => undefined);
    return () => controller.abort();
  }, []);

  if (rows.length === 0) return null;

  return (
    <section id="medailles" className="flex scroll-mt-20 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className={OVERLINE}>Résultats officiels uniquement</p>
        <h2 className={`${HEADING} text-[32px]`}>Tableau des médailles</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#E8E8EC] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E8E8EC] text-xs text-[#9C9C9C]">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Pays</th>
              <th className="px-4 py-3 text-center font-medium">🥇</th>
              <th className="px-4 py-3 text-center font-medium">🥈</th>
              <th className="px-4 py-3 text-center font-medium">🥉</th>
              <th className="px-4 py-3 text-center font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8EC]">
            {rows.map((row, index) => (
              <tr key={row.country} className="transition hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 text-[#9C9C9C]">{index + 1}</td>
                <td className="px-4 py-3 font-medium">
                  {countryName(row.country)}
                  {row.country === 'SEN' && (
                    <span className="ml-2 rounded-full bg-[#20970B]/10 px-2 py-0.5 text-xs text-[#20970B]">
                      Sénégal 🇸🇳
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{row.gold}</td>
                <td className="px-4 py-3 text-center">{row.silver}</td>
                <td className="px-4 py-3 text-center">{row.bronze}</td>
                <td className="px-4 py-3 text-center font-medium">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#9C9C9C]">Données fictives pour la démo.</p>
    </section>
  );
}

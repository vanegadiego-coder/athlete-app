'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const RUN_TYPES = ['Z2 Facil', 'Larga Z2', 'Intervalos', 'Tempo', 'Fartlek', 'Z3 Moderado', 'Z1 Recovery', 'Rodaje', 'Carrera libre'];

interface Props {
  userId: string;
  weekNumber: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function LogRunForm({ userId, weekNumber, onClose, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('Z2 Facil');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function save() {
    if (!distance || !duration) { setError('Distancia y duracion son requeridas'); return; }
    setSaving(true);
    const durationSec = Math.round(parseFloat(duration) * 60);
    const distKm = parseFloat(distance);
    const paceSecPerKm = durationSec / distKm;
    const paceMin = Math.floor(paceSecPerKm / 60);
    const paceSec = Math.round(paceSecPerKm % 60);
    const avgPace = `${paceMin}:${String(paceSec).padStart(2, '0')} min/km`;

    const { error: dbErr } = await supabase.from('runs_log').insert({
      user_id: userId, date, type,
      distance_km: distKm,
      duration_sec: durationSec,
      avg_pace: avgPace,
      avg_hr: avgHr ? parseInt(avgHr) : null,
      max_hr: maxHr ? parseInt(maxHr) : null,
      notes: notes || null,
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    onSaved();
  }

  const pace = distance && duration ? (() => {
    const sec = parseFloat(duration) * 60 / parseFloat(distance);
    return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
  })() : null;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold">Registrar carrera</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 text-2xl leading-none transition-colors">×</button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inputCls + " bg-zinc-800"}>
                {RUN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Distancia (km)</label>
              <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} placeholder="5.2" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Duracion (min)</label>
              <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" className={inputCls} />
            </div>
          </div>

          {pace && (
            <div className="border border-zinc-700 rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold">{pace} min/km</p>
              <p className="text-xs text-zinc-500">ritmo promedio</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">BPM promedio</label>
              <input type="number" value={avgHr} onChange={e => setAvgHr(e.target.value)} placeholder="148" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">BPM maximo</label>
              <input type="number" value={maxHr} onChange={e => setMaxHr(e.target.value)} placeholder="172" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Como te sentiste..." rows={2}
              className={inputCls + " resize-none"} />
          </div>

          {error && <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 rounded-lg p-3">{error}</p>}

          <button onClick={save} disabled={saving}
            className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 font-semibold py-3 rounded-xl transition-colors text-sm">
            {saving ? 'Guardando...' : 'Guardar carrera'}
          </button>
        </div>
      </div>
    </div>
  );
}

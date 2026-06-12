'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const RUN_TYPES = ['Z2 Fácil', 'Larga Z2', 'Intervalos', 'Tempo', 'Fartlek', 'Z3 Moderado', 'Z1 Recovery', 'Rodaje', 'Carrera libre'];

interface Props {
  userId: string;
  weekNumber: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function LogRunForm({ userId, weekNumber, onClose, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('Z2 Fácil');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [maxHr, setMaxHr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function save() {
    if (!distance || !duration) { setError('Distancia y duración son requeridas'); return; }
    setSaving(true);
    const durationSec = Math.round(parseFloat(duration) * 60);
    const distKm = parseFloat(distance);
    const paceSecPerKm = durationSec / distKm;
    const paceMin = Math.floor(paceSecPerKm / 60);
    const paceSec = Math.round(paceSecPerKm % 60);
    const avgPace = `${paceMin}:${String(paceSec).padStart(2, '0')} min/km`;

    const { error: dbErr } = await supabase.from('runs_log').insert({
      user_id: userId,
      date,
      type,
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

  const pace = distance && duration
    ? (() => {
        const sec = parseFloat(duration) * 60 / parseFloat(distance);
        return `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
      })()
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Registrar carrera</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {RUN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Distancia (km)</label>
              <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)}
                placeholder="5.2"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Duración (min)</label>
              <input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)}
                placeholder="30"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          {pace && (
            <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
              <p className="text-sm text-blue-700 font-semibold">Ritmo: {pace} min/km</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">BPM promedio</label>
              <input type="number" value={avgHr} onChange={e => setAvgHr(e.target.value)}
                placeholder="148"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">BPM máximo</label>
              <input type="number" value={maxHr} onChange={e => setMaxHr(e.target.value)}
                placeholder="172"
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="¿Cómo te sentiste? ¿Condiciones?"
              rows={2}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
          >
            {saving ? 'Guardando...' : '✓ Guardar carrera'}
          </button>
        </div>
      </div>
    </div>
  );
}

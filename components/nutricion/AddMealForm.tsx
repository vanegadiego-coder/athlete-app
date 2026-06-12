'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  date: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddMealForm({ userId, date, onClose, onSaved }: Props) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  }

  async function analyze() {
    if (!description && !image) {
      setError('Escribe una descripción o toma una foto');
      return;
    }
    setError('');
    setAnalyzing(true);
    try {
      const fd = new FormData();
      if (description) fd.append('description', description);
      if (image) fd.append('image', image);
      const res = await fetch('/api/analyze-meal', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError('Error al analizar: ' + e.message);
    }
    setAnalyzing(false);
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    const { error: dbErr } = await supabase.from('meals').insert({
      user_id: userId,
      date,
      name: result.name,
      calories: Math.round(result.calories),
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      notes: result.notes,
      ai_analyzed: true,
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    onSaved();
  }

  async function saveManual() {
    if (!description) return;
    setSaving(true);
    const { error: dbErr } = await supabase.from('meals').insert({
      user_id: userId,
      date,
      name: description,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ai_analyzed: false,
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Agregar comida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Foto (opcional)</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 text-center hover:border-green-400 transition"
              >
                <p className="text-3xl">📷</p>
                <p className="text-sm text-gray-500 mt-1">Toca para agregar foto</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: 2 huevos revueltos, 1 arepa, jugo de naranja..."
              rows={3}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

          {/* AI Result */}
          {result && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">IA estimó</span>
                <p className="font-bold text-gray-900 text-sm">{result.name}</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-orange-600">{Math.round(result.calories)}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div>
                  <p className="text-lg font-black text-blue-600">{Math.round(result.protein)}g</p>
                  <p className="text-xs text-gray-500">prot</p>
                </div>
                <div>
                  <p className="text-lg font-black text-yellow-600">{Math.round(result.carbs)}g</p>
                  <p className="text-xs text-gray-500">carbs</p>
                </div>
                <div>
                  <p className="text-lg font-black text-red-500">{Math.round(result.fat)}g</p>
                  <p className="text-xs text-gray-500">grasas</p>
                </div>
              </div>
              {result.notes && <p className="text-xs text-gray-500 italic">{result.notes}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {!result ? (
              <button
                onClick={analyze}
                disabled={analyzing || (!description && !image)}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
              >
                {analyzing ? '🤖 Analizando...' : '🤖 Analizar con IA'}
              </button>
            ) : (
              <button
                onClick={save}
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition"
              >
                {saving ? 'Guardando...' : '✓ Guardar comida'}
              </button>
            )}
            <button onClick={onClose} className="w-full text-gray-500 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

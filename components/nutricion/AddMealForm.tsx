'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  nutritionLogId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddMealForm({ nutritionLogId, onClose, onSaved }: Props) {
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
    if (!description && !image) { setError('Escribe una descripcion o toma una foto'); return; }
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
    } catch (e: any) { setError('Error: ' + e.message); }
    setAnalyzing(false);
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    const { error: dbErr } = await supabase.from('meals').insert({
      nutrition_log_id: nutritionLogId,
      food_description: result.name,
      calories: Math.round(result.calories),
      protein_g: result.protein,
      carbs_g: result.carbs,
      fats_g: result.fat,
      estimated_by_ai: true,
    });
    if (dbErr) { setError(dbErr.message); setSaving(false); return; }

    const { data: allMeals } = await supabase.from('meals').select('calories,protein_g,carbs_g,fats_g').eq('nutrition_log_id', nutritionLogId);
    if (allMeals) {
      await supabase.from('nutrition_log').update({
        calories: allMeals.reduce((s, m) => s + (m.calories || 0), 0),
        protein_g: allMeals.reduce((s, m) => s + (m.protein_g || 0), 0),
        carbs_g: allMeals.reduce((s, m) => s + (m.carbs_g || 0), 0),
        fats_g: allMeals.reduce((s, m) => s + (m.fats_g || 0), 0),
      }).eq('id', nutritionLogId);
    }
    onSaved();
  }

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600";

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold">Agregar comida</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 text-2xl leading-none transition-colors">×</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-full h-36 object-cover rounded-xl" />
                <button
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                >×</button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-zinc-700 rounded-xl py-8 text-center hover:border-zinc-500 transition-colors"
              >
                <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Agregar foto</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe lo que comiste — 2 huevos, arepa, jugo..."
            rows={3}
            className={inputCls + " resize-none"}
          />

          {error && <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 rounded-lg p-3">{error}</p>}

          {result && (
            <div className="border border-zinc-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Estimacion IA</p>
              <p className="text-sm font-semibold mb-3">{result.name}</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><p className="text-xl font-black tracking-tight">{Math.round(result.calories)}</p><p className="text-xs text-zinc-500">kcal</p></div>
                <div><p className="text-xl font-black tracking-tight">{Math.round(result.protein)}g</p><p className="text-xs text-zinc-500">prot</p></div>
                <div><p className="text-xl font-black tracking-tight">{Math.round(result.carbs)}g</p><p className="text-xs text-zinc-500">carbs</p></div>
                <div><p className="text-xl font-black tracking-tight">{Math.round(result.fat)}g</p><p className="text-xs text-zinc-500">grasas</p></div>
              </div>
              {result.notes && <p className="text-xs text-zinc-600 mt-3">{result.notes}</p>}
            </div>
          )}

          <div className="space-y-2 pt-1">
            {!result ? (
              <button onClick={analyze} disabled={analyzing || (!description && !image)}
                className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 disabled:text-zinc-600 font-semibold py-3 rounded-xl transition-colors text-sm">
                {analyzing ? 'Analizando...' : 'Analizar con IA'}
              </button>
            ) : (
              <button onClick={save} disabled={saving}
                className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-800 text-zinc-900 font-semibold py-3 rounded-xl transition-colors text-sm">
                {saving ? 'Guardando...' : 'Guardar comida'}
              </button>
            )}
            <button onClick={onClose} className="w-full text-zinc-600 py-2 text-sm hover:text-zinc-400 transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

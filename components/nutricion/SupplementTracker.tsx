'use client';

import { createClient } from '@/lib/supabase/client';

interface Props {
  userId: string;
  date: string;
  supplements: any;
  onUpdate: () => void;
}

export default function SupplementTracker({ userId, date, supplements, onUpdate }: Props) {
  const supabase = createClient();
  const creatine = supplements?.creatine_5g ?? false;
  const magnesium = supplements?.magnesium_210mg ?? false;

  async function toggle(field: 'creatine_5g' | 'magnesium_210mg') {
    const current = field === 'creatine_5g' ? creatine : magnesium;
    await supabase.from('supplements_log').upsert({
      user_id: userId,
      date,
      creatine_5g: field === 'creatine_5g' ? !current : creatine,
      magnesium_210mg: field === 'magnesium_210mg' ? !current : magnesium,
    }, { onConflict: 'user_id,date' });
    onUpdate();
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
      <h2 className="text-base font-bold text-gray-900 mb-3">💊 Suplementos</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => toggle('creatine_5g')}
          className={`rounded-lg p-3 border-2 text-center transition ${
            creatine ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
          }`}
        >
          <p className="text-xl">⚡</p>
          <p className="text-sm font-semibold mt-1">Creatina 5g</p>
          <p className="text-xs mt-0.5 opacity-75">{creatine ? 'Tomada ✓' : 'Pendiente'}</p>
        </button>
        <button
          onClick={() => toggle('magnesium_210mg')}
          className={`rounded-lg p-3 border-2 text-center transition ${
            magnesium ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
          }`}
        >
          <p className="text-xl">🌙</p>
          <p className="text-sm font-semibold mt-1">Magnesio 210mg</p>
          <p className="text-xs mt-0.5 opacity-75">{magnesium ? 'Tomado ✓' : 'Noche'}</p>
        </button>
      </div>
    </div>
  );
}

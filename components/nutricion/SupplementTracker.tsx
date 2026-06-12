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
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-100">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Suplementos</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-zinc-100">
        <button
          onClick={() => toggle('creatine_5g')}
          className={`px-5 py-4 text-left transition-colors ${creatine ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50'}`}
        >
          <p className="text-sm font-semibold">Creatina 5g</p>
          <p className={`text-xs mt-0.5 ${creatine ? 'text-zinc-400' : 'text-zinc-300'}`}>{creatine ? 'Tomada' : 'Pendiente'}</p>
        </button>
        <button
          onClick={() => toggle('magnesium_210mg')}
          className={`px-5 py-4 text-left transition-colors ${magnesium ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-50'}`}
        >
          <p className="text-sm font-semibold">Magnesio 210mg</p>
          <p className={`text-xs mt-0.5 ${magnesium ? 'text-zinc-400' : 'text-zinc-300'}`}>{magnesium ? 'Tomado' : 'Noche'}</p>
        </button>
      </div>
    </div>
  );
}

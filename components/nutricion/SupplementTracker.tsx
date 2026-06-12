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
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Suplementos</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-zinc-800">
        <button
          onClick={() => toggle('creatine_5g')}
          className={`px-5 py-4 text-left transition-colors ${creatine ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
        >
          <p className="text-sm font-semibold">Creatina 5g</p>
          <p className={`text-xs mt-0.5 ${creatine ? 'text-zinc-500' : 'text-zinc-600'}`}>{creatine ? 'Tomada' : 'Pendiente'}</p>
        </button>
        <button
          onClick={() => toggle('magnesium_210mg')}
          className={`px-5 py-4 text-left transition-colors ${magnesium ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}
        >
          <p className="text-sm font-semibold">Magnesio 210mg</p>
          <p className={`text-xs mt-0.5 ${magnesium ? 'text-zinc-500' : 'text-zinc-600'}`}>{magnesium ? 'Tomado' : 'Noche'}</p>
        </button>
      </div>
    </div>
  );
}

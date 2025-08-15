import { supabase } from '@/lib/supabase';
import { localCrystals } from '@/logs/localCrystalBackup';

export const syncAllCrystals = async () => {
  const { data, error } = await supabase
    .from('bbf_crystal_logs')
    .insert(localCrystals);
  if (error) {
    console.error('❌ Erro ao sincronizar:', error.message);
  } else {
    console.log('✅ Sincronização completa com Supabase!');
  }
};

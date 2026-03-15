import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client';

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  patient_id: string;
  taken_at: string;
  status: 'taken' | 'skipped' | 'missed';
  notes: string | null;
  created_at: string;
}

function createMedicationsStore() {
  const { subscribe, update, set } = writable<Medication[]>([]);

  return {
    subscribe,
    
    load: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        set(data);
      }
    },

    add: async (medication: Omit<Medication, 'id' | 'created_at' | 'is_active' | 'patient_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('medications')
        .insert({
          ...medication,
          patient_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (!error && data) {
        update(meds => [data, ...meds]);
        return data;
      }
      return null;
    },

    update: async (id: string, updates: Partial<Medication>) => {
      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        update(meds => meds.map(m => m.id === id ? data : m));
        return data;
      }
      return null;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('medications')
        .update({ is_active: false })
        .eq('id', id);

      if (!error) {
        update(meds => meds.filter(m => m.id !== id));
        return true;
      }
      return false;
    },

    logMedication: async (medicationId: string, status: 'taken' | 'skipped' | 'missed', notes?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id: medicationId,
          patient_id: user.id,
          taken_at: new Date().toISOString(),
          status,
          notes
        })
        .select()
        .single();

      return error ? null : data;
    },

    getLogs: async (medicationId?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('medication_logs')
        .select('*')
        .eq('patient_id', user.id)
        .order('taken_at', { ascending: false })
        .limit(50);

      if (medicationId) {
        query = query.eq('medication_id', medicationId);
      }

      const { data, error } = await query;
      return error ? [] : data;
    }
  };
}

export const medications = createMedicationsStore();

// Today's medications to take
export const todayMedications = writable<{ medication: Medication; time: string; status?: MedicationLog }[]>([]);

export async function loadTodayMedications() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await medications.load();
  
  const meds = await new Promise<Medication[]>(resolve => {
    medications.subscribe(m => resolve(m))();
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todayMeds: { medication: Medication; time: string; status?: MedicationLog }[] = [];

  for (const med of meds) {
    if (!med.is_active) continue;
    if (med.start_date > todayStr) continue;
    if (med.end_date && med.end_date < todayStr) continue;

    for (const time of med.times) {
      todayMeds.push({ medication: med, time });
    }
  }

  // Sort by time
  todayMeds.sort((a, b) => a.time.localeCompare(b.time));

  // Check if taken
  const logs = await medications.getLogs();
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.taken_at).toISOString().split('T')[0];
    return logDate === todayStr;
  });

  todayMeds.forEach(m => {
    const log = todayLogs.find(l => 
      l.medication_id === m.medication.id && 
      l.taken_at.includes(m.time)
    );
    if (log) m.status = log;
  });

  todayMedications.set(todayMeds);
}

-- Medication reminders table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[] NOT NULL, -- Array of times like ["08:00", "20:00"]
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable access for authenticated users
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Policy for patients to see their own medications
CREATE POLICY "Patients can view own medications" ON medications
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own medications" ON medications
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own medications" ON medications
  FOR DELETE USING (auth.uid() = patient_id);

-- Medication logs (when patient takes medication)
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'taken', -- taken, skipped, missed
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own logs" ON medication_logs
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own logs" ON medication_logs
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

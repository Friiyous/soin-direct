-- SoinDirect Database Schema

-- Table profiles (utilisateurs)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'ide', 'biologist', 'kine', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_naissance DATE,
  adresse TEXT NOT NULL,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table professionals
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialite TEXT NOT NULL,
  licence TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table missions
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type_soin TEXT NOT NULL CHECK (type_soin IN ('pansement', 'tension', 'prise_sang', 'perfusion', 'injection', 'surveillance', 'autre')),
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'accepte', 'termine', 'annule')),
  ordre_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  date_prevue TIMESTAMPTZ NOT NULL,
  date_acheve TIMESTAMPTZ,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  ordonnance_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table clinical_records
CREATE TABLE clinical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tension_sys INTEGER,
  tension_dia INTEGER,
  glycemie NUMERIC(5,2),
  poids NUMERIC(5,2),
  pouls INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (sécurité)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Patients policies
CREATE POLICY "Patients can read own data" ON patients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Pros can read all patients" ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ide', 'biologist', 'kine', 'admin'))
);

-- Missions policies
CREATE POLICY "Patients can manage own missions" ON missions FOR ALL USING (
  EXISTS (SELECT 1 FROM patients WHERE id = missions.patient_id AND user_id = auth.uid())
);

CREATE POLICY "Pros can read missions" ON missions FOR SELECT USING (
  EXISTS (SELECT 1 FROM professionals WHERE user_id = auth.uid())
);

-- Index pour performances
CREATE INDEX idx_missions_statut ON missions(statut);
CREATE INDEX idx_missions_patient ON missions(patient_id);
CREATE INDEX idx_missions_professional ON missions(ordre_id);
CREATE INDEX idx_clinical_records_mission ON clinical_records(mission_id);

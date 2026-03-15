// Mock Supabase client for demo mode
// Remplacer par le vrai client quand Supabase est configuré

export type UserRole = 'patient' | 'ide' | 'biologist' | 'kine' | 'admin';
export type MissionStatus = 'en_attente' | 'accepte' | 'termine' | 'annule';
export type TypeSoin = 'pansement' | 'tension' | 'prise_sang' | 'perfusion' | 'injection' | 'surveillance' | 'autre';

export interface Profile {
  id: string;
  email: string;
  nom: string;
  telephone: string;
  role: UserRole;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_naissance: string | null;
  adresse: string;
  gps_lat: number | null;
  gps_lng: number | null;
  profile?: Profile;
}

export interface Professional {
  id: string;
  user_id: string;
  specialite: string;
  licence: string;
  is_verified: boolean;
  profile?: Profile;
}

export interface Mission {
  id: string;
  patient_id: string;
  type_soin: TypeSoin;
  description: string;
  statut: MissionStatus;
  ordre_id: string | null;
  date_prevue: string;
  date_acheve: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  ordonnance_url: string | null;
  created_at: string;
  patient?: Patient;
}

export interface ClinicalRecord {
  id: string;
  mission_id: string;
  tension_sys: number | null;
  tension_dia: number | null;
  glycemie: number | null;
  poids: number | null;
  pouls: number | null;
  notes: string | null;
  created_at: string;
}

// Mock data
let missions: Mission[] = [
  {
    id: '1',
    patient_id: 'p1',
    type_soin: 'pansement',
    description: 'Pansement post-opératoire',
    statut: 'en_attente',
    ordre_id: null,
    date_prevue: new Date(Date.now() + 86400000).toISOString(),
    date_acheve: null,
    gps_lat: 5.3599,
    gps_lng: -4.0083,
    ordonnance_url: null,
    created_at: new Date().toISOString(),
    patient: {
      id: 'p1',
      user_id: 'u1',
      date_naissance: '1980-01-01',
      adresse: 'Abidjan, Cocody',
      gps_lat: 5.3599,
      gps_lng: -4.0083,
      profile: { id: 'u1', email: 'patient@demo.com', nom: 'Konan Jean', telephone: '+2250700000000', role: 'patient', created_at: '' }
    }
  },
  {
    id: '2',
    patient_id: 'p2',
    type_soin: 'prise_sang',
    description: 'Analyse sanguine mensuelle',
    statut: 'en_attente',
    ordre_id: null,
    date_prevue: new Date(Date.now() + 172800000).toISOString(),
    date_acheve: null,
    gps_lat: 5.3099,
    gps_lng: -4.0123,
    ordonnance_url: null,
    created_at: new Date().toISOString(),
    patient: {
      id: 'p2',
      user_id: 'u2',
      date_naissance: '1975-05-15',
      adresse: 'Abidjan, Marcory',
      gps_lat: 5.3099,
      gps_lng: -4.0123,
      profile: { id: 'u2', email: 'patient2@demo.com', nom: 'Akissi Marie', telephone: '+2250700000001', role: 'patient', created_at: '' }
    }
  },
  {
    id: '3',
    patient_id: 'p3',
    type_soin: 'tension',
    description: 'Contrôle tension artérielle',
    statut: 'accepte',
    ordre_id: 'ide-1',
    date_prevue: new Date(Date.now() + 43200000).toISOString(),
    date_acheve: null,
    gps_lat: 5.2899,
    gps_lng: -4.0250,
    ordonnance_url: null,
    created_at: new Date().toISOString(),
    patient: {
      id: 'p3',
      user_id: 'u3',
      date_naissance: '1960-08-20',
      adresse: 'Abidjan, Treichville',
      gps_lat: 5.2899,
      gps_lng: -4.0250,
      profile: { id: 'u3', email: 'patient3@demo.com', nom: 'Doumbia Oumar', telephone: '+2250700000002', role: 'patient', created_at: '' }
    }
  }
];

// Mock Supabase client for demo mode
export const supabase = {
  auth: {
    getSession: async () => {
      const user = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('demo_user') || 'null') : null;
      return { data: { session: user ? { user } : null }, error: null };
    },
    getUser: async () => {
      const user = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('demo_user') || 'null') : null;
      return { data: { user }, error: null };
    },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async ({ email }: { email: string }) => {
      await new Promise(r => setTimeout(r, 300));
      // Mock user logic consistent with auth store
      let user = { id: 'demo', email, role: 'patient' };
      if (email.includes('admin')) user.role = 'admin';
      else if (email.includes('ide') || email.includes('pro')) user.role = 'ide';
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    },
    signUp: async () => ({ data: { user: { id: 'demo' } }, error: null }),
    signOut: async () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('demo_user');
      return { error: null };
    },
  },
  from: (table: string) => {
    const chainable = {
      select: (cols?: string) => chainable,
      eq: (field: string, value: any) => chainable,
      order: (field: string, opts?: any) => chainable,
      limit: (n: number) => chainable,
      single: async () => {
        if (table === 'patients' || table === 'professionals') {
          return { data: { id: 'demo-id', user_id: 'demo' }, error: null };
        }
        return { data: null, error: null };
      },
      then: (cb: (res: { data: any, error: any }) => void) => {
        let data: any = [];
        if (table === 'missions') data = missions;
        else if (table === 'clinical_records') data = mockClinicalRecords;
        else if (table === 'patients' || table === 'professionals') data = [{ id: 'demo-id', user_id: 'demo' }];
        
        return Promise.resolve(cb({ data, error: null }));
      }
    };
    return chainable;
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'demo' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://demo.com/ordonnance.pdf' } })
    })
  }
};

const mockClinicalRecords = [
  { id: 'r1', mission_id: '1', tension_sys: 125, tension_dia: 82, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'r2', mission_id: '1', tension_sys: 118, tension_dia: 80, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'r3', mission_id: '1', tension_sys: 140, tension_dia: 90, created_at: new Date().toISOString() }
];

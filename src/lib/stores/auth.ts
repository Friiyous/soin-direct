import { writable } from 'svelte/store';

export type UserRole = 'patient' | 'ide' | 'biologist' | 'kine' | 'admin';

export interface Profile {
  id: string;
  email: string;
  nom: string;
  telephone: string;
  role: UserRole;
  created_at: string;
}

interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
}

// Données mockées pour démo
const mockUsers: Record<string, Profile> = {
  patient: {
    id: 'patient-1',
    email: 'patient@demo.com',
    nom: 'Konan Jean',
    telephone: '+225 07 00 000 000',
    role: 'patient',
    created_at: new Date().toISOString()
  },
  admin: {
    id: 'admin-1',
    email: 'admin@demo.com',
    nom: 'Admin SoinDirect',
    telephone: '+225 07 00 000 002',
    role: 'admin',
    created_at: new Date().toISOString()
  }
};

function createAuthStore() {
  const { subscribe, set } = writable<AuthState>({
    user: null,
    loading: false,
    initialized: false
  });

  return {
    subscribe,

    async init() {
      // Check localStorage for existing session
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('demo_user') : null;
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user, loading: false, initialized: true });
          return;
        } catch (e) {
          // Invalid stored data
        }
      }
      set({ user: null, loading: false, initialized: true });
    },

    async signIn(email: string, _password: string) {
      set({ user: null, loading: true, initialized: true });

      await new Promise(resolve => setTimeout(resolve, 500));

      let user: Profile | null = null;
      if (email.includes('patient')) user = mockUsers.patient;
      else if (email.includes('admin')) user = mockUsers.admin;
      else user = mockUsers.patient;

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(user));
      }

      set({ user, loading: false, initialized: true });
      return { error: null };
    },

    async signUp(email: string, _password: string, nom: string, role: UserRole) {
      set({ user: null, loading: true, initialized: true });

      await new Promise(resolve => setTimeout(resolve, 500));

      const user: Profile = {
        id: crypto.randomUUID(),
        email,
        nom,
        telephone: '+225 07 00 000 000',
        role,
        created_at: new Date().toISOString()
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(user));
      }

      set({ user, loading: false, initialized: true });
      return { error: null };
    },

    async signOut() {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('demo_user');
      }
      set({ user: null, loading: false, initialized: true });
    },

    getRole(): UserRole | null {
      let role: UserRole | null = null;
      subscribe(state => {
        role = state.user?.role || null;
      })();
      return role;
    }
  };
}

export const auth = createAuthStore();

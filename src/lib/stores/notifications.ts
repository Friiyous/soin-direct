import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  created_at: string;
}

function createNotificationStore() {
  const { subscribe, update, set } = writable<Notification[]>([]);

  return {
    subscribe,
    
    add: (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        read: false,
        created_at: new Date().toISOString()
      };
      update(n => [newNotification, ...n]);
      
      // Auto-remove after 5 seconds for non-error notifications
      if (notification.type !== 'error') {
        setTimeout(() => {
          update(n => n.filter(item => item.id !== newNotification.id));
        }, 5000);
      }
      
      return newNotification;
    },
    
    remove: (id: string) => {
      update(n => n.filter(item => item.id !== id));
    },
    
    markAsRead: (id: string) => {
      update(n => n.map(item => 
        item.id === id ? { ...item, read: true } : item
      ));
    },
    
    markAllAsRead: () => {
      update(n => n.map(item => ({ ...item, read: true })));
    },
    
    clear: () => set([]),
    
    // Setup real-time subscription for missions
    subscribeToMissions: async (userId: string, userRole: string) => {
      const channel = supabase
        .channel('missions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'missions',
            filter: userRole === 'patient' ? `patient_id=eq.${userId}` : `pro_id=eq.${userId}`
          },
          (payload) => {
            const eventType = payload.eventType;
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (userRole === 'patient') {
              if (eventType === 'INSERT') {
                update(n => [{
                  id: crypto.randomUUID(),
                  title: '🆕 Nouvelle mission',
                  message: `Votre demande de ${newRecord.type_soin} a été créée`,
                  type: 'info',
                  read: false,
                  created_at: new Date().toISOString()
                }, ...n]);
              } else if (eventType === 'UPDATE') {
                if (newRecord.statut === 'accepte') {
                  update(n => [{
                    id: crypto.randomUUID(),
                    title: '✅ Mission acceptée',
                    message: 'Un professionnel a accepté votre demande',
                    type: 'success',
                    read: false,
                    created_at: new Date().toISOString()
                  }, ...n]);
                } else if (newRecord.statut === 'termine') {
                  update(n => [{
                    id: crypto.randomUUID(),
                    title: '🎉 Mission terminée',
                    message: 'Votre soin a été réalisé avec succès',
                    type: 'success',
                    read: false,
                    created_at: new Date().toISOString()
                  }, ...n]);
                }
              }
            } else if (userRole === 'pro') {
              if (eventType === 'INSERT' && newRecord.statut === 'en_attente') {
                update(n => [{
                  id: crypto.randomUUID(),
                  title: '🔔 Nouvelle mission disponible',
                  message: `Une nouvelle demande de ${newRecord.type_soin} attend votre réponse`,
                  type: 'warning',
                  read: false,
                  created_at: new Date().toISOString()
                }, ...n]);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  };
}

export const notifications = createNotificationStore();

import { writable, get } from 'svelte/store';
import { supabase } from '$lib/supabase/client';

export interface Message {
  id: string;
  mission_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_nom?: string;
  sender_avatar?: string;
}

function createChatStore() {
  const { subscribe, update, set } = writable<Message[]>([]);
  let currentMissionId: string | null = null;
  let unsubscribe: (() => void) | null = null;

  return {
    subscribe,
    
    // Load messages for a specific mission
    loadMessages: async (missionId: string) => {
      currentMissionId = missionId;
      
      // Clean up previous subscription
      if (unsubscribe) {
        unsubscribe();
      }

      // Load initial messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(nom)
        `)
        .eq('mission_id', missionId)
        .order('created_at', { ascending: true });

      if (messages) {
        const formattedMessages = messages.map((m: any) => ({
          ...m,
          sender_nom: m.sender?.nom || 'Utilisateur'
        }));
        set(formattedMessages);
      }

      // Subscribe to new messages in real-time
      const channel = supabase
        .channel(`chat-${missionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `mission_id=eq.${missionId}`
          },
          async (payload) => {
            const newMessage = payload.new as any;
            
            // Get sender info
            const { data: sender } = await supabase
              .from('profiles')
              .select('nom')
              .eq('id', newMessage.sender_id)
              .single();
            
            const formattedMessage = {
              ...newMessage,
              sender_nom: sender?.nom || 'Utilisateur'
            };
            
            update(messages => [...messages, formattedMessage]);
          }
        )
        .subscribe();

      unsubscribe = () => {
        supabase.removeChannel(channel);
      };
    },

    // Send a new message
    sendMessage: async (missionId: string, receiverId: string, content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          mission_id: missionId,
          sender_id: user.id,
          receiver_id: receiverId,
          content: content
        })
        .select()
        .single();

      if (!error && message) {
        // Add sender name to the message
        const { data: profile } = await supabase
          .from('profiles')
          .select('nom')
          .eq('id', user.id)
          .single();

        return {
          ...message,
          sender_nom: profile?.nom || 'Vous'
        };
      }

      return null;
    },

    // Mark messages as read
    markAsRead: async (missionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('mission_id', missionId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    },

    // Clean up
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
      }
      set([]);
      currentMissionId = null;
    }
  };
}

export const chat = createChatStore();

// Unread messages store
export const unreadChats = writable<number>(0);

// Check for unread messages across all missions
export async function checkUnreadMessages(userId: string) {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);

  unreadChats.set(count || 0);
}

import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  username: string;
}

export async function sendMessage(content: string, userId: string, username: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { content, user_id: userId, username }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getMessages(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export function subscribeToMessages(callback: (message: ChatMessage) => void) {
  const channel = supabase
    .channel('live_chat')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
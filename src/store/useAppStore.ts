import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
}

export interface AppState {
  // Auth
  isLoggedIn: boolean;
  email: string;
  password: string;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Chat
  chatRooms: ChatRoom[];
  activeChatId: string | null;
  createChat: () => string;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setActiveChat: (id: string | null) => void;

  // AI Mode
  aiMode: 'fast' | 'thinker' | 'pro';
  messageCount: { fast: number; thinker: number; pro: number };
  setAiMode: (mode: 'fast' | 'thinker' | 'pro') => void;
  incrementMessageCount: () => void;
  isPaid: boolean;
  setPaid: (paid: boolean) => void;

  // Admin
  openaiKey: string;
  imageGenKey: string;
  masterCardNumber: string;
  setOpenaiKey: (key: string) => void;
  setImageGenKey: (key: string) => void;
  setMasterCardNumber: (num: string) => void;

  // Notifications
  notifications: { id: string; title: string; description: string; icon: string; read: boolean }[];
  addNotification: (n: Omit<AppState['notifications'][0], 'id' | 'read'>) => void;

  // Drawing
  drawings: { id: string; dataUrl: string; createdAt: number }[];
  saveDrawing: (dataUrl: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      email: '',
      password: '',
      login: (email, password) => {
        const state = get();
        if (state.email === email && state.password === password) {
          set({ isLoggedIn: true });
        } else if (!state.email) {
          // Auto register
          set({ isLoggedIn: true, email, password });
        }
      },
      logout: () => set({ isLoggedIn: false }),
      register: (email, password) => set({ email, password, isLoggedIn: true }),

      profile: { name: 'عبدالله لازم', bio: '', avatar: '' },
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      chatRooms: [],
      activeChatId: null,
      createChat: () => {
        const id = crypto.randomUUID();
        set((s) => ({
          chatRooms: [...s.chatRooms, { id, title: `محادثة جديدة`, messages: [], createdAt: Date.now() }],
          activeChatId: id,
        }));
        return id;
      },
      deleteChat: (id) => set((s) => ({
        chatRooms: s.chatRooms.filter((c) => c.id !== id),
        activeChatId: s.activeChatId === id ? null : s.activeChatId,
      })),
      addMessage: (chatId, msg) => set((s) => ({
        chatRooms: s.chatRooms.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }] }
            : c
        ),
      })),
      setActiveChat: (id) => set({ activeChatId: id }),

      aiMode: 'fast',
      messageCount: { fast: 0, thinker: 0, pro: 0 },
      setAiMode: (mode) => set({ aiMode: mode }),
      incrementMessageCount: () => set((s) => ({
        messageCount: { ...s.messageCount, [s.aiMode]: s.messageCount[s.aiMode] + 1 },
      })),
      isPaid: false,
      setPaid: (paid) => set({ isPaid: paid }),

      openaiKey: '',
      imageGenKey: '',
      masterCardNumber: '',
      setOpenaiKey: (key) => set({ openaiKey: key }),
      setImageGenKey: (key) => set({ imageGenKey: key }),
      setMasterCardNumber: (num) => set({ masterCardNumber: num }),

      notifications: [
        { id: '1', title: 'الملف الشخصي', description: 'تحميل الملف الشخصي ناجح', icon: 'profile', read: false },
        { id: '2', title: 'الدفع', description: 'تحديث Pro جاهز', icon: 'payment', read: false },
        { id: '3', title: 'تحديث Sada', description: 'تحديث Sada 2.0 جاهز للتثبيت', icon: 'settings', read: false },
      ],
      addNotification: (n) => set((s) => ({
        notifications: [...s.notifications, { ...n, id: crypto.randomUUID(), read: false }],
      })),

      drawings: [],
      saveDrawing: (dataUrl) => set((s) => ({
        drawings: [...s.drawings, { id: crypto.randomUUID(), dataUrl, createdAt: Date.now() }],
      })),
    }),
    { name: 'sada-storage' }
  )
);

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

export interface FeedPost {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  comments: { id: string; author: string; content: string; timestamp: number }[];
}

export interface GridCell {
  element: string | null;
  color: string;
  rotation: number;
}

export interface GameProject {
  id: string;
  name: string;
  grid: GridCell[][];
  gridSize: number;
  bgColor: string;
  showGrid: boolean;
  createdAt: number;
  updatedAt: number;
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

  // Feed
  feedPosts: FeedPost[];
  addPost: (content: string) => void;
  editPost: (id: string, content: string) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, content: string) => void;

  // Language
  language: 'ar' | 'en' | 'fr' | 'de';
  setLanguage: (lang: 'ar' | 'en' | 'fr' | 'de') => void;

  // Game Projects
  gameProjects: GameProject[];
  activeProjectId: string | null;
  createGameProject: (name: string, size: number) => string;
  deleteGameProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  updateGridCell: (projectId: string, row: number, col: number, element: string | null) => void;
  updateProjectSettings: (projectId: string, settings: Partial<Pick<GameProject, 'bgColor' | 'showGrid' | 'gridSize' | 'name'>>) => void;
}

const createEmptyGrid = (size: number): GridCell[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ element: null, color: '#333333', rotation: 0 }))
  );

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

      // Feed
      feedPosts: [
        {
          id: '1',
          author: 'عبدالله لازم',
          content: 'مرحباً بالجميع في تطبيق صَدي! 🎉',
          timestamp: Date.now() - 3600000,
          comments: [
            { id: 'c1', author: 'Sada', content: 'أهلاً وسهلاً! 👋', timestamp: Date.now() - 3000000 },
          ],
        },
      ],
      addPost: (content) => set((s) => ({
        feedPosts: [
          { id: crypto.randomUUID(), author: s.profile.name, content, timestamp: Date.now(), comments: [] },
          ...s.feedPosts,
        ],
      })),
      editPost: (id, content) => set((s) => ({
        feedPosts: s.feedPosts.map((p) => (p.id === id ? { ...p, content } : p)),
      })),
      deletePost: (id) => set((s) => ({
        feedPosts: s.feedPosts.filter((p) => p.id !== id),
      })),
      addComment: (postId, content) => set((s) => ({
        feedPosts: s.feedPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  { id: crypto.randomUUID(), author: s.profile.name, content, timestamp: Date.now() },
                ],
              }
            : p
        ),
      })),

      // Language
      language: 'ar',
      setLanguage: (lang) => set({ language: lang }),

      // Game Projects
      gameProjects: [],
      activeProjectId: null,
      createGameProject: (name, size) => {
        const id = crypto.randomUUID();
        set((s) => ({
          gameProjects: [
            ...s.gameProjects,
            { id, name, grid: createEmptyGrid(size), gridSize: size, bgColor: '#1a1a2e', showGrid: true, createdAt: Date.now(), updatedAt: Date.now() },
          ],
          activeProjectId: id,
        }));
        return id;
      },
      deleteGameProject: (id) => set((s) => ({
        gameProjects: s.gameProjects.filter((p) => p.id !== id),
        activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
      })),
      setActiveProject: (id) => set({ activeProjectId: id }),
      updateGridCell: (projectId, row, col, element) => set((s) => ({
        gameProjects: s.gameProjects.map((p) => {
          if (p.id !== projectId) return p;
          const newGrid = p.grid.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? { ...c, element } : c))
          );
          return { ...p, grid: newGrid, updatedAt: Date.now() };
        }),
      })),
      updateProjectSettings: (projectId, settings) => set((s) => ({
        gameProjects: s.gameProjects.map((p) => {
          if (p.id !== projectId) return p;
          const updated = { ...p, ...settings, updatedAt: Date.now() };
          if (settings.gridSize && settings.gridSize !== p.gridSize) {
            updated.grid = createEmptyGrid(settings.gridSize);
          }
          return updated;
        }),
      })),
    }),
    { name: 'sada-storage' }
  )
);

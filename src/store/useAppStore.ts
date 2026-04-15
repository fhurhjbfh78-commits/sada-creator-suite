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
  userId: string;
}

export interface FeedPost {
  id: string;
  author: string;
  authorId: string;
  content: string;
  image?: string;
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

export type ThemeMode = 'dark' | 'light';
export type ThemeAccent = 'ocean' | 'emerald' | 'sunset' | 'purple' | 'rose' | 'amber' | 'crimson' | 'teal' | 'indigo' | 'lime';
export type ChatCategory = 'beginner' | 'intermediate' | 'pro';

export const THEME_ACCENTS: Record<ThemeAccent, { label: string; primary: string; preview: string }> = {
  ocean: { label: 'محيط', primary: '195 100% 50%', preview: '#00bfff' },
  emerald: { label: 'زمرد', primary: '160 84% 39%', preview: '#10b981' },
  sunset: { label: 'غروب', primary: '25 95% 53%', preview: '#f97316' },
  purple: { label: 'بنفسجي', primary: '270 76% 60%', preview: '#8b5cf6' },
  rose: { label: 'وردي', primary: '340 82% 52%', preview: '#f43f5e' },
  amber: { label: 'كهرماني', primary: '38 92% 50%', preview: '#f59e0b' },
  crimson: { label: 'قرمزي', primary: '0 72% 51%', preview: '#ef4444' },
  teal: { label: 'أزرق مخضر', primary: '175 77% 40%', preview: '#14b8a6' },
  indigo: { label: 'نيلي', primary: '239 84% 67%', preview: '#6366f1' },
  lime: { label: 'ليموني', primary: '84 81% 44%', preview: '#84cc16' },
};

const TEXT_AI_KEYS = [
  'openai_api_key', 'deepai_api_key', 'darkai_api_key', 'deepseek_api_key',
  'anthropic_api_key', 'cohere_api_key', 'mistral_api_key', 'groq_api_key',
  'together_api_key', 'perplexity_api_key', 'google_gemini_api_key', 'azure_openai_key',
  'fireworks_api_key', 'huggingface_api_key', 'replicate_api_key', 'openrouter_api_key',
  'novita_api_key', 'ai21_api_key', 'xai_api_key', 'ollama_api_key',
];

const IMAGE_AI_KEYS = [
  'openai_image_key', 'stability_api_key', 'midjourney_api_key', 'leonardo_api_key',
  'deepai_image_key', 'replicate_image_key', 'huggingface_image_key', 'dreamstudio_api_key',
  'clipdrop_api_key', 'getimg_api_key', 'playground_api_key', 'krea_api_key',
  'invokeai_api_key', 'runway_api_key', 'scenario_api_key', 'pixai_api_key',
  'ideogram_api_key', 'segmind_api_key', 'novelai_image_key', 'mage_api_key',
];

export { TEXT_AI_KEYS, IMAGE_AI_KEYS };

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
  chatCategory: ChatCategory;
  setChatCategory: (cat: ChatCategory) => void;
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
  selectedTextAiKey: string;
  selectedImageAiKey: string;
  apiKeys: Record<string, string>;
  setSelectedTextAiKey: (key: string) => void;
  setSelectedImageAiKey: (key: string) => void;
  setApiKey: (keyName: string, value: string) => void;
  masterCardNumber: string;
  setMasterCardNumber: (num: string) => void;
  serverUrl: string;
  setServerUrl: (url: string) => void;
  subscriptionPrices: { beginner: string; intermediate: string; pro: string };
  setSubscriptionPrice: (tier: 'beginner' | 'intermediate' | 'pro', price: string) => void;

  // Theme
  themeMode: ThemeMode;
  themeAccent: ThemeAccent;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeAccent: (accent: ThemeAccent) => void;

  // Notifications
  notifications: { id: string; title: string; description: string; icon: string; read: boolean }[];
  addNotification: (n: Omit<AppState['notifications'][0], 'id' | 'read'>) => void;

  // Drawing
  drawings: { id: string; dataUrl: string; createdAt: number }[];
  saveDrawing: (dataUrl: string) => void;

  // Feed
  feedPosts: FeedPost[];
  addPost: (content: string, image?: string) => void;
  editPost: (id: string, content: string) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, content: string) => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;

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
      register: (email, password) => {
        const userId = crypto.randomUUID().slice(0, 8).toUpperCase();
        set({ email, password, isLoggedIn: true, profile: { ...get().profile, userId } });
      },

      profile: { name: '', bio: '', avatar: '', userId: crypto.randomUUID().slice(0, 8).toUpperCase() },
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      chatRooms: [],
      activeChatId: null,
      chatCategory: 'beginner',
      setChatCategory: (cat) => set({ chatCategory: cat }),
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

      // Admin
      selectedTextAiKey: 'openai_api_key',
      selectedImageAiKey: 'openai_image_key',
      apiKeys: {},
      setSelectedTextAiKey: (key) => set({ selectedTextAiKey: key }),
      setSelectedImageAiKey: (key) => set({ selectedImageAiKey: key }),
      setApiKey: (keyName, value) => set((s) => ({ apiKeys: { ...s.apiKeys, [keyName]: value } })),
      masterCardNumber: '',
      setMasterCardNumber: (num) => set({ masterCardNumber: num }),
      serverUrl: '',
      setServerUrl: (url) => set({ serverUrl: url }),
      subscriptionPrices: { beginner: '', intermediate: '', pro: '' },
      setSubscriptionPrice: (tier, price) => set((s) => ({
        subscriptionPrices: { ...s.subscriptionPrices, [tier]: price },
      })),

      // Theme
      themeMode: 'dark',
      themeAccent: 'ocean',
      setThemeMode: (mode) => set({ themeMode: mode }),
      setThemeAccent: (accent) => set({ themeAccent: accent }),

      notifications: [
        { id: '1', title: 'الملف الشخصي', description: 'تحميل الملف الشخصي ناجح', icon: 'profile', read: false },
        { id: '2', title: 'الدفع', description: 'تحديث Pro جاهز', icon: 'payment', read: false },
        { id: '3', title: 'تحديث صدى', description: 'تحديث صدى 2.0 جاهز للتثبيت', icon: 'settings', read: false },
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
          author: 'صدى',
          authorId: 'SYSTEM',
          content: 'مرحباً بالجميع في تطبيق صدى! 🎉',
          timestamp: Date.now() - 3600000,
          comments: [
            { id: 'c1', author: 'صدى', content: 'أهلاً وسهلاً! 👋', timestamp: Date.now() - 3000000 },
          ],
        },
      ],
      addPost: (content, image?) => set((s) => ({
        feedPosts: [
          { id: crypto.randomUUID(), author: s.profile.name || 'مجهول', authorId: s.profile.userId, content, image, timestamp: Date.now(), comments: [] },
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
                  { id: crypto.randomUUID(), author: s.profile.name || 'مجهول', content, timestamp: Date.now() },
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
    {
      name: 'sada-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          try {
            // Strip base64 images from chat messages before persisting
            const clone = JSON.parse(JSON.stringify(value));
            if (clone?.state?.chatRooms) {
              clone.state.chatRooms = clone.state.chatRooms.map((room: ChatRoom) => ({
                ...room,
                messages: room.messages.slice(-100).map((m: Message) => ({
                  ...m,
                  image: m.image && m.image.startsWith('data:') ? '[image]' : m.image,
                })),
              }));
            }
            localStorage.setItem(name, JSON.stringify(clone));
          } catch (e) {
            // If still over quota, clear old chats
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
              try {
                const clone2 = JSON.parse(JSON.stringify(value));
                if (clone2?.state?.chatRooms) {
                  clone2.state.chatRooms = clone2.state.chatRooms.slice(-3).map((room: ChatRoom) => ({
                    ...room,
                    messages: room.messages.slice(-20).map((m: Message) => ({ ...m, image: undefined })),
                  }));
                }
                localStorage.setItem(name, JSON.stringify(clone2));
              } catch {
                console.warn('Storage quota exceeded, clearing storage');
                localStorage.removeItem(name);
              }
            }
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

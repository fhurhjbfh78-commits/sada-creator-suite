import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Play, Square, CircleDot, Star, Copy, Eye, EyeOff, Lock, Unlock, Download, Code } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const TOOLS = [
  { id: 'Player', icon: Play, color: '#22D3EE', label: 'لاعب' },
  { id: 'Solid', icon: Square, color: '#6B7280', label: 'صلب' },
  { id: 'Enemy', icon: CircleDot, color: '#EF4444', label: 'عدو' },
  { id: 'Coin', icon: Star, color: '#F59E0B', label: 'عملة' },
  { id: 'Goal', icon: Download, color: '#10B981', label: 'هدف' },
];

type Tab = 'editor' | 'projects' | 'settings' | 'export' | 'layers' | 'code';

const GameCreatorPage = () => {
  const {
    gameProjects, activeProjectId, createGameProject, deleteGameProject,
    setActiveProject, updateGridCell, updateProjectSettings,
  } = useAppStore();
  const [selectedTool, setSelectedTool] = useState('Player');
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSize, setNewProjectSize] = useState(12);
  const [exportFormat, setExportFormat] = useState<'json' | 'xml' | 'text'>('json');
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  const [layerLocked, setLayerLocked] = useState<Record<string, boolean>>({});
  const [codeInput, setCodeInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const project = gameProjects.find((p) => p.id === activeProjectId);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    createGameProject(newProjectName, newProjectSize);
    setActiveTab('editor');
    setNewProjectName('');
  };

  const handleCellClick = (row: number, col: number) => {
    if (!project || !activeProjectId) return;
    if (layerLocked[selectedTool]) return;
    const current = project.grid[row][col].element;
    updateGridCell(activeProjectId, row, col, current === selectedTool ? null : selectedTool);
  };

  const exportData = useMemo(() => {
    if (!project) return '';
    const cells = project.grid.flatMap((row, ri) =>
      row.map((cell, ci) => cell.element ? { row: ri, col: ci, element: cell.element } : null)
    ).filter(Boolean);
    if (exportFormat === 'json') return JSON.stringify({ name: project.name, size: project.gridSize, cells }, null, 2);
    if (exportFormat === 'xml') return `<?xml version="1.0"?>\n<level name="${project.name}" size="${project.gridSize}">\n${cells.map(c => `  <cell row="${c!.row}" col="${c!.col}" element="${c!.element}"/>`).join('\n')}\n</level>`;
    return cells.map(c => `${c!.element} @ (${c!.row}, ${c!.col})`).join('\n');
  }, [project, exportFormat]);

  const getCellColor = (element: string | null) => {
    if (!element) return 'transparent';
    if (layerVisibility[element] === false) return 'transparent';
    return TOOLS.find(t => t.id === element)?.color || '#333';
  };

  const handlePreviewCode = () => {
    if (!codeInput.trim()) { toast.error('أدخل الكود أولاً'); return; }
    setShowPreview(true);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'code', label: 'كود' },
    { id: 'layers', label: 'طبقات' },
    { id: 'export', label: 'تصدير' },
    { id: 'settings', label: 'إعدادات' },
    { id: 'editor', label: 'محرر' },
    { id: 'projects', label: 'مشاريع' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="منشئ الألعاب" showBack={false} />

      <div className="flex-shrink-0 flex gap-1 px-3 py-2 overflow-x-auto">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${activeTab === id ? 'glow-btn' : 'glass-card text-muted-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Code Tab - paste code & preview */}
        {activeTab === 'code' && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-4">
              <h3 className="font-bold text-sm text-right mb-3 flex items-center gap-2 justify-end">
                <span>محرر الكود</span>
                <Code className="w-4 h-4 text-primary" />
              </h3>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full glass-input p-3 text-xs text-left resize-none h-48 text-foreground font-mono"
                placeholder="// الصق كود HTML/JS هنا..."
                dir="ltr"
              />
              <button onClick={handlePreviewCode} className="w-full glow-btn py-2.5 text-sm mt-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Play className="w-4 h-4" /> معاينة
              </button>
            </div>

            {showPreview && (
              <div className="glass-card p-2 animate-fade-in">
                <div className="flex items-center justify-between mb-2 px-2">
                  <button onClick={() => setShowPreview(false)} className="text-xs text-destructive">إغلاق</button>
                  <span className="text-xs font-bold">المعاينة</span>
                </div>
                <iframe
                  srcDoc={codeInput}
                  className="w-full rounded-xl border border-border/30"
                  style={{ height: '400px' }}
                  sandbox="allow-scripts allow-same-origin"
                  title="Game Preview"
                />
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-4">
              <h3 className="font-bold text-sm text-right mb-3">مشروع جديد</h3>
              <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full glass-input px-3 py-2.5 text-sm text-right mb-2 text-foreground" placeholder="اسم المشروع" />
              <div className="flex items-center gap-2 mb-3 justify-end">
                <select value={newProjectSize} onChange={(e) => setNewProjectSize(Number(e.target.value))} className="glass-input px-3 py-2 text-sm bg-secondary text-foreground">
                  {[8, 10, 12, 16, 20].map(s => <option key={s} value={s}>{s}x{s}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">الحجم:</span>
              </div>
              <button onClick={handleCreateProject} className="w-full glow-btn py-2.5 text-sm active:scale-95 transition-transform">
                <Plus className="w-4 h-4 inline ml-1" /> إنشاء
              </button>
            </div>
            {gameProjects.map((p) => (
              <div key={p.id} className={`glass-card p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer ${p.id === activeProjectId ? 'border-primary/50' : ''}`} onClick={() => { setActiveProject(p.id); setActiveTab('editor'); }}>
                <button onClick={(e) => { e.stopPropagation(); deleteGameProject(p.id); }} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                <div className="text-right">
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.gridSize}x{p.gridSize} · {new Date(p.updatedAt).toLocaleDateString('ar')}</p>
                </div>
              </div>
            ))}
            {gameProjects.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">لا توجد مشاريع</p>}
          </div>
        )}

        {/* Editor Tab */}
        {activeTab === 'editor' && project && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-2 aspect-square">
              <div className="w-full h-full grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${project.gridSize}, 1fr)`, backgroundColor: project.showGrid ? 'hsl(210 30% 20%)' : 'transparent' }}>
                {project.grid.map((row, ri) => row.map((cell, ci) => (
                  <button key={`${ri}-${ci}`} onClick={() => handleCellClick(ri, ci)} onMouseEnter={() => setHoverCell({ row: ri, col: ci })} onMouseLeave={() => setHoverCell(null)} className="aspect-square transition-colors active:scale-90" style={{ backgroundColor: getCellColor(cell.element) || project.bgColor, opacity: hoverCell?.row === ri && hoverCell?.col === ci ? 0.7 : 1 }} />
                )))}
              </div>
            </div>
            <div className="glass-card p-3 flex gap-2 overflow-x-auto">
              {TOOLS.map(({ id, icon: Icon, color, label }) => (
                <button key={id} onClick={() => setSelectedTool(id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all active:scale-90 min-w-[60px] ${selectedTool === id ? 'bg-primary/20 ring-1 ring-primary' : 'bg-secondary/50'}`}>
                  <Icon className="w-5 h-5" style={{ color }} />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'editor' && !project && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">اختر مشروعاً أو أنشئ مشروعاً جديداً</p>
            <button onClick={() => setActiveTab('projects')} className="glow-btn px-6 py-2 mt-4 text-sm active:scale-95 transition-transform">المشاريع</button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && project && (
          <div className="space-y-3 animate-fade-in">
            <div className="glass-card p-4">
              <h3 className="font-bold text-sm text-right mb-3">إعدادات المحرر</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input type="color" value={project.bgColor} onChange={(e) => updateProjectSettings(project.id, { bgColor: e.target.value })} className="w-10 h-10 rounded-lg border-none cursor-pointer" />
                  <span className="text-sm">لون الخلفية</span>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => updateProjectSettings(project.id, { showGrid: !project.showGrid })} className={`px-4 py-2 rounded-lg text-xs ${project.showGrid ? 'glow-btn' : 'glass-card'}`}>{project.showGrid ? 'مفعل' : 'معطل'}</button>
                  <span className="text-sm">خطوط الشبكة</span>
                </div>
                <div className="flex items-center justify-between">
                  <select value={project.gridSize} onChange={(e) => updateProjectSettings(project.id, { gridSize: Number(e.target.value) })} className="glass-input px-3 py-2 text-sm bg-secondary text-foreground">
                    {[8, 10, 12, 16, 20].map(s => <option key={s} value={s}>{s}x{s}</option>)}
                  </select>
                  <span className="text-sm">أبعاد الشبكة</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && project && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex gap-2 justify-end">
              {(['json', 'xml', 'text'] as const).map(f => (
                <button key={f} onClick={() => setExportFormat(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${exportFormat === f ? 'glow-btn' : 'glass-card'}`}>{f.toUpperCase()}</button>
              ))}
            </div>
            <div className="glass-card p-3">
              <pre className="text-[10px] text-foreground overflow-auto max-h-[50vh] whitespace-pre-wrap font-mono" dir="ltr">{exportData}</pre>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(exportData); toast.success('تم نسخ الكود'); }} className="w-full glow-btn py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Copy className="w-4 h-4" /><span>نسخ الكود</span>
            </button>
          </div>
        )}

        {/* Layers Tab */}
        {activeTab === 'layers' && project && (
          <div className="space-y-2 animate-fade-in">
            <h3 className="font-bold text-sm text-right mb-3">إدارة الطبقات</h3>
            {TOOLS.map(({ id, label, color }) => (
              <div key={id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setLayerLocked(l => ({ ...l, [id]: !l[id] }))} className="p-1.5 rounded-lg hover:bg-secondary/50">
                    {layerLocked[id] ? <Lock className="w-4 h-4 text-destructive" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => setLayerVisibility(v => ({ ...v, [id]: v[id] === false ? true : false }))} className="p-1.5 rounded-lg hover:bg-secondary/50">
                    {layerVisibility[id] === false ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{label}</span>
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'settings' || activeTab === 'export' || activeTab === 'layers') && !project && (
          <p className="text-center text-muted-foreground text-sm py-8">اختر مشروعاً أولاً</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default GameCreatorPage;

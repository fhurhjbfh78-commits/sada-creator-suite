import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MoreVertical, MessageCircle, Send, Edit, Trash2, Plus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

const FeedPage = () => {
  const { feedPosts, addPost, editPost, deletePost, addComment, profile } = useAppStore();
  const [newPost, setNewPost] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const handlePost = () => {
    if (!newPost.trim()) return;
    addPost(newPost);
    setNewPost('');
    setShowNewPost(false);
  };

  const handleEdit = (id: string) => {
    if (!editContent.trim()) return;
    editPost(id, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
    setCommentingId(null);
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="المنشورات" showBack={false} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* New post button */}
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="w-full glow-btn py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
          <span>منشور جديد</span>
        </button>

        {/* New post form */}
        {showNewPost && (
          <div className="glass-card p-4 animate-fade-in">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full glass-input p-3 text-sm text-right resize-none h-24 text-foreground"
              placeholder="اكتب منشورك هنا..."
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowNewPost(false)} className="flex-1 glass-card py-2 text-sm active:scale-95 transition-transform">إلغاء</button>
              <button onClick={handlePost} className="flex-1 glow-btn py-2 text-sm active:scale-95 transition-transform">نشر</button>
            </div>
          </div>
        )}

        {/* Posts */}
        {feedPosts.map((post) => (
          <div key={post.id} className="glass-card p-4 animate-fade-in">
            {/* Post header */}
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                  className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
                {openMenu === post.id && (
                  <div className="absolute left-0 top-8 glass-card p-1 z-10 min-w-[120px] animate-fade-in">
                    <button
                      onClick={() => {
                        setEditingId(post.id);
                        setEditContent(post.content);
                        setOpenMenu(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 rounded-lg text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => { deletePost(post.id); setOpenMenu(null); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/20 rounded-lg text-sm text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-bold text-sm">{post.author}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(post.timestamp).toLocaleDateString('ar')}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
              </div>
            </div>

            {/* Content */}
            {editingId === post.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full glass-input p-3 text-sm text-right resize-none h-20 text-foreground"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setEditingId(null)} className="flex-1 glass-card py-2 text-xs active:scale-95 transition-transform">إلغاء</button>
                  <button onClick={() => handleEdit(post.id)} className="flex-1 glow-btn py-2 text-xs active:scale-95 transition-transform">حفظ</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-right leading-relaxed mb-3">{post.content}</p>
            )}

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="border-t border-border/20 pt-2 mt-2 space-y-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 justify-end">
                    <div className="text-right">
                      <span className="text-xs font-bold">{c.author}</span>
                      <p className="text-xs text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="mt-3 flex items-center gap-2">
              {commentingId === post.id ? (
                <div className="flex-1 flex gap-2">
                  <button onClick={() => handleComment(post.id)} className="glow-btn p-2 active:scale-95 transition-transform">
                    <Send className="w-4 h-4" />
                  </button>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                    className="flex-1 glass-input px-3 py-2 text-xs text-right text-foreground"
                    placeholder="اكتب تعليقاً..."
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setCommentingId(post.id)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mr-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تعليق ({post.comments.length})</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {feedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد منشورات بعد</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FeedPage;

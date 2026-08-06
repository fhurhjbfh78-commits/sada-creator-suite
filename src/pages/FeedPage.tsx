import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MoreVertical, MessageCircle, Send, Edit, Trash2, Plus, Image, Copy, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ImageLightbox from '@/components/ImageLightbox';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

interface Post {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  image_url: string | null;
  created_at: string;
  comments: Comment[];
  author_avatar?: string;
}

interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState({ name: '', user_id_short: '' });
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [confirmDeletePost, setConfirmDeletePost] = useState<string | null>(null);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchPosts();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('name, user_id_short').eq('id', user.id).single();
    if (data) setProfile(data as any);
  };

  const fetchPosts = async () => {
    const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (!postsData) { setLoading(false); return; }

    const postsWithComments: Post[] = [];
    for (const post of postsData) {
      const { data: comments } = await supabase.from('post_comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true });
      const { data: authorProfile } = await supabase.from('profiles').select('avatar_url').eq('id', post.user_id).single();
      postsWithComments.push({
        ...post,
        comments: (comments || []) as Comment[],
        author_avatar: (authorProfile as any)?.avatar_url || '',
      });
    }
    setPosts(postsWithComments);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() && !postImage) return;
    if (!user) return;

    let imageUrl: string | null = null;
    if (postImage) {
      const ext = postImage.name.split('.').pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('posts').upload(path, postImage);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path);
        imageUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      author_name: profile.name || 'مجهول',
      content: newPost,
      image_url: imageUrl,
    });

    if (error) { toast.error('فشل نشر المنشور'); return; }
    toast.success('تم النشر بنجاح');
    setNewPost('');
    setPostImage(null);
    setPostImagePreview(null);
    setShowNewPost(false);
    fetchPosts();
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content || '');
    setEditImage(null);
    setEditImagePreview(post.image_url);
    setOpenMenu(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEditImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setEditImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEdit = async (id: string) => {
    if (!user) return;
    if (!editContent.trim() && !editImagePreview) {
      toast.error('لا يمكن ترك المنشور فارغاً');
      return;
    }
    setEditSaving(true);
    try {
      let imageUrl: string | null = editImagePreview;
      if (editImage) {
        const ext = editImage.name.split('.').pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('posts').upload(path, editImage);
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from('posts').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent, image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success('تم تعديل المنشور');
      cancelEdit();
      fetchPosts();
    } catch {
      toast.error('فشل تعديل المنشور');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { toast.error('فشل حذف المنشور'); return; }
    toast.success('تم حذف المنشور');
    if (editingId === id) cancelEdit();
    fetchPosts();
    setOpenMenu(null);
  };


  const handleComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      user_id: user.id,
      author_name: profile.name || 'مجهول',
      content: commentText.trim(),
    });
    if (error) { toast.error('فشل إضافة التعليق'); return; }
    setCommentText('');
    setCommentingId(null);
    fetchPosts();
  };

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditCommentText(c.content);
  };

  const saveComment = async (id: string) => {
    if (!editCommentText.trim()) { toast.error('لا يمكن ترك التعليق فارغاً'); return; }
    const { error } = await supabase
      .from('post_comments')
      .update({ content: editCommentText.trim() })
      .eq('id', id);
    if (error) { toast.error('فشل تعديل التعليق'); return; }
    toast.success('تم تعديل التعليق');
    setEditingCommentId(null);
    setEditCommentText('');
    fetchPosts();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from('post_comments').delete().eq('id', id);
    setConfirmDeleteComment(null);
    if (error) { toast.error('فشل حذف التعليق'); return; }
    toast.success('تم حذف التعليق');
    if (editingCommentId === id) setEditingCommentId(null);
    fetchPosts();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(profile.user_id_short || '');
    toast.success('تم نسخ المعرف: ' + profile.user_id_short);
  };

  return (
    <div className="flex flex-col h-[100dvh] gradient-bg">
      <PageHeader title="المنشورات" showBack={false} />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* User ID */}
        <button onClick={copyUserId} className="w-full glass-card p-2.5 flex items-center justify-between active:scale-[0.98] transition-transform">
          <Copy className="w-4 h-4 text-primary" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-mono">{profile.user_id_short}</span>
            <span className="text-[11px] font-bold">معرفك:</span>
          </div>
        </button>

        {/* New post button */}
        <button onClick={() => setShowNewPost(!showNewPost)} className="w-full glow-btn py-2.5 flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm">
          <Plus className="w-4 h-4" /><span>منشور جديد</span>
        </button>

        {/* New post form */}
        {showNewPost && (
          <div className="glass-card p-3 animate-fade-in">
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
              className="w-full glass-input p-2.5 text-sm text-right resize-none h-20 text-foreground" placeholder="اكتب منشورك هنا..." autoFocus />
            {postImagePreview && (
              <div className="relative mt-2">
                <img src={postImagePreview} alt="preview" className="w-full max-h-40 object-cover rounded-xl" />
                <button onClick={() => { setPostImage(null); setPostImagePreview(null); }} className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => imageInputRef.current?.click()} className="glass-card p-2 active:scale-95" aria-label="إضافة صورة للمنشور"><Image className="w-4 h-4 text-primary" /></button>
              <button onClick={() => setShowNewPost(false)} className="flex-1 glass-card py-2 text-xs active:scale-95">إلغاء</button>
              <button onClick={handlePost} className="flex-1 glow-btn py-2 text-xs active:scale-95">نشر</button>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>
        )}

        {/* Posts */}
        <h2 className="text-sm font-bold text-muted-foreground px-1">أحدث المنشورات</h2>
        {posts.map((post) => (

          <div key={post.id} className="glass-card p-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div>
                {post.user_id === user?.id && (
                  <button onClick={() => setOpenMenu(post.id)} className="p-1 hover:bg-secondary/50 rounded-lg" aria-label="خيارات المنشور">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-right min-w-0">
                  <p className="font-bold text-xs sm:text-sm truncate max-w-[45vw]">{post.author_name}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString('ar')}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">👤</span>
                  )}
                </div>
              </div>
            </div>

            {editingId === post.id ? (
              <div>
                {editImagePreview && (
                  <div className="relative mb-2">
                    <img src={editImagePreview} alt="تعديل" className="w-full max-h-60 object-cover rounded-xl" />
                    <button onClick={() => { setEditImage(null); setEditImagePreview(null); }}
                      className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full w-7 h-7 flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full glass-input p-2.5 text-[13px] sm:text-sm text-right resize-none h-20 text-foreground break-words"
                  placeholder="عدّل نص المنشور..."
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => editImageInputRef.current?.click()} className="glass-card p-2 active:scale-95" aria-label="تغيير الصورة">
                    <Image className="w-4 h-4 text-primary" />
                  </button>
                  <button onClick={cancelEdit} className="flex-1 glass-card py-1.5 text-[11px] sm:text-xs active:scale-95">إلغاء</button>
                  <button onClick={() => handleEdit(post.id)} disabled={editSaving} className="flex-1 glow-btn py-1.5 text-[11px] sm:text-xs active:scale-95 disabled:opacity-60">
                    {editSaving ? '...جاري الحفظ' : 'حفظ'}
                  </button>
                </div>
                <input ref={editImageInputRef} type="file" accept="image/*" onChange={handleEditImageSelect} className="hidden" />
              </div>
            ) : (
              <>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="منشور"
                    onClick={() => setLightboxSrc(post.image_url!)}
                    className="w-full max-h-60 object-cover rounded-xl mb-2 cursor-zoom-in active:scale-[0.99] transition-transform"
                  />
                )}
                {post.content && (
                  <p className="text-[13px] sm:text-sm text-right leading-relaxed mb-2 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                    {post.content}
                  </p>
                )}
              </>
            )}


            {post.comments.length > 0 && (
              <div className="border-t border-border/20 pt-2 mt-2 space-y-2">
                {post.comments.map((c) => {
                  const canEdit = c.user_id === user?.id;
                  const canDelete = canEdit || post.user_id === user?.id;
                  return (
                    <div key={c.id} className="w-full">
                      {editingCommentId === c.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            rows={2}
                            className="w-full glass-input p-2 text-[11px] sm:text-xs text-right resize-none text-foreground break-words"
                          />
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}
                              className="flex-1 glass-card py-1.5 text-[10px] sm:text-[11px] active:scale-95">إلغاء</button>
                            <button onClick={() => saveComment(c.id)}
                              className="flex-1 glow-btn py-1.5 text-[10px] sm:text-[11px] active:scale-95">حفظ</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 justify-end">
                          {(canEdit || canDelete) && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {canEdit && (
                                <button onClick={() => startEditComment(c)} aria-label="تعديل التعليق"
                                  className="p-1 rounded-lg hover:bg-secondary/50 active:scale-90">
                                  <Edit className="w-3 h-3 text-muted-foreground" />
                                </button>
                              )}
                              {canDelete && (
                                <button onClick={() => setConfirmDeleteComment(c.id)} aria-label="حذف التعليق"
                                  className="p-1 rounded-lg hover:bg-destructive/20 active:scale-90">
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </button>
                              )}
                            </div>
                          )}
                          <div className="text-right min-w-0 flex-1">
                            <span className="text-[10px] font-bold">{c.author_name}</span>
                            <p className="text-[11px] sm:text-xs text-muted-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{c.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              {commentingId === post.id ? (
                <div className="flex-1 flex gap-1.5">
                  <button onClick={() => handleComment(post.id)} className="glow-btn p-1.5 active:scale-95"><Send className="w-3.5 h-3.5" /></button>
                  <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                    className="flex-1 glass-input px-2.5 py-1.5 text-[11px] text-right text-foreground" placeholder="اكتب تعليقاً..." autoFocus />
                </div>
              ) : (
                <button onClick={() => setCommentingId(post.id)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary mr-auto">
                  <MessageCircle className="w-3.5 h-3.5" /><span>تعليق ({post.comments.length})</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-muted-foreground border-t-primary rounded-full mx-auto" /></div>}
        {!loading && posts.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground text-sm">لا توجد منشورات بعد</p></div>}
      </div>

      {/* Post options sheet (always inside the screen on every size) */}
      {openMenu && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setOpenMenu(null)}>
          <div className="w-full max-w-md glass-card m-3 p-3 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { const p = posts.find((x) => x.id === openMenu); if (p) startEdit(p); }}
              className="w-full flex items-center justify-end gap-2 px-3 py-3 rounded-xl hover:bg-secondary/50 text-sm"
            >
              تعديل المنشور <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setConfirmDeletePost(openMenu); setOpenMenu(null); }}
              className="w-full flex items-center justify-end gap-2 px-3 py-3 rounded-xl hover:bg-destructive/20 text-sm text-destructive"
            >
              حذف المنشور <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => setOpenMenu(null)} className="w-full glass-card py-2.5 text-xs active:scale-95">إلغاء</button>
          </div>
        </div>
      )}

      {(confirmDeletePost || confirmDeleteComment) && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="glass-card p-5 w-full max-w-sm animate-fade-in space-y-3">
            <h3 className="text-base font-bold text-center">
              {confirmDeletePost ? 'حذف المنشور؟' : 'حذف التعليق؟'}
            </h3>
            <p className="text-[11px] text-muted-foreground text-center break-words">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDeletePost(null); setConfirmDeleteComment(null); }}
                className="flex-1 glass-card py-2.5 text-xs active:scale-95">إلغاء</button>
              <button
                onClick={() => {
                  if (confirmDeletePost) { const id = confirmDeletePost; setConfirmDeletePost(null); handleDelete(id); }
                  else if (confirmDeleteComment) deleteComment(confirmDeleteComment);
                }}
                className="flex-1 py-2.5 text-xs rounded-xl bg-destructive text-destructive-foreground active:scale-95"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      <BottomNav />
    </div>
  );
};

export default FeedPage;

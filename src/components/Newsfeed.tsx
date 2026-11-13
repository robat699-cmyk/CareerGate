import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Heart, MessageSquare, Share2, User, Image as ImageIcon, X } from "lucide-react";
import { getFeedPosts, addFeedPost, likeFeedPost, type FeedPost } from "../lib/store";

export default function Newsfeed({ user }: { user: any }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const loadPosts = useCallback(() => {
    setPosts(getFeedPosts());
  }, []);

  useEffect(() => {
    loadPosts();
    window.addEventListener('cg_store_update', loadPosts);
    return () => window.removeEventListener('cg_store_update', loadPosts);
  }, [loadPosts]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;
    
    addFeedPost({
      authorId: user.uid,
      authorName: user.displayName || user.email,
      authorPhoto: user.photoURL || null,
      content: newPost,
      imageUrl: postImage,
    });
    
    setNewPost("");
    setPostImage(null);
  };

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId);
    likeFeedPost(postId, !isLiked);
    
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-5 px-4 mb-20 px-2 lg:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card p-6 mb-8 shadow-sm"
      >
        <form onSubmit={handlePost}>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/20">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind, professional?"
                className="w-full bg-bg border border-line rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none dark:placeholder:text-ink/20"
                rows={3}
              />
              {postImage && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-line">
                  <img src={postImage} alt="Post preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-5 pt-5 border-t border-line">
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button type="button" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors">
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
            </div>
            <button 
              type="submit"
              disabled={!newPost.trim()}
              className="px-8 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 shadow-md shadow-red-900/20"
            >
              Broadcast
            </button>
          </div>
        </form>
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.04 }}
              className="surface-card p-6 transition-all hover:border-primary/30 group"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/10">
                  {post.authorPhoto ? (
                    <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black leading-none mb-1 tracking-tight text-ink">{post.authorName}</h4>
                  <p className="text-[9px] text-ink/40 font-bold uppercase tracking-[0.2em]">{post.createdAt}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-5 text-ink/90 font-medium">{post.content}</p>
              {post.imageUrl && (
                <div className="mb-5 rounded-2xl overflow-hidden border border-line">
                  <img src={post.imageUrl} alt="Post content" className="w-full h-auto" />
                </div>
              )}
              <div className="flex items-center gap-6 pt-4 border-t border-line">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-ink/40 hover:text-red-500'}`}>
                  <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500' : ''}`} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink/40 hover:text-primary transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink/40 hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  Spread
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

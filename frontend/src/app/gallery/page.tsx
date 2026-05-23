/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api, CapturedImage } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function GalleryPage() {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "user">("newest");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [selectedImg, setSelectedImg] = useState<CapturedImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CapturedImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listImages();
      setImages(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Could not load gallery: ${err.message}. Make sure backend is running.`);
      } else {
        setError('Could not load gallery: Unknown error. Make sure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImages();
  }, []);

  const filteredImages = useMemo(() => {
    let imgs = [...images];
    if (search) {
      const q = search.toLowerCase();
      imgs = imgs.filter(i => (i.original_name || '').toLowerCase().includes(q) || (i.user || '').toLowerCase().includes(q));
    }
    if (sortBy === 'oldest') imgs.sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
    else if (sortBy === 'user') imgs.sort((a, b) => (a.user || '').localeCompare(b.user || ''));
    else imgs.sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
    return imgs;
  }, [images, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / perPage));
  const paginatedImages = filteredImages.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, sortBy]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteImage(deleteTarget.id);
      setImages(images.filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert(`Delete failed: Unknown error`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex-grow py-12 px-6 md:px-12 flex flex-col">
      {/* Hero */}
      <div className="mb-10 text-center md:text-left">
        <p className="text-accent font-semibold text-sm mb-2 uppercase tracking-wide"><i className="bi bi-images me-2"></i> Image Gallery</p>
        <h1 className="text-4xl font-bold mb-4">Your Captured Photos</h1>
        <p className="text-muted max-w-lg">All photos saved from the capture studio. Download or delete any image.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 glass-panel p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted"></i>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64 bg-background/50 border border-border focus:border-accent rounded-xl py-2 pl-9 pr-4 text-sm transition-colors outline-none"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as "newest" | "oldest" | "user")}
            className="bg-background/50 border border-border rounded-xl py-2 px-4 text-sm outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="user">By User</option>
          </select>
          <span className="text-xs text-muted font-medium ml-2">{filteredImages.length} photos</span>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={fetchImages} disabled={loading} className="px-4 py-2 rounded-xl border border-border hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2">
            <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i> Refresh
          </button>
          <Link href="/" className="px-4 py-2 rounded-xl bg-accent text-black font-semibold hover:bg-amber-400 transition-colors text-sm flex items-center gap-2">
            <i className="bi bi-camera"></i> New Capture
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted font-medium">Loading gallery...</p>
        </div>
      ) : error ? (
        <div className="w-full glass-panel border-red-500/30 p-6 rounded-2xl flex items-center gap-4">
          <i className="bi bi-exclamation-triangle-fill text-red-500 text-2xl"></i>
          <span className="text-red-200">{error}</span>
          <button onClick={fetchImages} className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg text-sm font-medium transition-colors">Retry</button>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <i className="bi bi-images text-6xl text-muted/30 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">{search ? 'No matching photos' : 'No photos yet'}</h3>
          <p className="text-muted mb-6">{search ? 'Try a different search term.' : 'Head to the capture studio to take your first photo!'}</p>
          {!search && (
            <Link href="/" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium transition-colors">
              Go Capture
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {paginatedImages.map((img) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={img.id} 
                  className="glass-panel rounded-2xl overflow-hidden group flex flex-col"
                >
                  <div 
                    className="relative w-full aspect-[3/4] bg-black/40 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImg(img)}
                  >
                    <img src={api.imageUrl(img.filename)} alt={img.original_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                        <i className="bi bi-zoom-in text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm truncate mb-3">{img.original_name || 'Untitled'}</h3>
                    <div className="flex flex-col gap-1 text-xs text-muted mb-4 flex-grow">
                      <span><i className="bi bi-person mr-2 text-accent"></i>{img.user || 'Anonymous'}</span>
                      <span><i className="bi bi-calendar3 mr-2 text-accent"></i>{formatDate(img.captured_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <a href={api.downloadUrl(img.id)} download className="flex-grow py-2 bg-secondary hover:bg-secondary-hover rounded-lg text-center font-medium text-xs transition-colors flex items-center justify-center gap-2">
                        <i className="bi bi-download"></i> Download
                      </a>
                      <button onClick={() => setDeleteTarget(img)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl glass-panel disabled:opacity-50 hover:bg-white/5 transition-colors"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${page === i + 1 ? 'bg-accent text-black' : 'glass-panel hover:bg-white/5'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl glass-panel disabled:opacity-50 hover:bg-white/5 transition-colors"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
              <i className="bi bi-x-lg"></i>
            </button>
            <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img src={api.imageUrl(selectedImg.filename)} alt={selectedImg.original_name} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            </div>
            <div className="mt-6 flex items-center justify-between w-full max-w-4xl px-4" onClick={e => e.stopPropagation()}>
              <div className="text-white">
                <h3 className="font-bold text-lg">{selectedImg.original_name}</h3>
                <p className="text-sm text-white/70">{formatDate(selectedImg.captured_at)} • {selectedImg.user}</p>
              </div>
              <a href={api.downloadUrl(selectedImg.id)} download className="px-6 py-3 bg-accent hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center gap-2">
                <i className="bi bi-download"></i> Download
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1e232d] border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Photo?</h3>
              <p className="text-muted text-sm mb-6">
                Are you sure you want to permanently delete &quot;{deleteTarget.original_name}&quot;? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteTarget(null)} 
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary-hover font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

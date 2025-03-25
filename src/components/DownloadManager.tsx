import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { downloadFile, getDownloadProgress } from '../services/downloadService';

interface DownloadItem {
  id: string;
  filename: string;
  size: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  error?: string;
  url: string;
}

export function DownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error loading downloads:', error);
      setError('Failed to load downloads');
    }
  };

  const startDownload = async (item: DownloadItem) => {
    try {
      setDownloads(prev => 
        prev.map(d => d.id === item.id ? { ...d, status: 'downloading', progress: 0 } : d)
      );

      await downloadFile(item.url, item.filename, (progress) => {
        setDownloads(prev =>
          prev.map(d => d.id === item.id ? { ...d, progress } : d)
        );
      });

      setDownloads(prev =>
        prev.map(d => d.id === item.id ? { ...d, status: 'completed', progress: 100 } : d)
      );

      // Update status in database
      await supabase
        .from('downloads')
        .update({ status: 'completed' })
        .eq('id', item.id);

    } catch (error) {
      console.error('Download error:', error);
      setDownloads(prev =>
        prev.map(d => d.id === item.id ? { 
          ...d, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Download failed' 
        } : d)
      );
    }
  };

  const deleteDownload = async (id: string) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDownloads(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting download:', error);
      setError('Failed to delete download');
    }
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Downloads</h2>
      </div>

      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {downloads.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.filename}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatSize(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'downloading' && (
                    <div className="w-32">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}

                  {item.status === 'error' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}

                  {item.status === 'pending' && (
                    <button
                      onClick={() => startDownload(item)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  )}

                  {item.status === 'downloading' && (
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  )}

                  <button
                    onClick={() => deleteDownload(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {item.error && (
                <p className="mt-2 text-sm text-red-600">{item.error}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {downloads.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No downloads yet</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
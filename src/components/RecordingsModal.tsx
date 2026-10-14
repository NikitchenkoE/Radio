import React, { useState, useRef } from 'react';
import {
  X,
  Mic,
  Download,
  Trash2,
  Play,
  Pause,
  Clock,
  HardDrive,
  FileAudio,
} from 'lucide-react';
import { BroadcastRecording } from '../types';

interface RecordingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordings: BroadcastRecording[];
  onDeleteRecording: (id: string) => void;
  onClearAll: () => void;
  onDownloadRecording: (recording: BroadcastRecording) => void;
  onPauseRadio?: () => void;
}

export const RecordingsModal: React.FC<RecordingsModalProps> = ({
  isOpen,
  onClose,
  recordings = [],
  onDeleteRecording,
  onClearAll,
  onDownloadRecording,
  onPauseRadio,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTogglePlayPreview = (recording: BroadcastRecording) => {
    if (playingId === recording.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingId(null);
    } else {
      // Pause main radio station stream so it does not overlap with recording preview!
      onPauseRadio?.();

      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(recording.blobUrl);
      audioPreviewRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.onerror = () => setPlayingId(null);
      audio.play().then(() => setPlayingId(recording.id)).catch(() => setPlayingId(null));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div
        id="recordings-dialog"
        className="w-full max-w-2xl modal-bg border border-theme rounded-none shadow-2xl p-5 relative flex flex-col max-h-[85vh] select-none animate-in fade-in duration-200"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-main">Записи ефіру</h2>
                <span className="text-xs px-1.5 py-0.2 rounded-none subtle-bg text-main font-mono font-bold border border-theme">
                  {recordings.length}
                </span>
              </div>
              <p className="text-[11px] text-sub">
                Прослуховуйте або зберігайте записане аудіо
              </p>
            </div>
          </div>

          <button
            id="btn-close-recordings"
            type="button"
            onClick={() => {
              if (audioPreviewRef.current) {
                audioPreviewRef.current.pause();
              }
              onClose();
            }}
            className="p-1 opacity-60 hover:opacity-100 rounded-none hover:bg-zinc-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {recordings.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-none subtle-bg border border-theme">
              <FileAudio className="w-10 h-10 text-muted-theme mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-main">
                Записів поки що немає
              </h3>
              <p className="text-xs text-sub max-w-md mx-auto mt-1">
                Увімкніть радіостанцію та виберіть <span className="text-[#c5a880] font-semibold">«Запис»</span> на панелі.
              </p>
            </div>
          ) : (
            recordings.map((rec) => {
              const isPlayingThis = playingId === rec.id;

              return (
                <div
                  key={rec.id}
                  id={`recording-item-${rec.id}`}
                  className={`p-3 rounded-none border transition-all card-bg ${
                    isPlayingThis
                      ? 'border-[#c5a880] ring-1 ring-[#c5a880] shadow-xs'
                      : 'hover:border-zinc-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-main text-xs sm:text-sm truncate">
                          {rec.stationName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-none subtle-bg text-sub border border-theme">
                          {rec.stationGenre}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-sub font-mono">
                        <span className="flex items-center gap-1 text-[#c5a880] font-bold">
                          <Clock className="w-3 h-3" />
                          {formatDuration(rec.durationSeconds)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-muted-theme" />
                          {formatFileSize(rec.sizeBytes)}
                        </span>
                        <span>•</span>
                        <span>{formatDate(rec.timestamp)}</span>
                      </div>
                    </div>

                    {/* Actions: Play Preview, Download, Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePlayPreview(rec)}
                        className={`p-1.5 px-2 rounded-none text-xs font-semibold flex items-center gap-1 transition-colors border ${
                          isPlayingThis
                            ? 'bg-[#c5a880] text-black border-[#c5a880]'
                            : 'btn-secondary'
                        }`}
                        title={isPlayingThis ? 'Призупинити' : 'Прослухати запис'}
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Пауза</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            <span>Слухати</span>
                          </>
                        )}
                      </button>

                      <button
                        id={`btn-download-rec-${rec.id}`}
                        type="button"
                        onClick={() => onDownloadRecording(rec)}
                        className="p-1.5 px-2 rounded-none bg-[#c5a880]/15 hover:bg-[#c5a880]/25 text-[#c5a880] border border-[#c5a880]/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Завантажити аудіофайл"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Зберегти</span>
                      </button>

                      <button
                        id={`btn-delete-rec-${rec.id}`}
                        type="button"
                        onClick={() => {
                          if (playingId === rec.id && audioPreviewRef.current) {
                            audioPreviewRef.current.pause();
                            setPlayingId(null);
                          }
                          onDeleteRecording(rec.id);
                        }}
                        className="p-1.5 rounded-none text-muted-theme hover:text-[#c5a880] hover:bg-[#c5a880]/10 transition-colors"
                        title="Видалити запис"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Clear all */}
        {recordings.length > 0 && (
          <div className="pt-2.5 border-t border-theme flex items-center justify-between gap-4 text-[11px] text-sub">
            <span>Збережено у пам'яті браузера</span>
            <button
              id="btn-clear-all-recordings"
              type="button"
              onClick={() => {
                if (window.confirm('Ви впевнені, що хочете видалити всі збережені записи?')) {
                  if (audioPreviewRef.current) {
                    audioPreviewRef.current.pause();
                  }
                  setPlayingId(null);
                  onClearAll();
                }
              }}
              className="text-[#c5a880] hover:underline font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Очистити всі
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

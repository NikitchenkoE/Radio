import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Radio,
  Zap,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md card-bg border border-theme rounded-xl shadow-2xl p-5 sm:p-6 text-main select-none">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-sub hover:text-main rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Закрити"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-theme">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004643] to-[#002826] border border-[#f9bc60]/30 flex items-center justify-center text-white shadow-md">
            <Radio className="w-6 h-6 text-[#f9bc60]" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-main leading-tight">
              Встановити «Слобода FM»
            </h3>
            <p className="text-xs text-sub mt-0.5">
              Швидкий запуск на Android, iPhone та ПК
            </p>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-2.5 text-xs text-sub">
            <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-main">Запуск в 1 дотик</strong> з головного екрана смартфону без відкриття браузера.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-sub">
            <Smartphone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-main">Повноекранний режим</strong> — ніяких зайвих вкладок та смужок браузера.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-sub">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-main">Безпечно та без маркетів</strong> — не займає пам'ять, оновлюється автоматично.
            </span>
          </div>
        </div>

        {/* Instructions / Action Button based on OS */}
        {isInstalled ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Додаток уже встановлено на ваш пристрій!</span>
          </div>
        ) : isIOS ? (
          /* iOS Step-by-Step Instructions */
          <div className="p-3.5 bg-black/5 dark:bg-white/5 border border-theme rounded-lg space-y-2.5 text-xs mb-4">
            <div className="font-bold text-main flex items-center gap-1.5">
              <span>Як встановити на iPhone / iPad:</span>
            </div>
            <ol className="space-y-2 text-sub list-decimal pl-4">
              <li>
                У нижній панелі Safari натисніть кнопку <span className="font-semibold text-main inline-flex items-center gap-1 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-xs"><Share2 className="w-3 h-3 text-blue-500" /> «Поділитися»</span>
              </li>
              <li>
                Прокрутіть список униз та виберіть <span className="font-semibold text-main inline-flex items-center gap-1 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-xs"><PlusSquare className="w-3 h-3 text-emerald-500" /> «На початковий екран»</span>
              </li>
              <li>
                У верхньому правому кутку натисніть <strong className="text-main">«Додати»</strong>
              </li>
            </ol>
          </div>
        ) : (
          /* Android / Desktop / Chrome One-Click Install */
          <div className="mb-4">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                deferredPrompt
                  ? 'bg-[#004643] hover:bg-[#003835] text-white'
                  : 'bg-black/10 dark:bg-white/10 text-sub cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {deferredPrompt ? 'Встановити додаток в 1 клік' : 'Натисніть три крапки браузера ➡️ «Встановити додаток»'}
              </span>
            </button>
            {!deferredPrompt && (
              <p className="text-[11px] text-center text-sub mt-2">
                Або відкрийте меню вашого браузера (⋮) та натисніть «Встановити на телефон».
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="pt-3 border-t border-theme flex items-center justify-between text-[11px] text-sub">
          <span>Слобода FM v2.4 PWA</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:underline font-semibold cursor-pointer"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};

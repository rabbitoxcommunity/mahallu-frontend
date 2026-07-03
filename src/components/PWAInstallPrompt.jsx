import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

const DISMISSED_KEY = 'pwa-install-dismissed';

const isIos = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.navigator.standalone;

const isInStandaloneMode = () =>
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

export default function PWAInstallPrompt() {
    const [prompt, setPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [ios, setIos] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(DISMISSED_KEY) || isInStandaloneMode()) return;

        if (isIos()) {
            setIos(true);
            setVisible(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setPrompt(e);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!prompt) return;
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') setVisible(false);
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, '1');
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm"
                >
                    {ios ? (
                        <div className="rounded-2xl bg-white dark:bg-[#1e1f25] p-4 shadow-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600">
                                        <img src="/icons/icon-192x192.png" alt="App icon" className="h-8 w-8 rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Install Mahallu CRM</p>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200">1</span>
                                    <span>Tap the <strong>Share</strong> button</span>
                                    <span className="ml-auto text-blue-500">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                            <polyline points="16 6 12 2 8 6" />
                                            <line x1="12" y1="2" x2="12" y2="15" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200">2</span>
                                    <span>Tap <strong>Add to Home Screen</strong></span>
                                    <span className="ml-auto">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <line x1="12" y1="8" x2="12" y2="16" />
                                            <line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            {/* Arrow pointing to bottom bar */}
                            <div className="mt-3 flex justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 animate-bounce">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#1e1f25] p-4 shadow-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600">
                                <img src="/icons/icon-192x192.png" alt="App icon" className="h-10 w-10 rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Install Mahallu CRM</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Add to home screen for quick access</p>
                            </div>
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors shrink-0"
                            >
                                <Download size={13} />
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

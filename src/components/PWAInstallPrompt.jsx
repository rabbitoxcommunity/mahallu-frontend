import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

const DISMISSED_KEY = 'pwa-install-dismissed';

export default function PWAInstallPrompt() {
    const [prompt, setPrompt] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(DISMISSED_KEY)) return;

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
        if (outcome === 'accepted') {
            setVisible(false);
        }
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
                    <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#1e1f25] p-4 shadow-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600">
                            <img src="/icons/icon-192x192.png" alt="App icon" className="h-10 w-10 rounded-lg" onError={(e) => { e.target.style.display='none'; }} />
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}

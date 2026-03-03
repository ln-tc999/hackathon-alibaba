import { useState, useEffect } from 'react';
import App from './App';

export default function AppContainer() {
    const [showApp, setShowApp] = useState(false);

    // Handle hash routing
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const shouldShowApp = hash === '#app';
            setShowApp(shouldShowApp);
            
            // Toggle landing visibility
            const landing = document.getElementById('landing-view');
            if (landing) {
                if (shouldShowApp) {
                    landing.style.opacity = '0';
                    landing.style.pointerEvents = 'none';
                } else {
                    landing.style.opacity = '1';
                    landing.style.pointerEvents = 'auto';
                }
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        
        // Listen for custom event from landing page buttons
        const handleLaunchApp = () => {
            window.location.hash = 'app';
        };
        window.addEventListener('launch-app', handleLaunchApp);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('launch-app', handleLaunchApp);
        };
    }, []);

    const handleBackToHome = () => {
        window.location.hash = '';
        // Scroll to top when going back to landing
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    return (
        <div
            id="app-view"
            className={`fixed inset-0 transition-opacity duration-500 ${
                showApp ? 'opacity-100 z-50' : 'opacity-0 pointer-events-none -z-10'
            }`}
        >
            {showApp && <App onBackToHome={handleBackToHome} />}
        </div>
    );
}

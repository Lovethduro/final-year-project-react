import { useEffect, useRef } from 'react';

const ELFSIGHT_SCRIPT_ID = 'elfsight-platform-script';
const ELFSIGHT_APP_CLASS = 'elfsight-app-8c79923b-21dd-4956-ab69-4e1aa11aae3a';

function loadElfsightScript() {
    if (document.getElementById(ELFSIGHT_SCRIPT_ID)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = ELFSIGHT_SCRIPT_ID;
        script.src = 'https://apps.elfsight.com/p/platform.js';
        script.defer = true;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google reviews widget'));
        document.body.appendChild(script);
    });
}

function GoogleStarsBadge() {
    const widgetRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        loadElfsightScript()
            .then(() => {
                if (cancelled || !widgetRef.current) return;
                window.dispatchEvent(new Event('load'));
            })
            .catch(() => {
                // Widget script blocked or offline — section stays empty.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div data-cyforce-landing-reviews>
            <div
                ref={widgetRef}
                className={ELFSIGHT_APP_CLASS}
                data-elfsight-app-lazy
            />
        </div>
    );
}

export default GoogleStarsBadge;

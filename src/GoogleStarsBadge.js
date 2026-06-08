// src/GoogleStarsBadge.jsx
import { useEffect, useRef, useState } from 'react';

function GoogleStarsBadge() {
    const containerRef = useRef(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const script = document.createElement('script');
        script.src = 'https://apps.elfsight.com/p/platform.js';
        script.defer = true;
        script.async = true;

        script.onerror = () => {
            setLoadFailed(true);
        };

        script.onload = () => {
            // Elfsight loads async widgets; script load success is enough
        };

        try {
            container.appendChild(script);
        } catch {
            setLoadFailed(true);
        }

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    if (loadFailed) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="elfsight-app-8c79923b-21dd-4956-ab69-4e1aa11aae3a"
            data-elfsight-app-lazy
        />
    );
}

export default GoogleStarsBadge;

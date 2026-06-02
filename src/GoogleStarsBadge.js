// src/GoogleStarsBadge.jsx
import { useEffect, useRef } from 'react';

function GoogleStarsBadge() {
    const containerRef = useRef(null);

    useEffect(() => {
        // Load Elfsight platform script
        const script = document.createElement('script');
        script.src = "https://apps.elfsight.com/p/platform.js";
        script.defer = true;

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="elfsight-app-8c79923b-21dd-4956-ab69-4e1aa11aae3a"
            data-elfsight-app-lazy
        ></div>
    );
}

export default GoogleStarsBadge;
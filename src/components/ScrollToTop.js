import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToHash(hash) {
    if (!hash) return false;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
    }
    return false;
}

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            if (scrollToHash(hash)) return undefined;
            const timer = window.setTimeout(() => scrollToHash(hash), 150);
            return () => window.clearTimeout(timer);
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname, hash]);

    return null;
}

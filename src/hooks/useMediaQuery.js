import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const media = window.matchMedia(query);
        const onChange = () => setMatches(media.matches);
        onChange();
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}

export function useIsMobile(breakpoint = 900) {
    return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

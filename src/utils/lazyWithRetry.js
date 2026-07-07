import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'cyforce:chunk-reload';

function isChunkLoadError(error) {
    const message = String(error?.message || error || '');
    return error?.name === 'ChunkLoadError' || /Loading chunk [\s\S]+ failed/i.test(message);
}

/**
 * Lazy import with one automatic full-page reload when a stale webpack chunk fails to load.
 */
export function lazyWithRetry(importFn) {
    return lazy(() =>
        importFn().catch((error) => {
            if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
                sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
                window.location.reload();
                return new Promise(() => {});
            }
            sessionStorage.removeItem(CHUNK_RELOAD_KEY);
            return Promise.reject(error);
        })
    );
}

export function clearChunkReloadFlag() {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

import { Component } from 'react';
import { theme } from '../styles/theme';
import { clearChunkReloadFlag } from '../utils/lazyWithRetry';

function isChunkLoadError(error) {
    const message = String(error?.message || error || '');
    return error?.name === 'ChunkLoadError' || /Loading chunk [\s\S]+ failed/i.test(message);
}

export class ChunkErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    handleRetry = () => {
        clearChunkReloadFlag();
        window.location.reload();
    };

    render() {
        const { error } = this.state;
        if (!error) {
            return this.props.children;
        }

        const chunkError = isChunkLoadError(error);

        return (
            <div style={{
                maxWidth: 480,
                margin: '48px auto',
                padding: 24,
                borderRadius: 12,
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                textAlign: 'center',
                fontFamily: theme.fontBody,
            }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 18, color: theme.text, fontFamily: theme.fontHeading }}>
                    {chunkError ? 'Page update required' : 'Something went wrong'}
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: theme.textMuted, lineHeight: 1.55 }}>
                    {chunkError
                        ? 'The app was updated while this tab was open. Reload to fetch the latest version.'
                        : (error.message || 'An unexpected error occurred.')}
                </p>
                <button
                    type="button"
                    onClick={this.handleRetry}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: theme.primary,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Reload page
                </button>
            </div>
        );
    }
}

import { useEffect, useState } from 'react';
import { supportApi } from '../utils/apiClient';
import { theme } from '../styles/theme';
import { PrimaryButton } from './ui';

function plainAiText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/^\s*\*\s+/gm, '• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const ACTION_LABELS = {
    summarize: 'Summary',
    reply: 'Suggested reply',
    analyze: 'Analysis',
};

export function TicketCopilotPanel({ ticketId, onUseReply, defaultCollapsed = true }) {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState('');
    const [activeAction, setActiveAction] = useState(null);
    const [resultText, setResultText] = useState('');
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        setLoading(null);
        setError('');
        setActiveAction(null);
        setResultText('');
        setMeta(null);
    }, [ticketId]);

    const run = async (action) => {
        setLoading(action);
        setError('');
        setActiveAction(action);
        setResultText('');
        setMeta(null);

        try {
            let data;
            if (action === 'summarize') {
                data = await supportApi.copilotSummarize(ticketId);
                setResultText(data.summary || '');
            } else if (action === 'reply') {
                data = await supportApi.copilotSuggestReply(ticketId);
                setResultText(data.suggestedReply || '');
            } else {
                data = await supportApi.copilotAnalyze(ticketId);
                setResultText(data.analysis || '');
            }
            setMeta({
                aiEnabled: data.aiEnabled,
                relatedArticles: data.relatedArticles || [],
                suggestedPriority: data.suggestedPriority,
            });
        } catch (err) {
            setError(err.message);
            setActiveAction(null);
        } finally {
            setLoading(null);
        }
    };

    const panelStyle = {
        marginBottom: 12,
        padding: '10px 12px',
        borderRadius: 10,
        border: `0.5px solid ${theme.primary}44`,
        background: 'rgba(43,92,230,0.08)',
    };

    const resultStyle = {
        fontSize: 13,
        color: theme.text,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        margin: '10px 0 0',
    };

    const showRelatedArticles = activeAction && activeAction !== 'analyze' && meta?.relatedArticles?.length > 0;

    const body = (
        <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: defaultCollapsed ? 8 : 0 }}>
                {(['summarize', 'reply', 'analyze']).map((action) => (
                    <button
                        key={action}
                        type="button"
                        disabled={!!loading}
                        onClick={() => run(action)}
                        style={{
                            ...actionBtnStyle,
                            borderColor: activeAction === action ? theme.primary : theme.border,
                            background: activeAction === action ? 'rgba(43,92,230,0.2)' : 'rgba(255,255,255,0.06)',
                        }}
                    >
                        {loading === action ? '…' : action === 'summarize' ? 'Summarize' : action === 'reply' ? 'Suggest reply' : 'Analyze'}
                    </button>
                ))}
            </div>

            {error && <p style={{ color: theme.error, fontSize: 12, margin: '8px 0 0' }}>{error}</p>}

            {loading && (
                <p style={{ fontSize: 12, color: theme.textDim, margin: '8px 0 0' }}>
                    Generating {ACTION_LABELS[loading]?.toLowerCase()}…
                </p>
            )}

            {!loading && activeAction && resultText && (
                <div style={{ marginTop: 10 }}>
                    {meta && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6, fontSize: 11, color: theme.textDim }}>
                            <span>{meta.aiEnabled ? 'Groq AI' : 'Heuristic mode'}</span>
                            {meta.suggestedPriority && activeAction !== 'reply' && (
                                <span>· Priority: <strong style={{ color: theme.text }}>{meta.suggestedPriority}</strong></span>
                            )}
                        </div>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted }}>{ACTION_LABELS[activeAction]}</div>
                    <p style={resultStyle}>{plainAiText(resultText)}</p>
                    {activeAction === 'reply' && onUseReply && (
                        <PrimaryButton
                            type="button"
                            onClick={() => onUseReply(plainAiText(resultText))}
                            style={{ fontSize: 11, padding: '6px 12px', marginTop: 8 }}
                        >
                            Use in reply box
                        </PrimaryButton>
                    )}
                </div>
            )}

            {!loading && showRelatedArticles && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${theme.border}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>Related knowledge base</div>
                    {meta.relatedArticles.map((article) => (
                        <div key={article.id} style={{ fontSize: 12, color: theme.text, marginBottom: 6 }}>
                            <strong>{article.title}</strong>
                            {article.category && <span style={{ color: theme.textDim }}> · {article.category}</span>}
                            {article.excerpt && (
                                <div style={{ color: theme.textDim, fontSize: 11, marginTop: 2 }}>{article.excerpt}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    if (defaultCollapsed) {
        return (
            <details style={panelStyle}>
                <summary style={{ fontSize: 12, fontWeight: 600, color: theme.primary, cursor: 'pointer', listStyle: 'none' }}>
                    AI Copilot
                    <span style={{ fontWeight: 400, color: theme.textDim, marginLeft: 6 }}>— summarize, draft, KB</span>
                </summary>
                {body}
            </details>
        );
    }

    return (
        <div style={panelStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.primary, marginBottom: 4 }}>AI Ticket Copilot</div>
            {body}
        </div>
    );
}

const actionBtnStyle = {
    fontSize: 11,
    padding: '6px 12px',
    borderRadius: 6,
    border: `0.5px solid ${theme.border}`,
    background: 'rgba(255,255,255,0.06)',
    color: theme.text,
    cursor: 'pointer',
};

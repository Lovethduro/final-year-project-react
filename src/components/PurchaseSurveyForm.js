import { useEffect, useState } from 'react';
import { feedbackApi } from '../utils/apiClient';
import { refreshNotifications } from '../utils/notifications';
import { theme } from '../styles/theme';
import { Select } from './ui';
import { StarRatingInput } from './StarRatingInput';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export function PurchaseSurveyForm({ token, compact = false, onComplete }) {
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        processRating: 0,
        agentRating: 0,
        checkoutEase: 0,
        recommendScore: 0,
        deliveryExpectation: '',
        wouldBuyAgain: '',
        wouldBuyAgainReason: '',
        comment: '',
    });

    useEffect(() => {
        if (!token) return;
        feedbackApi.getPurchaseSurvey(token)
            .then(setSurvey)
            .catch((err) => setError(err.message));
    }, [token]);

    const submit = async (e) => {
        e.preventDefault();
        if (form.processRating < 1) {
            setError('Please rate your overall experience.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const reason = form.wouldBuyAgain === 'no' ? form.wouldBuyAgainReason.trim() : '';
            const commentParts = [form.comment.trim()];
            if (reason) commentParts.push(`Why I would not shop with CyForce again: ${reason}`);

            const payload = {
                processRating: form.processRating,
                checkoutEase: form.checkoutEase || 5,
                recommendScore: form.recommendScore || 5,
                wouldBuyAgain: form.wouldBuyAgain,
                comment: commentParts.filter(Boolean).join('\n\n'),
            };
            if (reason) {
                payload.wouldBuyAgainReason = reason;
            }
            if (survey?.agentName && form.agentRating > 0) {
                payload.agentRating = form.agentRating;
            }
            await feedbackApi.submitPurchaseSurvey(token, payload);
            setSuccess('Thank you! Your feedback helps us improve.');
            setSurvey((prev) => (prev ? { ...prev, completed: true } : prev));
            refreshNotifications();
            onComplete?.();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(15,23,42,0.04)',
        border: `0.5px solid ${theme.border}`,
        borderRadius: 8,
        padding: 10,
        color: theme.text,
        fontFamily: theme.fontBody,
        marginBottom: 12,
    };

    if (!token) return null;
    if (!survey && !error) {
        return <p style={{ color: theme.textDim, fontSize: 13 }}>Loading survey…</p>;
    }
    if (survey?.completed || success) {
        return <p style={{ color: theme.success, fontSize: compact ? 13 : 14 }}>Thank you for your feedback!</p>;
    }

    return (
        <div style={{ marginTop: compact ? 12 : 0 }}>
            {error && <p style={{ color: theme.error, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ background: theme.bgCard, borderRadius: 10, padding: compact ? 12 : 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: theme.textDim }}>Order</div>
                <div style={{ fontSize: compact ? 14 : 15, color: theme.text, fontWeight: 600 }}>{survey?.description || 'Purchase'}</div>
                <div style={{ fontSize: compact ? 16 : 18, color: theme.accent, marginTop: 6 }}>{formatNaira(survey?.amount)}</div>
                {survey?.agentName && (
                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 8 }}>Sales agent: {survey.agentName}</div>
                )}
            </div>
            <form onSubmit={submit}>
                <label style={{ display: 'block', fontSize: 13, color: theme.text, marginBottom: 8 }}>
                    How was your overall purchase experience? *
                </label>
                <StarRatingInput value={form.processRating} onChange={(v) => setForm((f) => ({ ...f, processRating: v }))} />
                {survey?.agentName && (
                    <>
                        <label style={{ display: 'block', fontSize: 13, color: theme.text, margin: '16px 0 8px' }}>
                            How would you rate {survey.agentName}?
                        </label>
                        <StarRatingInput value={form.agentRating} onChange={(v) => setForm((f) => ({ ...f, agentRating: v }))} />
                    </>
                )}
                <label style={{ display: 'block', fontSize: 13, color: theme.text, margin: '16px 0 8px' }}>
                    How easy was checkout? (1-10)
                </label>
                <input type="range" min="1" max="10" value={form.checkoutEase || 5}
                    onChange={(e) => setForm((f) => ({ ...f, checkoutEase: Number(e.target.value) }))}
                    style={{ width: '100%', marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{form.checkoutEase || 5} / 10</div>
                <label style={{ display: 'block', fontSize: 13, color: theme.text, marginBottom: 8 }}>
                    How likely are you to recommend CyForce? (1-10)
                </label>
                <input type="range" min="1" max="10" value={form.recommendScore || 5}
                    onChange={(e) => setForm((f) => ({ ...f, recommendScore: Number(e.target.value) }))}
                    style={{ width: '100%', marginBottom: 4 }} />
                <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{form.recommendScore || 5} / 10</div>
                <Select
                    value={form.wouldBuyAgain}
                    onChange={(e) => setForm((f) => ({
                        ...f,
                        wouldBuyAgain: e.target.value,
                        wouldBuyAgainReason: e.target.value === 'no' ? f.wouldBuyAgainReason : '',
                    }))}
                >
                    <option value="">Would you buy from us again?</option>
                    <option value="yes">Yes, definitely</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                </Select>
                {form.wouldBuyAgain === 'no' && (
                    <div style={{
                        marginBottom: 12,
                        padding: compact ? '10px 12px' : '12px 14px',
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: 'rgba(180,83,9,0.06)',
                    }}>
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: theme.text, lineHeight: 1.45 }}>
                            We’re sorry to hear you would not shop with us again.
                            If you are willing, please tell us why - this helps us improve.
                        </p>
                        <p style={{ margin: '0 0 8px', fontSize: 11, color: theme.textDim }}>
                            Optional - you can skip this and still submit.
                        </p>
                        <textarea
                            style={{ ...inputStyle, minHeight: compact ? 64 : 80, marginBottom: 0 }}
                            placeholder="Why would you not shop with CyForce again? (optional)"
                            value={form.wouldBuyAgainReason}
                            onChange={(e) => setForm((f) => ({ ...f, wouldBuyAgainReason: e.target.value }))}
                        />
                    </div>
                )}
                <textarea style={{ ...inputStyle, minHeight: compact ? 64 : 80 }} placeholder="Any additional comments?"
                    value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
                <button type="submit" disabled={submitting} style={{
                    width: '100%', padding: compact ? '10px 16px' : '12px 20px', borderRadius: 8, border: 'none',
                    background: theme.primary, color: '#fff', fontWeight: 600, cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1,
                }}>
                    {submitting ? 'Submitting…' : 'Submit feedback'}
                </button>
            </form>
        </div>
    );
}

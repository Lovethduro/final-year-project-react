import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feedbackApi } from './utils/apiClient';
import { theme, cardStyle } from './styles/theme';
import { Select } from './components/ui';
import { StarRatingInput } from './components/StarRatingInput';

function formatNaira(kobo) {
    if (!kobo) return '₦0';
    return `₦${(kobo / 100).toLocaleString()}`;
}

export default function PurchaseSurveyPage() {
    const { token } = useParams();
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
            await feedbackApi.submitPurchaseSurvey(token, form);
            setSuccess('Thank you! Your feedback helps us improve.');
            setSurvey((prev) => (prev ? { ...prev, completed: true } : prev));
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${theme.border}`,
        borderRadius: 8,
        padding: 10,
        color: theme.text,
        fontFamily: theme.fontBody,
        marginBottom: 12,
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '40px 20px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', ...cardStyle, padding: 28 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontFamily: theme.fontHeading, color: theme.text, fontSize: 26, marginBottom: 8 }}>Rate Your Purchase</h1>
                    <p style={{ color: theme.textMuted, fontSize: 14 }}>Tell us how your CyForce purchase experience went.</p>
                </div>

                {error && <p style={{ color: theme.error, fontSize: 14, marginBottom: 16 }}>{error}</p>}
                {success && <p style={{ color: theme.success, fontSize: 14, marginBottom: 16 }}>{success}</p>}

                {!survey && !error && <p style={{ color: theme.textDim }}>Loading survey…</p>}

                {survey?.completed && (
                    <div style={{ textAlign: 'center', padding: 24 }}>
                        <p style={{ color: theme.success, fontSize: 16, marginBottom: 16 }}>You already submitted this survey. Thank you!</p>
                        <Link to="/login" style={{ color: theme.accent }}>Sign in to your account</Link>
                    </div>
                )}

                {survey && !survey.completed && !success && (
                    <>
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                            <div style={{ fontSize: 13, color: theme.textDim }}>Order</div>
                            <div style={{ fontSize: 15, color: theme.text, fontWeight: 600 }}>{survey.description || 'Purchase'}</div>
                            <div style={{ fontSize: 18, color: theme.accent, marginTop: 6 }}>{formatNaira(survey.amount)}</div>
                            {survey.agentName && (
                                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 8 }}>Sales agent: {survey.agentName}</div>
                            )}
                        </div>

                        <form onSubmit={submit}>
                            <label style={{ display: 'block', fontSize: 13, color: theme.text, marginBottom: 8 }}>
                                How was your overall purchase experience? *
                            </label>
                            <StarRatingInput value={form.processRating} onChange={(v) => setForm((f) => ({ ...f, processRating: v }))} />

                            {survey.agentName && (
                                <>
                                    <label style={{ display: 'block', fontSize: 13, color: theme.text, margin: '20px 0 8px' }}>
                                        How would you rate {survey.agentName}?
                                    </label>
                                    <StarRatingInput value={form.agentRating} onChange={(v) => setForm((f) => ({ ...f, agentRating: v }))} />
                                </>
                            )}

                            <label style={{ display: 'block', fontSize: 13, color: theme.text, margin: '20px 0 8px' }}>
                                How easy was checkout? (1–10)
                            </label>
                            <input type="range" min="1" max="10" value={form.checkoutEase || 5}
                                onChange={(e) => setForm((f) => ({ ...f, checkoutEase: Number(e.target.value) }))}
                                style={{ width: '100%', marginBottom: 4 }} />
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{form.checkoutEase || 5} / 10</div>

                            <label style={{ display: 'block', fontSize: 13, color: theme.text, marginBottom: 8 }}>
                                How likely are you to recommend CyForce? (1–10)
                            </label>
                            <input type="range" min="1" max="10" value={form.recommendScore || 5}
                                onChange={(e) => setForm((f) => ({ ...f, recommendScore: Number(e.target.value) }))}
                                style={{ width: '100%', marginBottom: 4 }} />
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{form.recommendScore || 5} / 10</div>

                            <Select value={form.wouldBuyAgain}
                                onChange={(e) => setForm((f) => ({ ...f, wouldBuyAgain: e.target.value }))}>
                                <option value="">Would you buy from us again?</option>
                                <option value="yes">Yes, definitely</option>
                                <option value="maybe">Maybe</option>
                                <option value="no">No</option>
                            </Select>

                            <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Any additional comments?"
                                value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />

                            <button type="submit" disabled={submitting} style={{
                                width: '100%', padding: '12px 20px', borderRadius: 8, border: 'none',
                                background: theme.primary, color: '#fff', fontWeight: 600, cursor: 'pointer',
                                opacity: submitting ? 0.7 : 1,
                            }}>
                                {submitting ? 'Submitting…' : 'Submit Survey'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

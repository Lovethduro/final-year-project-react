import { useEffect, useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PageHeader, Card, Alert, PrimaryButton, DataTable, StatusBadge, ConfirmDialog, Select } from './components/ui';
import { assetUrl, contentApi, productApi } from './utils/apiClient';
import { useAuth } from './hooks/useAuth';
import { theme } from './styles/theme';

const EMPTY_FORM = {
    title: '',
    description: '',
    badge: 'Hot Deal',
    productId: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    ctaLabel: 'Shop now',
    active: true,
};

export default function HotDealsManagementPage() {
    const auth = useAuth();
    const [deals, setDeals] = useState([]);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = () => {
        contentApi.allHotDeals().then(setDeals).catch((err) => setError(err.message));
    };

    useEffect(() => {
        load();
        productApi.adminList()
            .then(setProducts)
            .catch(() => setProducts([]));
    }, []);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setImageFile(null);
        setPreviewImage(null);
        setEditingId(null);
    };

    const applyProductDefaults = (productId, currentForm = form) => {
        const product = products.find((item) => item.id === productId);
        if (!product) {
            return { ...currentForm, productId };
        }
        return {
            ...currentForm,
            productId,
            title: currentForm.title || product.name,
            description: currentForm.description || product.description || '',
            price: currentForm.price || String(product.price ?? ''),
            originalPrice: currentForm.originalPrice || String(product.originalPrice ?? product.price ?? ''),
        };
    };

    const startEdit = (deal) => {
        setEditingId(deal.id);
        setForm({
            title: deal.title || '',
            description: deal.description || '',
            badge: deal.badge || 'Hot Deal',
            productId: deal.productId || '',
            price: deal.price != null ? String(deal.price) : '',
            originalPrice: deal.originalPrice != null ? String(deal.originalPrice) : '',
            discountPercent: deal.discountPercent != null ? String(deal.discountPercent) : '',
            ctaLabel: deal.ctaLabel || 'Shop now',
            active: Boolean(deal.active),
        });
        setImageFile(null);
        setPreviewImage(deal.imageUrl ? assetUrl(deal.imageUrl) : null);
        setError('');
        setSuccess('');
    };

    const handleImageChange = (file) => {
        if (file) {
            const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowed.includes(file.type)) {
                setError('Please upload a JPG, PNG, WEBP, or GIF image.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be 5MB or smaller.');
                return;
            }
        }
        setError('');
        setImageFile(file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        } else if (editingId) {
            const deal = deals.find((d) => d.id === editingId);
            setPreviewImage(deal?.imageUrl ? assetUrl(deal.imageUrl) : null);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            if (!form.productId) {
                throw new Error('Please select the product this hot deal applies to.');
            }
            const payload = {
                title: form.title,
                description: form.description,
                badge: form.badge,
                productId: form.productId,
                price: form.price,
                originalPrice: form.originalPrice,
                discountPercent: form.discountPercent,
                ctaLabel: form.ctaLabel,
                active: String(form.active),
            };
            if (editingId) {
                await contentApi.updateHotDeal(editingId, payload, imageFile);
                setSuccess('Hot deal updated. Customers are notified when a deal is published or re-activated.');
            } else {
                if (!imageFile) {
                    throw new Error('Please upload a deal image.');
                }
                await contentApi.createHotDeal(payload, imageFile);
                setSuccess(form.active
                    ? 'Hot deal published. All customers have been notified.'
                    : 'Hot deal saved as draft.');
            }
            resetForm();
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setError('');
        try {
            await contentApi.deleteHotDeal(deleteTarget.id);
            setSuccess('Hot deal removed.');
            if (editingId === deleteTarget.id) resetForm();
            setDeleteTarget(null);
            load();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const productName = (productId) => products.find((p) => p.id === productId)?.name || '—';
    const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `0.5px solid ${theme.border}`, borderRadius: 8, padding: 10, color: theme.text, fontFamily: theme.fontBody, marginBottom: 12 };

    return (
        <DashboardLayout>
            <PageHeader
                title="Hot Deals"
                subtitle="Link each deal to a catalog product. Shop now adds that product to the customer's cart at the deal price."
                action={editingId ? <PrimaryButton onClick={resetForm}>+ New Deal</PrimaryButton> : null}
            />
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 24 }}>
                <Card title={editingId ? 'Edit Hot Deal' : 'Create Hot Deal'}>
                    <form onSubmit={handleSubmit}>
                        <Select
                            value={form.productId}
                            onChange={(e) => setForm(applyProductDefaults(e.target.value))}
                            required
                        >
                            <option value="">Select product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} — ₦{Number(product.price).toLocaleString()}
                                </option>
                            ))}
                        </Select>
                        <input style={inputStyle} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        <input style={inputStyle} placeholder="Badge (e.g. Limited Time)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                        <input style={inputStyle} type="number" min="0" placeholder="Deal price (NGN)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                        <input style={inputStyle} type="number" min="0" placeholder="Original price (NGN)" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                        <input style={{ ...inputStyle, padding: 8 }} type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0] || null)} />
                        <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>
                            {editingId ? 'Leave image empty to keep the current photo.' : 'Image is required for new deals.'}
                        </p>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Deal preview"
                                style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12, border: `0.5px solid ${theme.border}` }}
                            />
                        )}
                        <input style={inputStyle} placeholder="Button label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>
                            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                            Publish now (sends notification to all customers)
                        </label>
                        <PrimaryButton type="submit" disabled={saving}>
                            {saving ? 'Saving…' : editingId ? 'Update Deal' : 'Publish Deal'}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>

            <Card title="All Hot Deals">
                <DataTable
                    columns={[
                        { key: 'title', label: 'Title' },
                        { key: 'productId', label: 'Product', render: (r) => productName(r.productId) },
                        { key: 'imageUrl', label: 'Image', render: (r) => r.imageUrl ? (
                            <img src={assetUrl(r.imageUrl)} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                        ) : '—' },
                        { key: 'price', label: 'Price', render: (r) => r.price != null ? `₦${Number(r.price).toLocaleString()}` : '—' },
                        { key: 'discountPercent', label: 'Discount', render: (r) => r.discountPercent ? `${r.discountPercent}%` : '—' },
                        { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'success' : 'warning'} label={r.active ? 'Live' : 'Hidden'} /> },
                        { key: 'actions', label: '', render: (r) => (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => startEdit(r)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>Edit</button>
                                {auth.isAdmin && (
                                    <button type="button" onClick={() => setDeleteTarget(r)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: theme.error, cursor: 'pointer' }}>Remove</button>
                                )}
                            </div>
                        )},
                    ]}
                    rows={deals}
                    emptyMessage="No hot deals yet."
                />
            </Card>

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Remove hot deal?"
                message={deleteTarget ? `"${deleteTarget.title}" will be permanently removed along with its image. Customers will no longer see this offer.` : ''}
                confirmLabel="Remove"
                cancelLabel="Keep deal"
                onConfirm={handleDelete}
                onCancel={() => !deleting && setDeleteTarget(null)}
                loading={deleting}
                danger
            />
        </DashboardLayout>
    );
}

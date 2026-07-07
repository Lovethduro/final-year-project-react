import { useEffect, useState } from 'react';
import { PageHeader, Card, Alert, PrimaryButton, DataTable, StatusBadge, Select } from './components/ui';
import { productApi } from './utils/apiClient';
import { resolveProductImage } from './utils/productUtils';
import { theme } from './styles/theme';

const EMPTY_FORM = {
    name: '',
    category: 'Security',
    price: '',
    originalPrice: '',
    description: '',
    stockQuantity: '10',
    inStock: true,
    featured: false,
    active: true,
};

export default function ProductsManagementPage() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () => {
        productApi.adminList()
            .then(setProducts)
            .catch((err) => setError(err.message));
    };

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setImageFile(null);
        setEditingId(null);
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setForm({
            name: product.name || '',
            category: product.category || '',
            price: String(product.price ?? ''),
            originalPrice: product.originalPrice != null ? String(product.originalPrice) : '',
            description: product.description || '',
            stockQuantity: String(product.stockQuantity ?? 0),
            inStock: Boolean(product.inStock),
            featured: Boolean(product.featured),
            active: Boolean(product.active),
        });
        setImageFile(null);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                ...form,
                stockQuantity: String(form.stockQuantity ?? '0'),
                inStock: String(form.inStock),
                featured: String(form.featured),
                active: String(form.active),
            };
            let saved;
            if (editingId) {
                saved = await productApi.update(editingId, payload, imageFile);
                setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
                setSuccess('Product updated successfully.');
            } else {
                if (!imageFile) {
                    throw new Error('Please upload a product image.');
                }
                saved = await productApi.create(payload, imageFile);
                setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
                setSuccess('Product created successfully.');
            }
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this product from the catalog?')) return;
        setError('');
        try {
            await productApi.delete(id);
            setSuccess('Product removed.');
            if (editingId === id) resetForm();
            load();
        } catch (err) {
            setError(err.message);
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
        <>
                    <PageHeader
                title="Product Catalog"
                subtitle="Upload and manage products shown on the website and customer portal"
                action={editingId ? <PrimaryButton onClick={resetForm}>+ New Product</PrimaryButton> : null}
            />

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 24 }}>
                <Card title={editingId ? 'Edit Product' : 'Add Product'}>
                    <form onSubmit={handleSubmit}>
                        <input style={inputStyle} placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                            {['CCTV', 'Solar', 'Security', 'Enterprise', 'ICT', 'Automation'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                        <input style={inputStyle} type="number" min="0" placeholder="Price (NGN)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                        <input style={inputStyle} type="number" min="0" placeholder="Original price for discount (optional)" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
                        <input style={inputStyle} type="number" min="0" placeholder="Stock quantity (0 = unlimited)" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
                        <textarea style={{ ...inputStyle, minHeight: 90 }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                        <input style={{ ...inputStyle, padding: 8 }} type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                        <p style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>
                            {editingId ? 'Leave image empty to keep the current photo.' : 'Image is required for new products.'}
                        </p>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, fontSize: 13, marginBottom: 8 }}>
                            <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} />
                            In stock
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, fontSize: 13, marginBottom: 8 }}>
                            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                            Featured
                        </label>
                        {editingId && (
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.textMuted, fontSize: 13, marginBottom: 12 }}>
                                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                                Visible on website
                            </label>
                        )}
                        <PrimaryButton type="submit" disabled={saving}>
                            {saving ? 'Saving…' : editingId ? 'Update Product' : 'Upload Product'}
                        </PrimaryButton>
                    </form>
                </Card>

                <Card title="Catalog Preview">
                    {products.length ? products.slice(0, 3).map((p) => (
                        <div key={p.id} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: `0.5px solid ${theme.border}` }}>
                            <img src={resolveProductImage(p.imageUrl)} alt={p.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                            <div>
                                <div style={{ color: theme.text, fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: theme.textDim }}>{p.category} · ₦{Number(p.price).toLocaleString()}</div>
                                <div style={{ fontSize: 12, color: p.active ? theme.success : theme.warning }}>{p.active ? 'Live' : 'Hidden'}</div>
                            </div>
                        </div>
                    )) : (
                        <p style={{ color: theme.textDim, fontSize: 14 }}>No products uploaded yet.</p>
                    )}
                </Card>
            </div>

            <Card title="All Products">
                <DataTable
                    columns={[
                        { key: 'name', label: 'Name' },
                        { key: 'category', label: 'Category' },
                        { key: 'price', label: 'Price', render: (r) => (
                            <div>
                                <div>₦{Number(r.price).toLocaleString()}</div>
                                {r.originalPrice != null && r.originalPrice > r.price && (
                                    <div style={{ fontSize: 11, color: theme.success }}>
                                        Was ₦{Number(r.originalPrice).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )},
                        { key: 'stockQuantity', label: 'Qty', render: (r) => (Number(r.stockQuantity) > 0 ? Number(r.stockQuantity) : '—') },
                        { key: 'inStock', label: 'Stock', render: (r) => <StatusBadge status={r.inStock ? 'success' : 'warning'} label={r.inStock ? 'Available' : 'Sold out'} /> },
                        { key: 'active', label: 'Status', render: (r) => <StatusBadge status={r.active ? 'success' : 'warning'} label={r.active ? 'Live' : 'Hidden'} /> },
                        { key: 'actions', label: '', render: (r) => (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" onClick={() => startEdit(r)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: `0.5px solid ${theme.border}`, background: 'transparent', color: theme.accent, cursor: 'pointer' }}>Edit</button>
                                <button type="button" onClick={() => handleDelete(r.id)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: theme.error, cursor: 'pointer' }}>Remove</button>
                            </div>
                        )},
                    ]}
                    rows={products}
                />
            </Card>
        </>
    );
}
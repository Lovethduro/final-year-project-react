const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function resolveProductImage(imageUrl) {
    if (!imageUrl) {
        return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&q=80';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    return `${API_ROOT}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

export function mapProductForDisplay(product) {
    return {
        ...product,
        image: resolveProductImage(product.imageUrl),
        originalPrice: product.originalPrice ?? product.price,
    };
}

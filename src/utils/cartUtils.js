import { mapProductForDisplay, maxCartQuantity, resolveProductImage } from './productUtils';

export const CART_STORAGE_KEY = 'cart';
export const CART_UPDATED_EVENT = 'cart-updated';

export function readCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function writeCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addProductToCart(product, options = {}) {
    const cart = readCart();
    const cartItem = mapProductForDisplay(product);

    if (options.price != null) {
        cartItem.price = Number(options.price);
    }
    if (options.originalPrice != null) {
        cartItem.originalPrice = Number(options.originalPrice);
    }
    if (options.name) {
        cartItem.name = options.name;
    }
    if (options.imageUrl) {
        cartItem.image = resolveProductImage(options.imageUrl);
    }
    if (options.hotDealId) {
        cartItem.hotDealId = options.hotDealId;
    }

    if (!cartItem.inStock) {
        return { cart, added: false, notice: `${cartItem.name} is currently sold out.` };
    }

    const maxQty = maxCartQuantity(cartItem);
    const existingItem = cart.find((item) => item.id === cartItem.id);

    if (existingItem) {
        if (existingItem.quantity >= maxQty) {
            return {
                cart,
                added: false,
                notice: maxQty === Infinity ? '' : `Only ${maxQty} available for ${cartItem.name}.`,
            };
        }
        const nextCart = cart.map((item) => (
            item.id === cartItem.id
                ? {
                    ...cartItem,
                    quantity: item.quantity + 1,
                }
                : item
        ));
        writeCart(nextCart);
        return { cart: nextCart, added: true, notice: `${cartItem.name} added to cart.` };
    }

    const nextCart = [...cart, { ...cartItem, quantity: 1 }];
    writeCart(nextCart);
    return { cart: nextCart, added: true, notice: `${cartItem.name} added to cart.` };
}

export function addHotDealToCart(deal, product) {
    if (!deal?.productId) {
        return { cart: readCart(), added: false, notice: 'This deal is not linked to a product yet.' };
    }
    if (!product) {
        return { cart: readCart(), added: false, notice: 'The linked product is no longer available.' };
    }

    return addProductToCart(product, {
        price: deal.price != null ? deal.price : product.price,
        originalPrice: deal.originalPrice != null ? deal.originalPrice : (product.originalPrice ?? product.price),
        name: deal.title || product.name,
        imageUrl: deal.imageUrl || product.imageUrl,
        hotDealId: deal.id,
    });
}

import { Selectable } from "kysely";
import { Products, Stands, WalletTransactions, Orders, OrderItems, OrderStatus, TransactionType } from "./schema";

// --- TYPES ---

export type MockProduct = Selectable<Products> & {
  stand: Selectable<Stands>;
};

export type MockCartItem = {
  product: MockProduct;
  quantity: number;
  // Flattened fields for easy access
  productId: number;
  name: string;
  imageUrl: string | null;
  price: string; // unit price
  subtotal: string; // price * quantity
  standName: string;
};

export type MockOrder = Selectable<Orders> & {
  items: (Selectable<OrderItems> & { product: MockProduct; productName: string; standName: string })[];
};

// --- MOCK DATA ---

export const mockStands: Selectable<Stands>[] = [
  { id: 1, name: "Puesto Criollo", description: "Sabores auténticos de nuestra tierra.", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Parrilla Don José", description: "El mejor asado y choripán del festival.", createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Rincón Italiano", description: "Pizzas y pastas como en la nonna.", createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: "Sabores del Norte", description: "Empanadas y platos típicos del norte argentino.", createdAt: new Date(), updatedAt: new Date() },
];

export const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: "Empanada de Carne",
    description: "Jugosa empanada de carne cortada a cuchillo.",
    price: "1500.00",
    imageUrl: "https://images.unsplash.com/photo-1626722196231-52374b673458?q=80&w=800",
    available: true,
    standId: 4,
    stand: mockStands[3],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Choripán Clásico",
    description: "Chorizo de puro cerdo en pan francés con chimichurri.",
    price: "3000.00",
    imageUrl: "https://images.unsplash.com/photo-1529193710993-14535f38480f?q=80&w=800",
    available: true,
    standId: 2,
    stand: mockStands[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Locro Pulsudo",
    description: "Plato tradicional con maíz, porotos, y carnes varias.",
    price: "4500.00",
    imageUrl: "https://images.unsplash.com/photo-1627907835015-5820185450e1?q=80&w=800",
    available: true,
    standId: 1,
    stand: mockStands[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Asado de Tira",
    description: "Porción generosa de asado de tira a la parrilla.",
    price: "7500.00",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
    available: true,
    standId: 2,
    stand: mockStands[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: "Pizza Muzzarella",
    description: "Clásica pizza con salsa de tomate y abundante muzzarella.",
    price: "6000.00",
    imageUrl: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800",
    available: true,
    standId: 3,
    stand: mockStands[2],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    name: "Humita en Chala",
    description: "Pasta de choclo dulce envuelta en su propia chala.",
    price: "2500.00",
    imageUrl: "https://images.unsplash.com/photo-1588353144997-457b378259d3?q=80&w=800",
    available: false,
    standId: 4,
    stand: mockStands[3],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    name: "Provoleta a la Parrilla",
    description: "Queso provolone derretido con orégano y aceite de oliva.",
    price: "3500.00",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=800",
    available: true,
    standId: 2,
    stand: mockStands[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    name: "Fideos con Tuco",
    description: "Spaghetti con una rica y casera salsa de tomate.",
    price: "4000.00",
    imageUrl: "https://images.unsplash.com/photo-1598866594240-a4233ac761e3?q=80&w=800",
    available: true,
    standId: 3,
    stand: mockStands[2],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockWalletBalance = {
  balance: "25500.50",
};

export const mockWalletTransactions: Selectable<WalletTransactions>[] = [
  {
    id: 1,
    userId: 1,
    type: "deposit" as TransactionType,
    amount: "50000.00",
    description: "Carga de saldo con MercadoPago",
    orderId: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 2,
    userId: 1,
    type: "purchase" as TransactionType,
    amount: "-10500.00",
    description: "Compra Orden #101",
    orderId: 101,
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
  },
  {
    id: 3,
    userId: 1,
    type: "purchase" as TransactionType,
    amount: "-13999.50",
    description: "Compra Orden #102",
    orderId: 102,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 4,
    userId: 1,
    type: "refund" as TransactionType,
    amount: "1500.00",
    description: "Reembolso por producto agotado",
    orderId: 102,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: 5,
    userId: 1,
    type: "purchase" as TransactionType,
    amount: "-59000.00",
    description: "Compra Orden #104",
    orderId: 104,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

export const mockMyProducts: MockOrder[] = [
  // Completed orders (products already consumed)
  {
    id: 105,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "15000.00",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    items: [
      {
        id: 301,
        orderId: 105,
        productId: 5,
        product: mockProducts.find(p => p.id === 5)!,
        quantity: 2,
        price: "6000.00",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 5)!.name,
        standName: mockProducts.find(p => p.id === 5)!.stand.name,
      },
      {
        id: 302,
        orderId: 105,
        productId: 2,
        product: mockProducts.find(p => p.id === 2)!,
        quantity: 1,
        price: "3000.00",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 2)!.name,
        standName: mockProducts.find(p => p.id === 2)!.stand.name,
      },
    ],
  },
  {
    id: 106,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "11500.00",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    items: [
      {
        id: 303,
        orderId: 106,
        productId: 4,
        product: mockProducts.find(p => p.id === 4)!,
        quantity: 1,
        price: "7500.00",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 4)!.name,
        standName: mockProducts.find(p => p.id === 4)!.stand.name,
      },
      {
        id: 304,
        orderId: 106,
        productId: 8,
        product: mockProducts.find(p => p.id === 8)!,
        quantity: 1,
        price: "4000.00",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 8)!.name,
        standName: mockProducts.find(p => p.id === 8)!.stand.name,
      },
    ],
  },
  {
    id: 107,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "9000.00",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    items: [
      {
        id: 305,
        orderId: 107,
        productId: 1,
        product: mockProducts.find(p => p.id === 1)!,
        quantity: 2,
        price: "1500.00",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 1)!.name,
        standName: mockProducts.find(p => p.id === 1)!.stand.name,
      },
      {
        id: 306,
        orderId: 107,
        productId: 5,
        product: mockProducts.find(p => p.id === 5)!,
        quantity: 1,
        price: "6000.00",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 5)!.name,
        standName: mockProducts.find(p => p.id === 5)!.stand.name,
      },
    ],
  },
  {
    id: 108,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "13000.00",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
    items: [
      {
        id: 307,
        orderId: 108,
        productId: 6,
        product: mockProducts.find(p => p.id === 6)!,
        quantity: 2,
        price: "2500.00",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 6)!.name,
        standName: mockProducts.find(p => p.id === 6)!.stand.name,
      },
      {
        id: 308,
        orderId: 108,
        productId: 8,
        product: mockProducts.find(p => p.id === 8)!,
        quantity: 2,
        price: "4000.00",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 8)!.name,
        standName: mockProducts.find(p => p.id === 8)!.stand.name,
      },
    ],
  },
  {
    id: 109,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "7500.00",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    items: [
      {
        id: 309,
        orderId: 109,
        productId: 6,
        product: mockProducts.find(p => p.id === 6)!,
        quantity: 3,
        price: "2500.00",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 6)!.name,
        standName: mockProducts.find(p => p.id === 6)!.stand.name,
      },
    ],
  },
  // Active orders
  {
    id: 104,
    userId: 1,
    status: "ready" as OrderStatus,
    total: "43500.00",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    items: [
      {
        id: 211,
        orderId: 104,
        productId: 1,
        product: mockProducts.find(p => p.id === 1)!,
        quantity: 3,
        price: "1500.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 1)!.name,
        standName: mockProducts.find(p => p.id === 1)!.stand.name,
      },
      {
        id: 212,
        orderId: 104,
        productId: 2,
        product: mockProducts.find(p => p.id === 2)!,
        quantity: 2,
        price: "3000.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 2)!.name,
        standName: mockProducts.find(p => p.id === 2)!.stand.name,
      },
      {
        id: 213,
        orderId: 104,
        productId: 3,
        product: mockProducts.find(p => p.id === 3)!,
        quantity: 1,
        price: "4500.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 3)!.name,
        standName: mockProducts.find(p => p.id === 3)!.stand.name,
      },

      {
        id: 215,
        orderId: 104,
        productId: 5,
        product: mockProducts.find(p => p.id === 5)!,
        quantity: 1,
        price: "6000.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 5)!.name,
        standName: mockProducts.find(p => p.id === 5)!.stand.name,
      },
      {
        id: 216,
        orderId: 104,
        productId: 7,
        product: mockProducts.find(p => p.id === 7)!,
        quantity: 2,
        price: "3500.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 7)!.name,
        standName: mockProducts.find(p => p.id === 7)!.stand.name,
      },

      {
        id: 218,
        orderId: 104,
        productId: 1,
        product: mockProducts.find(p => p.id === 1)!,
        quantity: 2,
        price: "1500.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 1)!.name,
        standName: mockProducts.find(p => p.id === 1)!.stand.name,
      },
      {
        id: 219,
        orderId: 104,
        productId: 5,
        product: mockProducts.find(p => p.id === 5)!,
        quantity: 1,
        price: "6000.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 5)!.name,
        standName: mockProducts.find(p => p.id === 5)!.stand.name,
      },
      {
        id: 220,
        orderId: 104,
        productId: 2,
        product: mockProducts.find(p => p.id === 2)!,
        quantity: 1,
        price: "3000.00",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 2)!.name,
        standName: mockProducts.find(p => p.id === 2)!.stand.name,
      },
    ],
  },
  {
    id: 101,
    userId: 1,
    status: "completed" as OrderStatus,
    total: "10500.00",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
    items: [
      {
        id: 201,
        orderId: 101,
        productId: 2,
        product: mockProducts.find(p => p.id === 2)!,
        quantity: 1,
        price: "3000.00",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 2)!.name,
        standName: mockProducts.find(p => p.id === 2)!.stand.name,
      },
      {
        id: 202,
        orderId: 101,
        productId: 4,
        product: mockProducts.find(p => p.id === 4)!,
        quantity: 1,
        price: "7500.00",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 4)!.name,
        standName: mockProducts.find(p => p.id === 4)!.stand.name,
      },
    ],
  },
  {
    id: 102,
    userId: 1,
    status: "ready" as OrderStatus,
    total: "12499.50",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    items: [
      {
        id: 203,
        orderId: 102,
        productId: 5,
        product: mockProducts.find(p => p.id === 5)!,
        quantity: 2,
        price: "6000.00",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 5)!.name,
        standName: mockProducts.find(p => p.id === 5)!.stand.name,
      },
      {
        id: 204,
        orderId: 102,
        productId: 1,
        product: mockProducts.find(p => p.id === 1)!,
        quantity: 1,
        price: "1500.00",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 1)!.name,
        standName: mockProducts.find(p => p.id === 1)!.stand.name,
      },
    ],
  },
  {
    id: 103,
    userId: 1,
    status: "confirmed" as OrderStatus,
    total: "8500.00",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000),
    items: [
      {
        id: 205,
        orderId: 103,
        productId: 7,
        product: mockProducts.find(p => p.id === 7)!,
        quantity: 1,
        price: "3500.00",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 7)!.name,
        standName: mockProducts.find(p => p.id === 7)!.stand.name,
      },
      {
        id: 206,
        orderId: 103,
        productId: 3,
        product: mockProducts.find(p => p.id === 3)!,
        quantity: 1,
        price: "4500.00",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        productName: mockProducts.find(p => p.id === 3)!.name,
        standName: mockProducts.find(p => p.id === 3)!.stand.name,
      },
    ],
  },
];

export const mockQrCode = {
  code: "fiesta-piamontesa-user1-abcdef123456",
  expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds from now
};

// --- MOCK CART LOGIC (In-memory) ---

// Helper to create flattened cart item
const createCartItem = (product: MockProduct, quantity: number): MockCartItem => {
  const unitPrice = parseFloat(product.price);
  const subtotal = (unitPrice * quantity).toFixed(2);
  return {
    product,
    quantity,
    productId: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    subtotal,
    standName: product.stand.name,
  };
};

let mockCart: MockCartItem[] = [
    createCartItem(mockProducts[1], 1),
    createCartItem(mockProducts[4], 2),
];

export const getMockCart = (): { items: MockCartItem[]; total: string } => {
    const items = [...mockCart];
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
    return { items, total };
};

export const addToMockCart = (productId: number, quantity: number = 1): { items: MockCartItem[]; total: string } => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
        console.error(`Mock product with id ${productId} not found.`);
        return getMockCart();
    }

    const existingItemIndex = mockCart.findIndex(item => item.product.id === productId);

    if (existingItemIndex > -1) {
        mockCart[existingItemIndex].quantity += quantity;
        // Recalculate subtotal
        const unitPrice = parseFloat(mockCart[existingItemIndex].price);
        mockCart[existingItemIndex].subtotal = (unitPrice * mockCart[existingItemIndex].quantity).toFixed(2);
    } else {
        mockCart.push(createCartItem(product, quantity));
    }
    return getMockCart();
};

export const removeFromMockCart = (productId: number, quantity: number = 1): { items: MockCartItem[]; total: string } => {
    const existingItemIndex = mockCart.findIndex(item => item.product.id === productId);

    if (existingItemIndex > -1) {
        mockCart[existingItemIndex].quantity -= quantity;
        if (mockCart[existingItemIndex].quantity <= 0) {
            mockCart.splice(existingItemIndex, 1);
        } else {
            // Recalculate subtotal
            const unitPrice = parseFloat(mockCart[existingItemIndex].price);
            mockCart[existingItemIndex].subtotal = (unitPrice * mockCart[existingItemIndex].quantity).toFixed(2);
        }
    } else {
        console.warn(`Attempted to remove non-existent product ${productId} from mock cart.`);
    }
    return getMockCart();
};

export const clearMockCart = (): { items: MockCartItem[]; total: string } => {
    mockCart = [];
    return { items: [], total: "0.00" };
};
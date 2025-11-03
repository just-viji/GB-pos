
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MenuItem, OrderItem, SoldItems, View, SalesData } from './types';

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: 'Chicken Rice', price: 70, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c08419572b25?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Egg Rice', price: 50, imageUrl: 'https://images.unsplash.com/photo-1608848520899-d55556214312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Chicken Pasta', price: 80, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e326b20f545a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Egg Pasta', price: 60, imageUrl: 'https://images.unsplash.com/photo-1598866594240-a3b5a4562063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Egg Fry', price: 30, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Chicken Gravy', price: 70, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b91c2ceca22d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Chicken Kabab 100g', price: 50, imageUrl: 'https://images.unsplash.com/photo-1603543503808-c82d54374c2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80' },
];

const initialSoldItems: SoldItems = MENU_ITEMS.reduce((acc, item) => {
  acc[item.id] = { name: item.name, count: 0 };
  return acc;
}, {} as SoldItems);

const initialSalesData: SalesData = { totalRevenue: 0 };

// --- Local Storage Helpers ---
const LS_SOLD_ITEMS_KEY = 'fastFoodPosSoldItems';
const LS_SALES_DATA_KEY = 'fastFoodPosSalesData';

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
    }
    return defaultValue;
}

function saveToLocalStorage<T>(key: string, value: T): void {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
}


// --- Helper & UI Components ---

const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const PosIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const RevenueIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a1 1 0 011 1v3.5a1 1 0 01-1 1h-1m-6 0h-1a1 1 0 01-1-1V8.5a1 1 0 011-1h4m6 10v-1h-4a1 1 0 00-1 1v3.5a1 1 0 001 1h1m6 0h1a1 1 0 001-1V15.5a1 1 0 00-1-1h-4m-6-10v-1H8a1 1 0 00-1 1v3.5a1 1 0 001 1h1" />
    </svg>
);

interface HeaderProps {
    activeView: View;
    onToggleView: () => void;
}
const Header: React.FC<HeaderProps> = React.memo(({ activeView, onToggleView }) => (
    <header className="bg-brand-dark shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Fast Food POS</h1>
            <button
                onClick={onToggleView}
                className="flex items-center gap-2 bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-brand-secondary transition-colors duration-200"
                aria-label={activeView === 'pos' ? 'View Sales Report' : 'Return to Point of Sale'}
            >
                {activeView === 'pos' ? <ReportIcon /> : <PosIcon />}
                <span className="hidden sm:inline">{activeView === 'pos' ? 'View Report' : 'Back to POS'}</span>
            </button>
        </div>
    </header>
));

interface MenuItemCardProps {
    item: MenuItem;
    onAddItem: (item: MenuItem) => void;
}
const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({ item, onAddItem }) => (
    <div
        onClick={() => onAddItem(item)}
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 active:scale-100 flex flex-col"
        role="button"
        tabIndex={0}
        aria-label={`Add ${item.name} to order`}
    >
        <div 
            style={{ backgroundImage: `url(${item.imageUrl})` }}
            className="w-full h-32 bg-cover bg-center"
            role="img"
            aria-label={item.name}
        ></div>
        <div className="p-3 flex flex-col flex-grow">
            <h3 className="font-semibold text-gray-800 flex-grow">{item.name}</h3>
            <p className="text-brand-primary font-bold text-lg mt-1">₹{item.price.toFixed(2)}</p>
        </div>
    </div>
));

interface BillProps {
    orderItems: OrderItem[];
    onUpdateQuantity: (itemId: number, change: number) => void;
    onCompleteOrder: () => void;
}
const Bill: React.FC<BillProps> = ({ orderItems, onUpdateQuantity, onCompleteOrder }) => {
    const total = useMemo(() => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [orderItems]);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-brand-light shadow-2xl rounded-t-2xl z-10 flex flex-col" style={{height: '40vh', maxHeight: '350px'}}>
            <div className="px-4 pt-4 pb-2">
                <h2 className="text-xl font-bold text-brand-dark">Current Order</h2>
            </div>
            {orderItems.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    <p>Click on an item to add it to the bill.</p>
                </div>
            ) : (
                <div className="overflow-y-auto px-4 flex-grow">
                    <ul>
                        {orderItems.map((item) => (
                            <li key={item.id} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
                                <span className="text-gray-700 flex-1 truncate pr-2">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-gray-300 rounded-full">
                                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="px-2 py-1 text-lg font-bold text-brand-primary" aria-label={`Decrease quantity of ${item.name}`}>-</button>
                                        <span className="px-2 text-gray-800">{item.quantity}</span>
                                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="px-2 py-1 text-lg font-bold text-brand-primary" aria-label={`Increase quantity of ${item.name}`}>+</button>
                                    </div>
                                    <span className="font-semibold text-gray-800 w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="px-4 py-3 bg-white border-t border-slate-200 rounded-t-lg mt-auto">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-brand-dark">Total:</span>
                    <span className="text-2xl font-extrabold text-brand-primary">₹{total.toFixed(2)}</span>
                </div>
                <button
                    onClick={onCompleteOrder}
                    disabled={orderItems.length === 0}
                    className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Complete Order
                </button>
            </div>
        </div>
    );
};

interface SalesReportProps {
    soldItems: SoldItems;
    salesData: SalesData;
}
const SalesReport: React.FC<SalesReportProps> = ({ soldItems, salesData }) => (
    <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1">
             <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 max-w-sm mx-auto w-full">
                <RevenueIcon />
                <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-brand-dark">₹{salesData.totalRevenue.toFixed(2)}</p>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b pb-2">Items Sold</h2>
            <ul className="space-y-3">
                {/* FIX: Explicitly type `item` as `SoldItems[number]` because Object.values() can return `unknown[]`, causing type errors. */}
                {Object.values(soldItems).map((item: SoldItems[number], index) => (
                    <li key={index} className="flex justify-between items-center p-3 rounded-md odd:bg-slate-50">
                        <span className="text-lg text-gray-700">{item.name}</span>
                        <span className="text-lg font-bold bg-brand-primary text-white rounded-full px-3 py-1">{item.count} sold</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// --- Main Application Component ---

export default function App() {
    const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
    
    // Initialize state from local storage, or with initial values if nothing is stored
    const [soldItems, setSoldItems] = useState<SoldItems>(() =>
        loadFromLocalStorage(LS_SOLD_ITEMS_KEY, initialSoldItems)
    );
    const [salesData, setSalesData] = useState<SalesData>(() =>
        loadFromLocalStorage(LS_SALES_DATA_KEY, initialSalesData)
    );
    
    const [activeView, setActiveView] = useState<View>('pos');

    // Persist state to local storage whenever it changes
    useEffect(() => {
        saveToLocalStorage(LS_SOLD_ITEMS_KEY, soldItems);
    }, [soldItems]);

    useEffect(() => {
        saveToLocalStorage(LS_SALES_DATA_KEY, salesData);
    }, [salesData]);


    const handleAddItemToOrder = useCallback((item: MenuItem) => {
        setCurrentOrder(prevOrder => {
            const existingItem = prevOrder.find(orderItem => orderItem.id === item.id);
            if (existingItem) {
                return prevOrder.map(orderItem =>
                    orderItem.id === item.id
                        ? { ...orderItem, quantity: orderItem.quantity + 1 }
                        : orderItem
                );
            }
            return [...prevOrder, { ...item, quantity: 1 }];
        });
    }, []);
    
    const handleUpdateItemQuantity = useCallback((itemId: number, change: number) => {
        setCurrentOrder(prevOrder => {
            const updatedOrder = prevOrder.map(orderItem => {
                if (orderItem.id === itemId) {
                    return { ...orderItem, quantity: orderItem.quantity + change };
                }
                return orderItem;
            });
            return updatedOrder.filter(orderItem => orderItem.quantity > 0);
        });
    }, []);

    const handleCompleteOrder = useCallback(() => {
        if (currentOrder.length === 0) return;
        const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);

        setSoldItems(prevSoldItems => {
            const newSoldItems = { ...prevSoldItems };
            currentOrder.forEach(orderItem => {
                newSoldItems[orderItem.id] = {
                    ...newSoldItems[orderItem.id],
                    count: newSoldItems[orderItem.id].count + orderItem.quantity,
                };
            });
            return newSoldItems;
        });

        setSalesData(prevData => ({
            totalRevenue: prevData.totalRevenue + total,
        }));
        
        setCurrentOrder([]);
    }, [currentOrder]);

    const toggleView = useCallback(() => {
        setActiveView(prevView => (prevView === 'pos' ? 'report' : 'pos'));
    }, []);

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <Header activeView={activeView} onToggleView={toggleView} />
            <main className="pb-48" style={{paddingBottom: '40vh'}}>
                {activeView === 'pos' ? (
                    <>
                        <div className="container mx-auto p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {MENU_ITEMS.map(item => (
                                    <MenuItemCard key={item.id} item={item} onAddItem={handleAddItemToOrder} />
                                ))}
                            </div>
                        </div>
                        <Bill
                            orderItems={currentOrder}
                            onUpdateQuantity={handleUpdateItemQuantity}
                            onCompleteOrder={handleCompleteOrder}
                        />
                    </>
                ) : (
                    <SalesReport soldItems={soldItems} salesData={salesData} />
                )}
            </main>
        </div>
    );
}

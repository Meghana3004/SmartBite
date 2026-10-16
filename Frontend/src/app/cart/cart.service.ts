// import { Injectable, OnDestroy } from '@angular/core';
// import { BehaviorSubject, Subscription } from 'rxjs';
// import { NotificationService } from '../notification/notification.service';
// import { HttpClient } from '@angular/common/http';

// export interface CartItem {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   isVeg: boolean;
//   vendor: string;
// }

// export interface Order {
//   id: string;
//   items: CartItem[];
//   totalAmount: number;
//   shopId: string;
//   status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
//   orderTime: Date;
//   estimatedTime: number;
//   queuePosition: number;
//   canCancel: boolean;
//   remainingTime: number;
//   vendor: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CartService implements OnDestroy {
//   private cartItems = new BehaviorSubject<CartItem[]>([]);
//   public currentOrders = new BehaviorSubject<Order[]>([]);
//   private apiUrl = 'http://localhost:3001/orders'; // Backend API URL
//   private orderTimers: Map<string, any> = new Map();
//   private cancelTimer: Subscription | null = null;

//   cartItems$ = this.cartItems.asObservable();
//   currentOrders$ = this.currentOrders.asObservable();

//   constructor(private notificationService: NotificationService, private http: HttpClient) {
//     // Load cart items from localStorage
//     const savedCart = localStorage.getItem('cartItems');
//     if (savedCart) {
//       this.cartItems.next(JSON.parse(savedCart));
//     }

//     // Load orders from localStorage
//     const savedOrders = localStorage.getItem('currentOrders');
//     if (savedOrders) {
//       const orders = JSON.parse(savedOrders).map((order: Order) => ({
//         ...order,
//         orderTime: new Date(order.orderTime),
//       }));
//       this.currentOrders.next(orders);

//       // Start cancel timers for orders that can be canceled
//       orders.forEach((order: Order) => {
//         if (order.canCancel) {
//           this.startCancelTimer(order);
//         }
//       });
//     }
//   }

//   // Add an item to the cart
//   addToCart(item: Omit<CartItem, 'quantity'>): void {
//     const currentItems = this.cartItems.value;
//     const existingItemIndex = currentItems.findIndex((cartItem) => cartItem.id === item.id);

//     if (existingItemIndex > -1) {
//       currentItems[existingItemIndex].quantity += 1;
//     } else {
//       currentItems.push({ ...item, quantity: 1 });
//     }

//     this.cartItems.next([...currentItems]);
//     this.saveCartToStorage();
//   }

//   // Remove an item from the cart
//   removeFromCart(itemId: string): void {
//     const currentItems = this.cartItems.value.filter((item) => item.id !== itemId);
//     this.cartItems.next([...currentItems]);
//     this.saveCartToStorage();
//   }

//   // Update the quantity of an item in the cart
//   updateQuantity(itemId: string, quantity: number): void {
//     if (quantity <= 0) {
//       this.removeFromCart(itemId);
//       return;
//     }

//     const currentItems = this.cartItems.value;
//     const itemIndex = currentItems.findIndex((item) => item.id === itemId);

//     if (itemIndex > -1) {
//       currentItems[itemIndex].quantity = quantity;
//       this.cartItems.next([...currentItems]);
//       this.saveCartToStorage();
//     }
//   }

//   // Clear the cart
//   clearCart(): void {
//     this.cartItems.next([]);
//     localStorage.removeItem('cartItems');
//   }

//   // Get the total price of items in the cart
//   getCartTotal(): number {
//     return this.cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
//   }

//   // Get the total number of items in the cart
//   getItemCount(): number {
//     return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
//   }

//   // Create an order and send it to the backend
//   createOrder(): void {
//     const items = this.cartItems.value;
//     if (items.length === 0) return;

//     const orderPayload = {
//       items: items.map((item) => ({
//         menu_item_id: item.id,
//         quantity: item.quantity,
//         price: item.price,
//       })),
//     };

//     this.http.post<Order>(this.apiUrl, orderPayload).subscribe(
//       (order) => {
//         this.currentOrders.next([...this.currentOrders.value, order]);
//         this.clearCart();
//         this.notificationService.addOrderConfirmedNotification(order.id, order.shopId);
//       },
//       (error) => {
//         console.error('Failed to create order:', error);
//       }
//     );
//   }

//   // Cancel an order
//   cancelOrder(orderId: string): void {
//     this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, { status: 'cancelled' }).subscribe(
//       (updatedOrder) => {
//         const updatedOrders = this.currentOrders.value.map((order) =>
//           order.id === updatedOrder.id ? updatedOrder : order
//         );
//         this.currentOrders.next(updatedOrders);
//         this.notificationService.addOrderCancelledNotification(updatedOrder.id, updatedOrder.shopId);
//       },
//       (error) => {
//         console.error('Failed to cancel order:', error);
//       }
//     );
//   }

//   // Start a timer for canceling an order
//   private startCancelTimer(order: Order): void {
//     const interval = setInterval(() => {
//       const updatedOrders = this.currentOrders.value.map((o) => {
//         if (o.id === order.id) {
//           if (o.remainingTime > 0) {
//             return { ...o, remainingTime: o.remainingTime - 1 };
//           } else {
//             clearInterval(interval);
//             return { ...o, canCancel: false };
//           }
//         }
//         return o;
//       });

//       this.currentOrders.next(updatedOrders);
//       this.saveOrdersToStorage(updatedOrders);
//     }, 1000);
//   }

//   // Save cart items to localStorage
//   private saveCartToStorage(): void {
//     localStorage.setItem('cartItems', JSON.stringify(this.cartItems.value));
//   }

//   // Save orders to localStorage
//   public saveOrdersToStorage(orders: Order[]): void {
//     localStorage.setItem('currentOrders', JSON.stringify(orders));
//   }

//   // Cleanup timers on service destruction
//   ngOnDestroy(): void {
//     this.orderTimers.forEach((timer) => clearTimeout(timer));
//     this.orderTimers.clear();

//     if (this.cancelTimer) {
//       this.cancelTimer.unsubscribe();
//     }
//   }
// }

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { NotificationService } from '../notification/notification.service';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
  vendor: string;

}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  shopId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  orderTime: Date;
  estimatedTime: number; // in minutes
  queuePosition: number;
  canCancel: boolean;
  remainingTime: number; // Optional, for displaying remaining time
  vendor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public currentOrders = new BehaviorSubject<Order[]>([]);
  private cancelTimer: Subscription | null = null;
  private orderTimers: Map<string, any> = new Map();

  cartItems$ = this.cartItems.asObservable();
  currentOrders$ = this.currentOrders.asObservable();

  constructor(private notificationService: NotificationService) {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }

    // Load current order from localStorage if available
    const savedOrders = localStorage.getItem('currentOrders');
    if (savedOrders) {
    const orders = JSON.parse(savedOrders);
    
    // Ensure it's an array and convert orderTime strings back to Date objects
    const ordersArray = Array.isArray(orders) ? orders : [orders];
    const processedOrders = ordersArray.map(order => ({
      ...order,
      orderTime: new Date(order.orderTime)
    }));
    
    this.currentOrders.next(processedOrders);
    
    // Start cancel timer for each order that can be cancelled
    processedOrders.forEach(order => {
      if (order.canCancel) {
        this.startCancelTimer(order);
      }
    });
  }
}

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex > -1) {
      // Item exists, increment quantity
      currentItems[existingItemIndex].quantity += 1;
    } else {
      // New item, add to cart
      currentItems.push({ ...item, quantity: 1 });
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
  }

  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      if (currentItems[itemIndex].quantity > 1) {
        currentItems[itemIndex].quantity -= 1;
      } else {
        currentItems.splice(itemIndex, 1);
      }
    }

    this.cartItems.next([...currentItems]);
    this.saveCartToStorage();
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(item => item.id === itemId);

    if (itemIndex > -1) {
      currentItems[itemIndex].quantity = quantity;
      this.cartItems.next([...currentItems]);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem('cartItems');
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.cartItems.value.reduce((count, item) => count + item.quantity, 0);
  }

  createOrders(): void {
  const items = this.cartItems.value;
  if (items.length === 0) return;

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    acc[item.vendor] = acc[item.vendor] || [];
    acc[item.vendor].push(item);
    return acc;
  }, {} as { [vendor: string]: CartItem[] });

  const orders: Order[] = [];

    for (const vendor in itemsByVendor) {
    const vendorItems = itemsByVendor[vendor];
    const order: Order = {
      id: this.generateOrderId(vendor),
      items: vendorItems,
      totalAmount: vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shopId: vendor,
      status: 'in_progress',
      orderTime: new Date(),
      estimatedTime: 12, 
      queuePosition: 3,
      canCancel: true,
      remainingTime: 60 ,
      vendor: vendor,
    };
    orders.push(order);
    this.startCancelTimer(order);

    this.scheduleOrderNotifications(order);
  }

  this.currentOrders.next(orders); 
  this.clearCart();
  this.saveOrdersToStorage(orders);
}

private scheduleOrderNotifications(order: Order): void {
  // Immediate notification: Order confirmed
  this.notificationService.addOrderConfirmedNotification(order.id, order.shopId);
  
  // Schedule notification after 90 seconds: Order ready
  const readyTimer = setTimeout(() => {
    // Check if order still exists and wasn't cancelled
    const currentOrders = this.currentOrders.value;
    const orderStillExists = currentOrders.find(o => o.id === order.id);
    
    if (orderStillExists) {
      this.notificationService.addOrderReadyNotification(order.id, order.shopId);
      
      // Update order status to completed
      const updatedOrders = currentOrders.map(o => 
        o.id === order.id ? { ...o, status: 'completed' as const } : o
      );
      this.currentOrders.next(updatedOrders);
      this.saveOrdersToStorage(updatedOrders);
    }
    
    // Clean up timer
    this.orderTimers.delete(order.id);
  }, 90000); // 90 seconds

  // Store timer reference for cleanup
  this.orderTimers.set(order.id, readyTimer);
}

cancelOrder(orderId: string): void {
  console.log("cancelOrder called");
  const orders = this.currentOrders.value;
  const cancelledOrders = orders.filter(order => order.canCancel);
  const updatedOrders = orders.filter(order => !order.canCancel);
  
  cancelledOrders.forEach(order => {
    console.log(`Cancelling order: ${order.id}`);
    this.notificationService.addOrderCancelledNotification(order.id, order.shopId);
  });

  // Clean up timers for cancelled orders
  cancelledOrders.forEach(order => {
    const timer = this.orderTimers.get(order.id);
    if (timer) {
      clearTimeout(timer);
      this.orderTimers.delete(order.id);
    }
  });
  
  this.currentOrders.next(updatedOrders);
  this.saveOrdersToStorage(updatedOrders);
  
  if (this.cancelTimer) {
    this.cancelTimer.unsubscribe();
    this.cancelTimer = null;
  }
}

private startCancelTimer(order: Order): void {
  const interval = setInterval(() => {
    const currentOrders = this.currentOrders.value;

    // Find and update the specific order
    const updatedOrders = currentOrders.map(o => {
      if (o.id === order.id) {
        if (o.remainingTime > 0) {
          return { ...o, remainingTime: o.remainingTime - 1 }; // Decrement remainingTime
        } else {
          clearInterval(interval); // Stop the timer when time runs out
          return { ...o, canCancel: false }; // Disable cancellation
        }
      }
      return o; // Keep other orders unchanged
    });

    // Emit the updated orders array
    this.currentOrders.next(updatedOrders);

    // Save updated orders to storage
    this.saveOrdersToStorage(updatedOrders);
  }, 1000); // Update every second
}

  private generateOrderId(vendor: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const orderNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const words = vendor.trim().split(/\s+/);
    const firstLetter = words[0]?.[0]?.toUpperCase() || '';
    const secondLetter = words[1]?.[0]?.toUpperCase() || '';

    return `${firstLetter}${secondLetter}${year}-${orderNumber}`;
}


  private saveCartToStorage(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems.value));
  }

  public saveOrdersToStorage(orders: Order[]): void {
    localStorage.setItem('currentOrders', JSON.stringify(orders));
  }

  ngOnDestroy(): void {
    this.orderTimers.forEach(timer => clearTimeout(timer));
    this.orderTimers.clear();
    
    if (this.cancelTimer) {
      this.cancelTimer.unsubscribe();
    }
  }
}
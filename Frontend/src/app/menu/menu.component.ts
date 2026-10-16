import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartItem, CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MenuService, MenuItem, ShopDetails } from './menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  shopId: number = 0;
  vendor: string = '';
  menuItems: MenuItem[] = [];
  cartItems: CartItem[] = [];
  shopDetails: ShopDetails | null = null;
  searchTerm: string = '';
  activeFilter: 'all' | 'veg' | 'non-veg' | 'bestseller' = 'all';
  private cartSubscription: Subscription | null = null;

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    // Get vendor from route params and load menu items
    this.route.params.subscribe(params => {
      this.shopId = +params['shopId'];
      this.loadMenuItems();
      this.loadShopDetails();
    });
  }

  loadMenuItems(): void {
    // Fetch menu items from the service and filter by vendor
    this.menuService.getMenu().subscribe(items => {
      this.menuItems = items.filter(item => item.shop_id === this.shopId);
    });
  }

    loadShopDetails(): void {
    // Fetch shop details from the service
    this.menuService.getShopDetails(this.shopId).subscribe(details => {
      this.shopDetails = details;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from cart updates
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  addToCart(item: MenuItem): void {
    // Add item to the cart
    this.cartService.addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image: item.image_url,
      isVeg: !!item.isVeg,
      vendor: item.vendor,
    });
  }

  incrementQuantity(itemId: number): void {
    const cartItem = this.cartItems.find(item => item.id === itemId.toString());
    if (cartItem) {
      this.cartService.updateQuantity(itemId.toString(), cartItem.quantity + 1);
    }
  }

  decrementQuantity(itemId: number): void {
    const cartItem = this.cartItems.find(item => item.id === itemId.toString());
    if (cartItem) {
      this.cartService.updateQuantity(itemId.toString(), cartItem.quantity - 1);
    }
  }

  getItemQuantity(itemId: number): number {
    const cartItem = this.cartItems.find(item => item.id === itemId.toString());
    return cartItem ? cartItem.quantity : 0;
  }

  isItemInCart(itemId: number): boolean {
    return this.cartItems.some(item => item.id === itemId.toString());
  }

  setFilter(filter: 'all' | 'veg' | 'non-veg' | 'bestseller'): void {
    this.activeFilter = filter;
  }

  getFilteredItems(): MenuItem[] {
    let filtered = this.menuItems;

    // Apply search filter
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (this.activeFilter) {
      case 'veg':
        filtered = filtered.filter(item => item.isVeg);
        break;
      case 'non-veg':
        filtered = filtered.filter(item => !item.isVeg);
        break;
      case 'bestseller':
        filtered = filtered.filter(item => item.rating >= 4.2);
        break;
    }

    return filtered;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  generateStars(rating: number): number[] {
    return Array.from({ length: Math.floor(rating) }, (_, i) => i);
  }
}
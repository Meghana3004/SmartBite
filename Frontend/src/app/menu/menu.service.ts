
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id: number;
  shop_id: number;
  name: string;
  vendor: string;
  description: string;
  price: number;
  image_url: string;
  isVeg: number;
  rating: number;
  reviewCount: number;
  Customizable: number;
}

export interface ShopDetails {
  shopId: number;
  vendor: string;
  ratings: string;
  avgPrice: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenu(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>('/api/menu');
  }

    getShopDetails(shopId: number): Observable<ShopDetails> {
    return this.http.get<ShopDetails>(`/api/shops/${shopId}`);
  }
}
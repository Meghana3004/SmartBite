import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shop {
  id: number;
  name: string;
  description: string;
  address: string;
  rating: number;
  avgPrice: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ShopsService {
  constructor(private http: HttpClient) {}

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>('/api/shops');
  }
}
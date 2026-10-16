import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShopsService, Shop } from './shops.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})
export class ShopsComponent implements OnInit {
  shops: Shop[] = [];

  constructor(private router: Router, private shopsService: ShopsService) {}

  ngOnInit(): void {
    this.shopsService.getShops().subscribe(data => {
      this.shops = data;
      console.log('Fetched shops:', this.shops);
    });
  }

  navigateToMenu(shop: Shop): void {
    this.router.navigate(['/menu', shop.id]);
  }
}
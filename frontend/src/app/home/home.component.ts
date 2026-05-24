import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .hero { background: #212529; color: #fff; padding: 64px 0; }
    .hero-title { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
    .hero-sub { font-size: 16px; color: #adb5bd; margin-bottom: 28px; }
    .hero-btn { padding: 12px 28px; background: #fff; color: #212529; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-right: 12px; }
    .hero-btn:hover { background: #f3f4f6; }
    .hero-btn-outline { padding: 12px 28px; background: transparent; color: #fff; border: 1px solid #6b7280; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .hero-btn-outline:hover { background: rgba(255,255,255,0.05); }
    .section { padding: 48px 0; }
    .section-title { font-size: 18px; font-weight: 600; color: #212529; margin-bottom: 20px; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .product-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; }
    .product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .product-thumb { height: 160px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .product-thumb-icon { font-size: 3rem; color: #d1d5db; }
    .product-info { padding: 12px; }
    .product-name { font-size: 13px; font-weight: 600; color: #212529; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .product-desc { font-size: 11px; color: #6c757d; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .product-price { font-size: 15px; font-weight: 700; color: #0d6efd; margin-top: 6px; }
    .product-btn { width: 100%; margin-top: 8px; padding: 7px; font-size: 12px; font-weight: 600; background: #212529; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    .product-btn:hover { background: #374151; }
    .banner-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 40px; }
    .banner-card { border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 6px; }
    .banner-icon { font-size: 24px; margin-bottom: 4px; }
    .banner-title { font-size: 14px; font-weight: 600; }
    .banner-sub { font-size: 12px; opacity: 0.8; }
  `],
  template: `
    <div class="hero">
      <div class="container">
        <div class="hero-title">ยินดีต้อนรับสู่ MyStore</div>
        <div class="hero-sub">สินค้าคุณภาพ ราคาดี จัดส่งรวดเร็ว</div>
        <button class="hero-btn" (click)="goLogin()">เข้าสู่ระบบ / สมัครสมาชิก</button>
      </div>
    </div>

    <div class="container">
      <div class="section">
        <div class="banner-grid">
          <div class="banner-card" style="background:#eff6ff;">
            <div class="banner-icon">🚚</div>
            <div class="banner-title" style="color:#1e40af;">จัดส่งฟรี</div>
            <div class="banner-sub" style="color:#3b82f6;">เมื่อซื้อครบ ฿500</div>
          </div>
          <div class="banner-card" style="background:#f0fdf4;">
            <div class="banner-icon">🔒</div>
            <div class="banner-title" style="color:#166534;">ปลอดภัย 100%</div>
            <div class="banner-sub" style="color:#16a34a;">ชำระเงินผ่านระบบที่เชื่อถือได้</div>
          </div>
          <div class="banner-card" style="background:#fff7ed;">
            <div class="banner-icon">↩️</div>
            <div class="banner-title" style="color:#9a3412;">คืนสินค้าได้</div>
            <div class="banner-sub" style="color:#ea580c;">ภายใน 7 วัน ไม่มีคำถาม</div>
          </div>
        </div>

        <div class="section-title">สินค้าแนะนำ</div>
        <div *ngIf="products.length === 0" style="color:#6c757d; font-size:14px;">กำลังโหลดสินค้า...</div>
        <div class="product-grid">
          <div class="product-card" *ngFor="let p of products" (click)="goLogin()">
            <div class="product-thumb">
              <img *ngIf="p.image_url" [src]="p.image_url" [alt]="p.name" />
              <div *ngIf="!p.image_url" class="product-thumb-icon">📦</div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ p.name }}</div>
              <div class="product-desc">{{ p.description || '-' }}</div>
              <div class="product-price">฿{{ p.price }}</div>
              <button class="product-btn" (click)="goLogin(); $event.stopPropagation()">
                หยิบใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  products: any[] = [];

  ngOnInit(): void {
    this.http.get<any>('http://localhost/exam/backend/api/products.php').subscribe({
      next: (res) => this.products = res.products ?? res ?? [],
      error: () => this.products = [],
    });
  }

  goLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
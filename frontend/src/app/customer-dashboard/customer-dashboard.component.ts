import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 20px; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .stat-card { background: #f8f9fa; border-radius: 8px; padding: 14px; text-align: center; }
    .stat-label { font-size: 11px; color: #6c757d; margin-bottom: 4px; }
    .stat-num { font-size: 22px; font-weight: 600; }
    .panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .panel-header { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; color: #212529; }
    .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
    .order-row:last-child { border-bottom: none; }
    .order-num { font-size: 13px; font-weight: 600; }
    .order-date { font-size: 11px; color: #6c757d; }
    .order-right { display: flex; align-items: center; gap: 12px; }
    .order-amount { font-size: 13px; font-weight: 600; }
    .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-paid { background: #d1e7dd; color: #0a3622; }
    .badge-shipped { background: #cfe2ff; color: #084298; }
    .badge-delivered { background: #e2e3e5; color: #41464b; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .panel-body { padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
    .coupon-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8f9fa; border-radius: 8px; }
    .coupon-code { font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
    .coupon-exp { font-size: 11px; color: #6c757d; }
    .coupon-badge { font-size: 13px; font-weight: 600; padding: 4px 10px; background: #d1e7dd; color: #0a3622; border-radius: 20px; }
    .product-grid { padding: 8px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .product-item { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    .product-thumb { height: 80px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .product-thumb-icon { font-size: 2rem; color: #adb5bd; }
    .product-info { padding: 8px; }
    .product-name { font-size: 11px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .product-price { font-size: 12px; color: #0d6efd; margin-top: 2px; font-weight: 600; }
    .product-btn { width: 100%; margin-top: 6px; padding: 6px; font-size: 11px; font-weight: 600; background: #212529; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    .product-btn:hover { background: #374151; }
  `],
  template: `
    <div class="container py-4">
      <div class="dashboard">

        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div style="font-size:18px; font-weight:600;">สวัสดีคุณ {{ user?.username }}</div>
            <div style="font-size:13px; color:#6c757d;">Member</div>
          </div>
          <div class="avatar" style="width:40px;height:40px;border-radius:50%;background:#e6f1fb;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;color:#185fa5;">
            {{ user?.username?.charAt(0)?.toUpperCase() }}
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card" *ngFor="let s of statusCards">
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-num">{{ s.count }}</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <i class="bi bi-receipt"></i> Recent Orders
          </div>
          <div *ngIf="recentOrders.length === 0" class="p-3 text-muted" style="font-size:13px;">ไม่มีคำสั่งซื้อ</div>
          <div *ngFor="let o of recentOrders" class="order-row">
            <div>
              <div class="order-num">{{ o.order_number }}</div>
              <div class="order-date">{{ o.created_at }}</div>
            </div>
            <div class="order-right">
              <span class="order-amount">฿{{ o.total_amount }}</span>
              <span class="badge" [ngClass]="{
                'badge-pending': o.status === 'pending',
                'badge-paid': o.status === 'paid',
                'badge-shipped': o.status === 'shipped',
                'badge-delivered': o.status === 'delivered'
              }">{{ o.status }}</span>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="panel">
            <div class="panel-header"><i class="bi bi-ticket-perforated"></i> My Coupons</div>
            <div class="panel-body">
              <div *ngIf="coupons.length === 0" class="text-muted p-2" style="font-size:13px;">ไม่มีคูปอง</div>
              <div class="coupon-item" *ngFor="let c of coupons">
                <div>
                  <div class="coupon-code">{{ c.code }}</div>
                  <div class="coupon-exp">หมดอายุ: {{ c.expires_at }}</div>
                </div>
                <div class="coupon-badge">{{ c.discount_percent }}%</div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><i class="bi bi-bag"></i> Products</div>
            <div class="product-grid">
              <div *ngIf="recommended.length === 0" class="text-muted p-2" style="font-size:13px;">ไม่มีสินค้า</div>
              <div class="product-item" *ngFor="let p of recommended">
                <div class="product-thumb">
                  <img *ngIf="p.image_url" [src]="p.image_url" [alt]="p.name" />
                  <div *ngIf="!p.image_url" class="product-thumb-icon">📦</div>
                </div>
                <div class="product-info">
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-price">฿{{ p.price }}</div>
                  <button class="product-btn" (click)="addToCart(p)">🛒 ซื้อเลย</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class CustomerDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  user = this.auth.getCurrentUser();
  statusCounts: any = {};
  recentOrders: any[] = [];
  coupons: any[] = [];
  recommended: any[] = [];
  statusCards: { label: string; count: number }[] = [];

  ngOnInit(): void {
    if (!this.user) return;
    this.api.customerDashboard(this.user.username).subscribe({
      next: (res) => {
        this.statusCounts = res.status_counts ?? {};
        this.recentOrders = res.recent_orders ?? [];
        this.coupons = res.coupons ?? [];
        this.recommended = res.recommended ?? [];
        this.statusCards = [
          { label: 'Pending', count: this.statusCounts['pending'] ?? 0 },
          { label: 'Paid', count: this.statusCounts['paid'] ?? 0 },
          { label: 'Shipped', count: this.statusCounts['shipped'] ?? 0 },
          { label: 'Delivered', count: this.statusCounts['delivered'] ?? 0 },
        ];
      },
      error: () => {
        this.recentOrders = [];
        this.coupons = [];
        this.recommended = [];
      },
    });
  }

  addToCart(product: any): void {
    alert(`เพิ่ม "${product.name}" ในตะกร้าแล้ว`);
  }
}
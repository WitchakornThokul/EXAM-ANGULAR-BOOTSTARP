import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-admin-dashboard',
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
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
    .order-row:last-child { border-bottom: none; }
    .order-num { font-size: 13px; font-weight: 600; }
    .order-meta { font-size: 11px; color: #6c757d; }
    .order-right { display: flex; align-items: center; gap: 10px; }
    .order-amount { font-size: 13px; font-weight: 600; }
    .badge { font-size: 11px; padding: 3px 8px; border-radius: 20px; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-paid { background: #d1e7dd; color: #0a3622; }
    .badge-shipped { background: #cfe2ff; color: #084298; }
    .review-row { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
    .review-row:last-child { border-bottom: none; }
    .review-product { font-size: 13px; font-weight: 600; }
    .review-comment { font-size: 12px; color: #6c757d; margin-top: 2px; }
    .stars { color: #f59e0b; font-size: 12px; }
    .manage-btn { font-size: 11px; padding: 3px 10px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; color: #374151; }
    .manage-btn:hover { background: #f3f4f6; }
  `],
  template: `
    <div class="container py-4">
      <div class="dashboard">

        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div style="font-size:18px; font-weight:600;">Admin Dashboard</div>
            <div style="font-size:13px; color:#6c757d;">ภาพรวมระบบ</div>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card" *ngFor="let k of kpis">
            <div class="stat-label">{{ k.label }}</div>
            <div class="stat-num" [style.color]="k.color ?? '#212529'">{{ k.value }}</div>
          </div>
        </div>

        <div class="two-col">

          <div class="panel">
            <div class="panel-header">
              <i class="bi bi-exclamation-circle"></i> Action Required
            </div>
            <div *ngIf="actionOrders.length === 0" class="p-3 text-muted" style="font-size:13px;">ไม่มีคำสั่งซื้อที่รอดำเนินการ</div>
            <div *ngFor="let o of actionOrders" class="order-row">
              <div>
                <div class="order-num">{{ o.order_number }}</div>
                <div class="order-meta">User #{{ o.user_id }}</div>
              </div>
              <div class="order-right">
                <span class="order-amount">฿{{ o.total_amount }}</span>
                <span class="badge" [ngClass]="{
                  'badge-pending': o.status === 'pending',
                  'badge-paid': o.status === 'paid',
                  'badge-shipped': o.status === 'shipped'
                }">{{ o.status }}</span>
                <button class="manage-btn">จัดการ</button>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <i class="bi bi-star"></i> Recent Reviews
            </div>
            <div *ngIf="recentReviews.length === 0" class="p-3 text-muted" style="font-size:13px;">ยังไม่มีรีวิว</div>
            <div *ngFor="let r of recentReviews" class="review-row">
              <div class="d-flex align-items-center justify-content-between">
                <div class="review-product">{{ r.product_name }}</div>
                <div class="stars">
                  <span *ngFor="let s of getStars(r.rating)">★</span>
                  <span style="color:#e5e7eb;" *ngFor="let s of getEmptyStars(r.rating)">★</span>
                </div>
              </div>
              <div class="review-comment">{{ r.comment }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  kpis: { label: string; value: any; color?: string }[] = [];
  actionOrders: any[] = [];
  recentReviews: any[] = [];

  ngOnInit(): void {
    this.api.adminStats().subscribe({
      next: (res) => {
        const k = res.kpis ?? {};
        this.kpis = [
          { label: 'ยอดขายเดือนนี้', value: '฿' + (k.total_sales_month ?? 0).toLocaleString(), color: '#0d6efd' },
          { label: 'คำสั่งซื้อใหม่', value: k.new_orders ?? 0, color: '#f59e0b' },
          { label: 'ลูกค้าทั้งหมด', value: k.total_customers ?? 0 },
          { label: 'สินค้าใกล้หมด', value: k.low_stock ?? 0, color: '#dc3545' },
        ];
        this.actionOrders = res.action_orders ?? [];
        this.recentReviews = res.recent_reviews ?? [];
      }
    });
  }

  getStars(rating: number): any[] {
    return Array(Math.min(rating, 5)).fill(0);
  }

  getEmptyStars(rating: number): any[] {
    return Array(Math.max(5 - rating, 0)).fill(0);
  }
}
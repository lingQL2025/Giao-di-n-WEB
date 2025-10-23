import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Promotion {
  _id: { $oid: string };
  promotion_id: number;
  promotion_name: string;
  description: string;
  promotion_type: string;
  promotion_value: number;
  start_date: string;
  end_date: string;
  quantity: number;
  condition_applied: string | number;
  status: boolean;
}

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.css']
})
export class PromotionListComponent implements OnInit {
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';

  constructor() {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    // Simulate loading data from promotions.json
    // In a real application, this would be an HTTP service call
    this.promotions = [
      {
        "_id": { "$oid": "68f4a5d251cca1ac78b3aa74" },
        "promotion_id": 301,
        "promotion_name": "Discount10",
        "description": "Giảm giá 10% cho tất cả các đơn hàng",
        "promotion_type": "Discount",
        "promotion_value": 10,
        "start_date": "2025-10-01",
        "end_date": "2025-10-11",
        "quantity": 100,
        "condition_applied": "NaN",
        "status": true
      },
      {
        "_id": { "$oid": "68f4a5d251cca1ac78b3aa75" },
        "promotion_id": 302,
        "promotion_name": "VIP20",
        "description": "Giảm giá 20% cho người dùng VIP",
        "promotion_type": "Discount",
        "promotion_value": 20,
        "start_date": "2025-10-02",
        "end_date": "2025-10-12",
        "quantity": 50,
        "condition_applied": "VIP only",
        "status": true
      },
      {
        "_id": { "$oid": "68f4a5d251cca1ac78b3aa76" },
        "promotion_id": 303,
        "promotion_name": "Bundle5",
        "description": "Mua 5 tặng 1",
        "promotion_type": "Bundle",
        "promotion_value": 0,
        "start_date": "2025-10-03",
        "end_date": "2025-10-15",
        "quantity": 30,
        "condition_applied": "Buy 5 items",
        "status": true
      },
      {
        "_id": { "$oid": "68f4a5d251cca1ac78b3aa77" },
        "promotion_id": 304,
        "promotion_name": "FlashSale20",
        "description": "Giảm giá 20% trong đợt bán hàng chớp nhoáng",
        "promotion_type": "Discount",
        "promotion_value": 20,
        "start_date": "2025-10-04",
        "end_date": "2025-10-20",
        "quantity": 20,
        "condition_applied": "First come first serve",
        "status": true
      },
      {
        "_id": { "$oid": "68f4a5d251cca1ac78b3aa78" },
        "promotion_id": 305,
        "promotion_name": "FreeShip",
        "description": "Miễn phí vận chuyển",
        "promotion_type": "Shipping",
        "promotion_value": 0,
        "start_date": "2025-10-05",
        "end_date": "2025-10-25",
        "quantity": 200,
        "condition_applied": "All users",
        "status": true
      }
    ];
    this.filteredPromotions = [...this.promotions];
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPromotions = this.promotions.filter(promotion => {
      const matchesSearch = promotion.promotion_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           promotion.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (this.statusFilter === 'active') {
        matchesStatus = promotion.status && this.isPromotionActive(promotion);
      } else if (this.statusFilter === 'expired') {
        matchesStatus = !this.isPromotionActive(promotion);
      }

      return matchesSearch && matchesStatus;
    });
  }

  isPromotionActive(promotion: Promotion): boolean {
    const today = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    return promotion.status && today >= startDate && today <= endDate;
  }

  getStatusBadgeClass(promotion: Promotion): string {
    return this.isPromotionActive(promotion) ? 'status-active' : 'status-expired';
  }

  getStatusText(promotion: Promotion): string {
    return this.isPromotionActive(promotion) ? 'Đang hoạt động' : 'Hết hạn';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  onEdit(promotion: Promotion): void {
    // Navigate to edit form
    console.log('Edit promotion:', promotion.promotion_id);
  }

  onDelete(promotion: Promotion): void {
    if (confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      // Delete logic here
      console.log('Delete promotion:', promotion.promotion_id);
    }
  }
}


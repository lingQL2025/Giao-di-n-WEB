import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface PromotionItem {
  id: number;
  code: string;
  name: string;
  usedCount: number;
  maxUsage: number;
  status: 'active' | 'upcoming' | 'ended';
  statusText: string;
  statusClass: string;
  startDate: string;
  endDate: string;
  selected?: boolean;
}

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotion.html',
  styleUrls: ['./promotion.css']
})
export class PromotionComponent implements OnInit {
  promotions: PromotionItem[] = [];
  filteredPromotions: PromotionItem[] = [];
  searchQuery: string = '';
  showNewPromotionModal: boolean = false;
  
  newPromotion = {
    code: '',
    name: '',
    maxUsage: 20,
    startDate: '',
    endDate: '',
    type: 'percentage',
    group: '',
    description: '',
    productScope: 'all',
    products: '',
    condition: 'none',
    conditionValue: '',
    usageLimitType: 'limited'
  };

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    const jsonFilePath = 'data/promotions.json';

    this.http.get<any[]>(jsonFilePath).subscribe(
      (data) => {
        this.promotions = data.map((item) => ({
          id: item.promotion_id,
          code: item.promotion_name,
          name: item.description,
          usedCount: 0,
          maxUsage: item.quantity,
          status: this.getPromotionStatus(item.start_date, item.end_date),
          statusText: this.getStatusText(item.start_date, item.end_date),
          statusClass: this.getStatusClass(item.start_date, item.end_date),
          startDate: this.formatDate(item.start_date),
          endDate: this.formatDate(item.end_date),
          selected: false
        }));
        this.savePromotions();
        this.filterPromotions();
      },
      (error) => {
        console.log('Error loading promotions.json:', error);
        this.promotions = this.getSamplePromotions();
        this.savePromotions();
        this.filterPromotions();
      }
    );
}

getPromotionStatus(startDate: string, endDate: string): 'active' | 'upcoming' | 'ended' {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start <= today && end >= today) return 'active';
  if (start > today) return 'upcoming';
  return 'ended';
}

getStatusText(startDate: string, endDate: string): string {
  const status = this.getPromotionStatus(startDate, endDate);
  if (status === 'active') return 'Đang diễn ra';
  if (status === 'upcoming') return 'Sắp diễn ra';
  return 'Đã kết thúc';
}

getStatusClass(startDate: string, endDate: string): string {
  const status = this.getPromotionStatus(startDate, endDate);
  return status;
}

  savePromotions() {
    localStorage.setItem('promotions', JSON.stringify(this.promotions));
  }

  filterPromotions() {
    this.filteredPromotions = this.promotions.filter(promo => {
      const matchesSearch = promo.code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          promo.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesSearch;
    });

    this.totalPages = Math.ceil(this.filteredPromotions.length / this.itemsPerPage);
  }

  getPromotionsByStatus(status: string): PromotionItem[] {
    if (status === 'active') {
      return this.promotions.filter(p => p.status === 'active');
    } else if (status === 'upcoming') {
      return this.promotions.filter(p => p.status === 'upcoming');
    } else if (status === 'ended') {
      return this.promotions.filter(p => p.status === 'ended');
    }
    return [];
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.filteredPromotions.forEach(promo => promo.selected = checked);
  }

  openNewPromotionModal() {
    this.showNewPromotionModal = true;
    this.newPromotion = {
      code: '',
      name: '',
      maxUsage: 20,
      startDate: '',
      endDate: '',
      type: 'percentage',
      group: '',
      description: '',
      productScope: 'all',
      products: '',
      condition: 'none',
      conditionValue: '',
      usageLimitType: 'limited'
    };
  }

  closeNewPromotionModal() {
    this.showNewPromotionModal = false;
  }

  createNewPromotion() {
    if (!this.newPromotion.code || !this.newPromotion.name || !this.newPromotion.startDate || !this.newPromotion.endDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const today = new Date();
    const startDate = new Date(this.newPromotion.startDate);
    const endDate = new Date(this.newPromotion.endDate);
    
    let status: 'active' | 'upcoming' | 'ended' = 'upcoming';
    let statusText = 'Sắp diễn ra';
    let statusClass = 'upcoming';

    if (startDate <= today && endDate >= today) {
      status = 'active';
      statusText = 'Đang diễn ra';
      statusClass = 'active';
    } else if (endDate < today) {
      status = 'ended';
      statusText = 'Đã kết thúc';
      statusClass = 'ended';
    }

    const maxUsage = this.newPromotion.usageLimitType === 'unlimited' ? 999999 : this.newPromotion.maxUsage;

    const newItem: PromotionItem = {
      id: Date.now(),
      code: this.newPromotion.code,
      name: this.newPromotion.name,
      usedCount: 0,
      maxUsage: maxUsage,
      status: status,
      statusText: statusText,
      statusClass: statusClass,
      startDate: this.formatDate(this.newPromotion.startDate),
      endDate: this.formatDate(this.newPromotion.endDate),
      selected: false
    };

    this.promotions.unshift(newItem);
    this.filterPromotions();
    this.savePromotions();
    this.closeNewPromotionModal();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getSamplePromotions(): PromotionItem[] {
    return [
      {
        id: 1,
        code: 'VGKM1234',
        name: 'Combo 2 tặng 1',
        usedCount: 5,
        maxUsage: 20,
        status: 'active',
        statusText: 'Đang diễn ra',
        statusClass: 'active',
        startDate: '20/10/2025',
        endDate: '30/11/2025',
        selected: false
      },
    ];
  }
}
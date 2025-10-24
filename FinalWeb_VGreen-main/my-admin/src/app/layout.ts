import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  standalone: true
})
export class Layout {
  currentPageTitle: string = 'Tổng quan';
  isSidebarCollapsed: boolean = false;

  // Danh sách các trang
  private pages: { [key: string]: { title: string, route: string } } = {
    'dashboard': { 
      title: 'Tổng quan', 
      route: '/dashboard'
    },
    'products': { 
      title: 'Sản phẩm', 
      route: '/products'
    },
    'orders': { 
      title: 'Đơn hàng', 
      route: '/orders'
    },
    'customers': { 
      title: 'Khách hàng', 
      route: '/customers'
    },
    'promotions': { 
      title: 'Khuyến mãi', 
      route: '/promotions'
    },
    'posts': { 
      title: 'Bài đăng', 
      route: '/posts'
    },
    'consulting': { 
      title: 'Tư vấn', 
      route: '/consulting'
    },
    'settings': { 
      title: 'Cài đặt', 
      route: '/settings'
    }
  };

  constructor(private router: Router) {}

  /**
   * Điều hướng đến trang khi click menu
   */
  navigateTo(pageKey: string, event: Event): void {
    event.preventDefault();
    
    const page = this.pages[pageKey];
    if (page) {
      // Cập nhật tiêu đề
      this.currentPageTitle = page.title;
      
      // Navigate to route
      this.router.navigate([page.route]);
      
      // Cập nhật active state
      this.updateActiveMenu(event.target as HTMLElement);
      
      // Tự động đóng sidebar trên mobile
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          sidebar.classList.remove('active');
        }
      }
    }
  }

  /**
   * Cập nhật trạng thái active cho menu
   */
  private updateActiveMenu(element: HTMLElement): void {
    // Xóa active khỏi tất cả menu links
    const allLinks = document.querySelectorAll('.menu-link');
    allLinks.forEach(link => link.classList.remove('active'));
    
    // Thêm active cho link được click
    const menuLink = element.closest('.menu-link');
    if (menuLink) {
      menuLink.classList.add('active');
    }
  }

  /**
   * Toggle sidebar collapse/expand
   */
  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  /**
   * Đăng xuất
   */
  logout(): void {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // Xóa dữ liệu session
      localStorage.clear();
      sessionStorage.clear();
      
      // Chuyển về trang đăng nhập
      window.location.href = '/login';
    }
  }
}

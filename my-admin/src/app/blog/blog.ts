import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  email: string;
  date: string;
  category: string;
  hashtags: string[];
  imageUrl?: string;
  selected?: boolean;
  views: number;
}

interface Dish {
  _id: { $oid: string };
  ID: string;
  Description: string;
  Ingredients: string;
  Preparation: string;
  Cooking: string;
  Serving: string;
  Tips: string;
  Video: string;
  UnitNote: string;
}

interface Instruction {
  _id: { $oid: string };
  ID: string;
  CookingTime: string;
  Difficulty: string;
  DishName: string;
  Image: string;
  Ingredient: string;
  Servings: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class Blog implements OnInit {
  blogs: BlogPost[] = [];
  filteredBlogs: BlogPost[] = [];
  dishes: Dish[] = [];
  instructions: Instruction[] = [];
  
  searchQuery: string = '';
  selectedBlog: BlogPost | null = null;
  showDetailView: boolean = false;
  showEditModal: boolean = false;
  isEditMode: boolean = false;
  
  selectedFilter: string = 'all';
  selectedCategory: string = '';
  selectedAuthor: string = '';
  
  newBlog: BlogPost = {
    id: '',
    title: '',
    content: '',
    author: '',
    email: '',
    date: '',
    category: '',
    hashtags: [],
    imageUrl: '',
    views: 0
  };

  hashtagInput: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>('data/blog.json').subscribe(
      (blogData) => {
        this.http.get<Dish[]>('data/dish.json').subscribe(
          (dishData) => {
            this.dishes = dishData;
            
            this.http.get<Instruction[]>('data/instructions.json').subscribe(
              (instructionData) => {
                this.instructions = instructionData;
                this.processBlogData(blogData);
              },
              (error) => {
                console.log('Error loading instructions.json:', error);
                this.processBlogData(blogData);
              }
            );
          },
          (error) => {
            console.log('Error loading dish.json:', error);
            this.processBlogData(blogData);
          }
        );
      },
      (error) => {
        console.log('Error loading blog.json:', error);
        this.blogs = this.getSampleBlogs();
        this.filterBlogs();
      }
    );
  }

  processBlogData(blogData: any[]) {
    this.blogs = blogData.map((item) => {
      const cleanContent = this.stripHtml(item.Content || '');
      const category = this.getCategoryFromContent(item.Title || '', cleanContent);
      const hashtags = this.getHashtagsFromContent(item.Title || '', cleanContent);
      
      const matchingInstruction = this.instructions.find(
        inst => item.Title?.toLowerCase().includes(inst.DishName.toLowerCase())
      );

      return {
        id: item._id?.$oid || Math.random().toString(36).substr(2, 9),
        title: item.Title || 'Untitled',
        content: cleanContent,
        author: 'Nguyễn Thị A',
        email: 'abc@gmail.com',
        date: this.formatDate(new Date().toISOString()),
        category: category,
        hashtags: hashtags,
        imageUrl: matchingInstruction?.Image || '',
        selected: false,
        views: Math.floor(Math.random() * 2000) + 1000
      };
    });

    this.filterBlogs();
  }

  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  getCategoryFromContent(title: string, content: string): string {
    const combined = (title + ' ' + content).toLowerCase();
    if (combined.includes('rau') || combined.includes('củ') || combined.includes('quả')) {
      return 'Sức khỏe';
    }
    return 'Chưa phân loại';
  }

  getHashtagsFromContent(title: string, content: string): string[] {
    const hashtags: string[] = [];
    const combined = (title + ' ' + content).toLowerCase();

    if (combined.includes('rau')) hashtags.push('Rau củ');
    if (combined.includes('sức khỏe')) hashtags.push('Sức khỏe');
    if (combined.includes('dinh dưỡng')) hashtags.push('Dinh dưỡng');

    return hashtags.length > 0 ? hashtags : ['Khỏe mạnh', 'Dinh dưỡng'];
  }

  filterBlogs() {
    this.filteredBlogs = this.blogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          blog.author.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          blog.content.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || blog.category === this.selectedCategory;
      const matchesAuthor = !this.selectedAuthor || blog.author === this.selectedAuthor;
      
      return matchesSearch && matchesCategory && matchesAuthor;
    });

    this.totalPages = Math.ceil(this.filteredBlogs.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.filteredBlogs.forEach(blog => blog.selected = checked);
  }

  getSelectedCount(): number {
    return this.filteredBlogs.filter(blog => blog.selected).length;
  }

  viewBlogDetail(blog: BlogPost) {
    this.selectedBlog = { ...blog };
    this.showDetailView = true;
  }

  closeDetailView() {
    this.showDetailView = false;
    this.selectedBlog = null;
  }

  openNewBlogModal() {
    this.isEditMode = false;
    this.showEditModal = true;
    this.newBlog = {
      id: '',
      title: '',
      content: '',
      author: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      hashtags: [],
      imageUrl: '',
      views: 0
    };
    this.hashtagInput = '';
  }

  openEditModal() {
    if (!this.selectedBlog) {
      const selectedBlogs = this.filteredBlogs.filter(b => b.selected);
      if (selectedBlogs.length === 1) {
        this.selectedBlog = selectedBlogs[0];
      } else {
        return;
      }
    }
    
    this.isEditMode = true;
    this.showEditModal = true;
    this.newBlog = { ...this.selectedBlog };
    this.hashtagInput = this.newBlog.hashtags.join(', ');
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  addHashtag() {
    if (this.hashtagInput.trim()) {
      const tags = this.hashtagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      this.newBlog.hashtags = [...new Set([...this.newBlog.hashtags, ...tags])];
      this.hashtagInput = '';
    }
  }

  removeHashtag(index: number) {
    this.newBlog.hashtags.splice(index, 1);
  }

  saveBlog() {
    if (!this.newBlog.title || !this.newBlog.author || !this.newBlog.email) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (this.isEditMode && this.selectedBlog) {
      const index = this.blogs.findIndex(b => b.id === this.selectedBlog!.id);
      if (index !== -1) {
        this.blogs[index] = { ...this.newBlog, id: this.selectedBlog.id };
        this.selectedBlog = { ...this.blogs[index] };
      }
    } else {
      const newBlogPost: BlogPost = {
        ...this.newBlog,
        id: Math.random().toString(36).substr(2, 9),
        date: this.formatDate(new Date(this.newBlog.date).toISOString())
      };
      this.blogs.unshift(newBlogPost);
    }

    this.filterBlogs();
    this.closeEditModal();
  }

  deleteSelectedBlogs() {
    const selectedBlogs = this.filteredBlogs.filter(blog => blog.selected);
    if (selectedBlogs.length === 0) {
      alert('Vui lòng chọn ít nhất một bài viết để xóa');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedBlogs.length} bài viết?`)) {
      const selectedIds = selectedBlogs.map(blog => blog.id);
      this.blogs = this.blogs.filter(blog => !selectedIds.includes(blog.id));
      this.filterBlogs();
    }
  }

  deleteBlog(blog: BlogPost) {
    if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${blog.title}"?`)) {
      this.blogs = this.blogs.filter(b => b.id !== blog.id);
      this.filterBlogs();
      if (this.selectedBlog?.id === blog.id) {
        this.closeDetailView();
      }
    }
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

  getCategories(): string[] {
    return [...new Set(this.blogs.map(blog => blog.category))];
  }

  getAuthors(): string[] {
    return [...new Set(this.blogs.map(blog => blog.author))];
  }

  getSampleBlogs(): BlogPost[] {
    return [
      {
        id: '1',
        title: 'Các loại rau củ quả sạch phổ biến',
        content: 'Rau lá: Các loại rau xanh đậm, rau thơm, rau ăn quả...',
        author: 'Nguyễn Thị A',
        email: 'abc@gmail.com',
        date: '20/10/2025',
        category: 'Sức khỏe',
        hashtags: ['Rau củ', 'Dinh dưỡng'],
        imageUrl: '',
        selected: false,
        views: 1334
      }
    ];
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from 'src/app/components/toast/toast.service';
import { SupportService } from 'src/app/services/support.service';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
  // Services
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private supportService = inject(SupportService);
  // Form
  supportForm: FormGroup;
  
  // State
  activeCategoryTab: string = 'all';
  searchQuery: string = '';
  
  // FAQ data
  faqCategories: string[] = ['Orders', 'Shipping', 'Returns', 'Payment', 'Account'];
  
  faqs: FAQ[] = [
    {
      id: 1,
      category: 'Orders',
      question: 'How do I track my order?',
      answer: 'You can track your order by logging into your account and visiting the "Orders" section. Click on the specific order to view its current status and tracking information.'
    },
    {
      id: 2,
      category: 'Orders',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'Orders can be modified or canceled within 1 hour of placing them. After that, please contact our customer support team for assistance.'
    },
    {
      id: 3,
      category: 'Shipping',
      question: 'How long will it take to receive my order?',
      answer: 'Standard shipping typically takes 3-5 business days. Express shipping is 1-2 business days. International shipping may take 7-14 business days depending on the destination.'
    },
    {
      id: 4,
      category: 'Shipping',
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location.'
    },
    {
      id: 5,
      category: 'Returns',
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please visit our "Returns" page for more information on how to initiate a return.'
    },
    {
      id: 6,
      category: 'Returns',
      question: 'How do I return an item?',
      answer: 'To return an item, log into your account, go to "Orders," select the order containing the item you wish to return, and click "Return Items." Follow the instructions to generate a return label.'
    },
    {
      id: 7,
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. Some regional payment methods may also be available depending on your location.'
    },
    {
      id: 8,
      category: 'Payment',
      question: 'Is it safe to use my credit card on your website?',
      answer: 'Yes, our website uses industry-standard SSL encryption to protect your personal and payment information. We also comply with PCI DSS standards for secure payment processing.'
    },
    {
      id: 9,
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Click on "Login," then select "Forgot Password." Enter your email address, and we\'ll send you a link to reset your password.'
    },
    {
      id: 10,
      category: 'Account',
      question: 'How can I update my personal information?',
      answer: 'Log into your account, go to "My Profile," and click "Edit" to update your personal information including name, address, and contact details.'
    }
  ];
  
  constructor() {
    this.supportForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      orderNumber: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]]
    });
  }
  
  ngOnInit(): void {
    // Initialize all FAQs as collapsed
    this.faqs = this.faqs.map(faq => ({...faq, isExpanded: false}));
  }
  
  // Filter FAQs by category and search query
  get filteredFaqs(): FAQ[] {
    return this.faqs.filter(faq => {
      // Filter by category
      const categoryMatch = this.activeCategoryTab === 'all' || faq.category === this.activeCategoryTab;
      
      // Filter by search query
      const searchMatch = !this.searchQuery || 
        faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }
  
  // Set active category
  setActiveCategory(category: string): void {
    this.activeCategoryTab = category;
  }
  
  // Toggle FAQ expansion
  toggleFaq(faq: FAQ): void {
    faq.isExpanded = !faq.isExpanded;
  }
  
  // Handle search input
  onSearch(query: string): void {
    this.searchQuery = query;
  }
  
  // Submit support form
  submitSupportRequest(): void {
    if (this.supportForm.invalid) {
      Object.keys(this.supportForm.controls).forEach(key => {
        const control = this.supportForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    // In a real app, you would send this to a backend API
    console.log('Support form submitted:', this.supportForm.value);
    this.supportService.ticketRaise(this.supportForm.value).subscribe({
      next: (ticketId) => {
        console.log('Ticket created successfully with ID:', ticketId);
        this.toast.success('Your support request has been submitted. We\'ll get back to you soon!');
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
      }
    });
    
    // Show success message
    // this.toast.success('Your support request has been submitted. We\'ll get back to you soon!');
    
    // Reset form
    this.supportForm.reset();
  }
} 
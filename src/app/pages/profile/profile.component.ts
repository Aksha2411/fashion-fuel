import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from 'src/app/components/toast/toast.service';
import { UserProfileService, UserAddress, UserProfile, AddressUpdateResult } from 'src/app/services/user-profile.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Services
  userProfileService = inject(UserProfileService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);
  
  // State
  userProfile: UserProfile | null = null;
  isLoading = true;
  editMode = false;
  addressFormVisible = false;
  editingAddressIndex: number | null = null;
  isSavingAddress = false;
  isDeletingAddress = false;
  
  // Forms
  profileForm: FormGroup = this.fb.group({
    phoneNumber: ['', Validators.pattern('^[0-9]{10}$')]
  });
  
  addressForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    street: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,6}$')]],
    country: ['IN', Validators.required]
  });
  
  private subscriptions = new Subscription();
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  loadUserProfile(): void {
    this.isLoading = true;
    const profileSub = this.userProfileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        console.log('User profile loaded:', profile);
        
        if (profile) {
          this.profileForm.patchValue({
            phoneNumber: profile.phoneNumber || ''
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toast.error('Failed to load profile data');
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(profileSub);
  }
  
  // Profile methods
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (!this.editMode && this.userProfile) {
      // Reset form when canceling edit
      this.profileForm.patchValue({
        phoneNumber: this.userProfile.phoneNumber || ''
      });
    }
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }
    
    const formValue = this.profileForm.value;
    const updateSub = this.userProfileService.updateUserProfile({
      phoneNumber: formValue.phoneNumber
    }).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully');
        this.editMode = false;
        this.loadUserProfile();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.toast.error('Failed to update profile');
      }
    });
    
    this.subscriptions.add(updateSub);
  }
  
  // Address methods
  showAddressForm(index?: number): void {
    this.addressFormVisible = true;
    this.editingAddressIndex = index ?? null;
    
    if (index !== undefined && this.userProfile?.addresses && this.userProfile.addresses[index]) {
      // Edit existing address
      this.addressForm.patchValue(this.userProfile.addresses[index]);
    } else {
      // Add new address
      this.addressForm.reset({
        country: 'IN'
      });
    }
  }
  
  hideAddressForm(): void {
    this.addressFormVisible = false;
    this.editingAddressIndex = null;
    this.addressForm.reset({
      country: 'IN'
    });
  }
  
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      return;
    }
    
    const address: UserAddress = this.addressForm.value;
    this.isSavingAddress = true;
    
    if (this.editingAddressIndex !== null) {
      // Update existing address
      const updateSub = this.userProfileService.updateAddress(this.editingAddressIndex, address).subscribe({
        next: () => {
          this.toast.success('Address updated successfully');
          this.hideAddressForm();
          // Manually update the local state instead of reloading the entire profile
          if (this.userProfile && this.userProfile.addresses) {
            this.userProfile.addresses[this.editingAddressIndex!] = address;
          }
          this.isSavingAddress = false;
        },
        error: (error) => {
          console.error('Error updating address:', error);
          this.toast.error('Failed to update address');
          this.isSavingAddress = false;
        }
      });
      
      this.subscriptions.add(updateSub);
    } else {
      // Add new address
      const addSub = this.userProfileService.addAddress(address).subscribe({
        next: (updatedAddresses) => {
          this.toast.success('Address added successfully');
          this.hideAddressForm();
          // Update the local user profile with the returned addresses instead of reloading
          if (this.userProfile) {
            this.userProfile.addresses = updatedAddresses.addresses;
            this.userProfile.defaultAddressIndex = updatedAddresses.defaultAddressIndex;
          }
          this.isSavingAddress = false;
        },
        error: (error) => {
          console.error('Error adding address:', error);
          this.toast.error('Failed to add address');
          this.isSavingAddress = false;
        }
      });
      
      this.subscriptions.add(addSub);
    }
  }
  
  deleteAddress(index: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.isDeletingAddress = true;
      const deleteSub = this.userProfileService.deleteAddress(index).subscribe({
        next: () => {
          this.toast.success('Address deleted successfully');
          // Manually update local state
          if (this.userProfile && this.userProfile.addresses) {
            // Remove the address from the array
            this.userProfile.addresses = this.userProfile.addresses.filter((_, i) => i !== index);
            
            // Adjust default index if needed
            if (this.userProfile.defaultAddressIndex === index) {
              this.userProfile.defaultAddressIndex = this.userProfile.addresses.length > 0 ? 0 : undefined;
            } else if (this.userProfile.defaultAddressIndex !== undefined && 
                      this.userProfile.defaultAddressIndex > index) {
              this.userProfile.defaultAddressIndex--;
            }
          }
          this.isDeletingAddress = false;
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.toast.error('Failed to delete address');
          this.isDeletingAddress = false;
        }
      });
      
      this.subscriptions.add(deleteSub);
    }
  }
  
  setDefaultAddress(index: number): void {
    const defaultSub = this.userProfileService.setDefaultAddress(index).subscribe({
      next: () => {
        this.toast.success('Default address updated');
        // Update local state
        if (this.userProfile) {
          this.userProfile.defaultAddressIndex = index;
        }
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        this.toast.error('Failed to update default address');
      }
    });
    
    this.subscriptions.add(defaultSub);
  }
  
  // Helper methods
  isDefaultAddress(index: number): boolean {
    return this.userProfile?.defaultAddressIndex === index;
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
} 
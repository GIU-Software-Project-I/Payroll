'use client';

import { useState } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Edit Employee Profile Page
 * US-E2-05: Update contact information
 * US-E2-12: Update bio and upload photo
 */
export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    bio: '',
    maritalStatus: 'Single',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setSuccess(false);

      await employeeProfileService.updateContactInfo({
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        maritalStatus: formData.maritalStatus
      });

      await employeeProfileService.updateBio({
        bio: formData.bio
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-600 mt-2">Update your contact information and personal details</p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="text-green-600">✓</div>
          <p className="text-green-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Alert */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <div className="text-red-600">✕</div>
          <p className="text-red-800 font-medium">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="your.email@company.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              <p className="text-slate-500 text-xs mt-2">Your work email address</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                Address *
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="123 Main St, City, State 12345"
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>

          <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-slate-700 mb-2">
              Marital Status
            </label>
            <select
              id="maritalStatus"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">About Me</h2>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-2">
              Biography
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself, your interests, and professional background..."
            />
            <p className="text-slate-500 text-xs mt-2">Maximum 500 characters</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard/department-employee/employee-profile">
            <button
              type="button"
              className="px-8 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Important Notice</h3>
        <p className="text-blue-800 text-sm">
          You can update your contact information and bio directly. For changes to employment-related information (e.g., job title, department), please submit a correction request which will be reviewed by HR.
        </p>
      </div>
    </div>
  );
}


// MediConnect API Service Layer

import { Doctor, User, AuthResponse, Appointment, SearchFilters, ApiResponse } from '@/types';

const API_BASE = 'https://api.mediconnect.com/v1';

class ApiService {
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('mediconnect_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'API request failed');
    }
    return response.json();
  }

  // Authentication
  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, email, password, phone }),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<AuthResponse>(response);
  }

  // Doctors
  async searchDoctors(query?: string, filters?: SearchFilters): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.specialty_id) params.append('specialty_id', filters.specialty_id.toString());
    if (filters?.min_fee) params.append('min_fee', filters.min_fee.toString());
    if (filters?.max_fee) params.append('max_fee', filters.max_fee.toString());
    if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString());
    if (filters?.availability) params.append('availability', filters.availability);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);

    const response = await fetch(`${API_BASE}/doctors?${params}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Doctor[]>>(response);
    return result.data;
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const response = await fetch(`${API_BASE}/doctors/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Doctor>>(response);
    return result.data;
  }

  // Appointments
  async getMyAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE}/appointments/me`, {
      headers: this.getAuthHeaders(),
    });
    const result = await this.handleResponse<ApiResponse<Appointment[]>>(response);
    return result.data;
  }

  async bookAppointment(
    doctor_id: string,
    appointment_date: string,
    appointment_time: string,
    patient_name: string,
    patient_phone: string
  ): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        doctor_id,
        appointment_date,
        appointment_time,
        patient_name,
        patient_phone,
      }),
    });
    const result = await this.handleResponse<ApiResponse<Appointment>>(response);
    return result.data;
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse(response);
  }

  async rescheduleAppointment(
    appointmentId: string,
    new_date: string,
    new_time: string
  ): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ new_date, new_time }),
    });
    const result = await this.handleResponse<ApiResponse<Appointment>>(response);
    return result.data;
  }
}

export const apiService = new ApiService();

// Auth utility functions
export const saveAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mediconnect_token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mediconnect_token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mediconnect_token');
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
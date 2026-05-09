import { apiFetch } from './api';

export const submitReview = (data) =>
  apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) });

export const getReviewForAppointment = (appointmentId) =>
  apiFetch(`/api/reviews/appointment/${appointmentId}`);

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
}; 
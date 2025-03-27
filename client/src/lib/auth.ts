
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || 'Login failed'
      };
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: 'An error occurred during login. Please try again.'
    };
  }
}

export async function logout(): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false };
  }
}

export async function checkAuth(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    const data = await response.json();
    
    if (data.authenticated && data.user) {
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/me', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

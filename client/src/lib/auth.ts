
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
    console.log("Making login request for user:", username);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    
    console.log("Login response status:", response.status);
    
    const data = await response.json();
    console.log("Login response data:", data);
    
    if (!response.ok) {
      console.error("Login failed with status:", response.status, data);
      return { 
        success: false, 
        message: data.message || `Login failed with status: ${response.status}`
      };
    }
    
    if (data.success && data.user) {
      console.log("Login successful, user data:", data.user);
      // Make sure the data matches our interface
      return {
        success: true,
        user: {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          role: data.user.role
        },
        message: data.message
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
    console.log("Attempting logout");
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log("Logout response status:", response.status);
    
    // Clear local storage regardless of response
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    
    const data = await response.json();
    console.log("Logout response data:", data);
    
    return data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear local storage on error as well
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    
    return { success: false };
  }
}

export async function checkAuth(): Promise<User | null> {
  try {
    console.log("Making auth check request with credentials");
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log("Auth check response status:", response.status);
    
    if (!response.ok) {
      console.error("Auth check failed with status:", response.status);
      throw new Error('Not authenticated');
    }
    
    const data = await response.json();
    console.log("Auth check response data:", data);
    
    if (data.authenticated && data.user) {
      console.log("User authenticated:", data.user);
      return data.user;
    }
    
    console.log("User not authenticated from response");
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("Getting current user with credentials");
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log("Get current user response status:", response.status);
    
    if (!response.ok) {
      console.error("Get current user failed with status:", response.status);
      throw new Error('Failed to get current user');
    }
    
    const data = await response.json();
    console.log("Current user data:", data);
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

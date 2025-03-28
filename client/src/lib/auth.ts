
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
    
    // Clear any existing auth cookies/storage before login
    document.cookie = 'user_id=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    document.cookie = 'isp_sales_sid=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    
    // Make login request
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
    console.log("Login response cookies:", document.cookie);
    
    // Try to parse response
    let data;
    try {
      data = await response.json();
      console.log("Login response data:", data);
    } catch (parseError) {
      console.error("Failed to parse login response:", parseError);
      return { 
        success: false, 
        message: 'Failed to parse login response. Please try again.'
      };
    }
    
    if (!response.ok) {
      console.error("Login failed with status:", response.status, data);
      return { 
        success: false, 
        message: data.message || `Login failed with status: ${response.status}`
      };
    }
    
    if (data.success && data.user) {
      console.log("Login successful, user data:", data.user);
      
      // Store authentication info
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', data.user.id.toString());
      
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
    
    // Unexpected response
    console.warn("Unexpected login response:", data);
    return {
      success: false,
      message: 'Unexpected response from server. Please try again.'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error instanceof Error 
        ? `Login error: ${error.message}` 
        : 'An error occurred during login. Please try again.'
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
    
    // Check local storage first for a quick check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId');
    
    if (!isLoggedIn || !userId) {
      console.log("Not logged in according to local storage");
      return null;
    }
    
    // Then check with the server
    const response = await fetch('/api/auth/check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log("Auth check response status:", response.status);
    
    // Clear local storage if server says we're not authenticated
    if (response.status === 401) {
      console.log("Server returned 401, clearing local auth data");
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      return null;
    }
    
    if (!response.ok) {
      console.error("Auth check failed with status:", response.status);
      throw new Error('Server error during authentication check');
    }
    
    // Try to parse response data
    let data;
    try {
      data = await response.json();
      console.log("Auth check response data:", data);
    } catch (parseError) {
      console.error("Failed to parse auth check response:", parseError);
      return null;
    }
    
    if (data.authenticated && data.user) {
      console.log("User authenticated:", data.user);
      // Update local storage to match server data
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', data.user.id.toString());
      return data.user;
    }
    
    // If server says not authenticated, clear local storage
    console.log("Server says not authenticated, clearing local storage");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    // Don't clear local storage on network errors to prevent logouts during
    // temporary connection issues
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

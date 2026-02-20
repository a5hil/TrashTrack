// Simple authentication utility
// Default credentials for demo
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
  { username: 'demo', password: 'demo123', role: 'user' }
];

export const authenticateUser = (username, password) => {
  const user = VALID_CREDENTIALS.find(
    cred => cred.username === username && cred.password === password
  );
  
  if (user) {
    return {
      success: true,
      user: {
        id: 'user_' + Math.floor(Math.random() * 10000),
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString()
      }
    };
  }
  
  return {
    success: false,
    error: 'Invalid username or password'
  };
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem('userSession');
  return !!session;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('userSession');
  try {
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
};

export const setUserSession = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userSession', JSON.stringify(user));
  }
};

export const clearUserSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userSession');
    localStorage.removeItem('user');
  }
};

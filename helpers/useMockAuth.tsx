import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

const LOCAL_STORAGE_KEY = 'mock_auth_session';

type AuthProvider = 'google' | 'facebook';

interface User {
  name: string;
  email: string;
  provider: AuthProvider;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (name: string, email: string, provider: AuthProvider) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedSession) {
        setUser(JSON.parse(storedSession));
      }
    } catch (error) {
      console.error('Failed to parse auth session from localStorage', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (name: string, email: string, provider: AuthProvider) => {
      const newUser: User = { name, email, provider };
      setUser(newUser);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to save auth session to localStorage', error);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove auth session from localStorage', error);
    }
  }, []);

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };

  // Render children only after checking localStorage to prevent flashes of wrong content
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
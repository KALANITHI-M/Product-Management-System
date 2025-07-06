
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

// Mock data for demonstration - in a real app, this would be stored securely
const ADMIN_USER = { id: "1", username: "admin" };
const ADMIN_PASSWORD = "admin123"; // In production, never hard-code passwords

// In-memory user storage (would be replaced with database in production)
let USERS = [
  { id: "1", username: "admin", password: ADMIN_PASSWORD }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check admin credentials
    if (username === ADMIN_USER.username && password === ADMIN_PASSWORD) {
      setUser(ADMIN_USER);
      localStorage.setItem("user", JSON.stringify(ADMIN_USER));
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      navigate("/dashboard");
      setIsLoading(false);
      return;
    }
    
    // Check other registered users
    const foundUser = USERS.find(u => u.username === username && u.password === password);
    if (foundUser) {
      const userInfo = { id: foundUser.id, username: foundUser.username };
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));
      toast({
        title: "Login successful",
        description: `Welcome back, ${username}!`,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const signup = async (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if username already exists
    if (USERS.some(u => u.username === username)) {
      toast({
        title: "Signup failed",
        description: "Username already exists",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Create new user
    const newUser = {
      id: `${USERS.length + 1}`,
      username,
      password
    };
    
    USERS.push(newUser);
    
    // Log in the new user
    const userInfo = { id: newUser.id, username: newUser.username };
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
    
    toast({
      title: "Account created",
      description: `Welcome to CraftFlow, ${username}!`,
    });
    
    navigate("/dashboard");
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        signup,
        logout, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

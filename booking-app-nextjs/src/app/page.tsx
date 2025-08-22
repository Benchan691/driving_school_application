'use client';

import React, { useState, useEffect } from 'react';

// Base URL for your backend API. Make sure your backend server is running.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// --- Type Definitions ---
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: {
    countryCode: string;
    number: string;
  };
}

interface Booking {
  _id: string;
  userId: string;
  startingTime: string;
  endingTime: string;
  user?: User;
}

// --- Reusable UI Components ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8 ${className}`}>
    {children}
  </div>
);

interface InputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ id, type, value, onChange, placeholder, required = false }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
  />
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', disabled = false, className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = 'p-4 rounded-lg mb-4 text-center font-medium';
  const typeClasses = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };
  return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>;
};

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// --- Main Feature Components ---

interface AuthComponentProps {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

function AuthComponent({ setToken, setUser }: AuthComponentProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', countryCode: '', number: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const url = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
    const body = isLogin
      ? { identifier: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: {
            countryCode: formData.countryCode,
            number: formData.number
          }
        };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(isLogin ? 'Login successful!' : 'Signup successful! You can now log in.');
        setToken(data.token);
        setUser(data.data ? data.data.user : null);
        if (isLogin && typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
        }
      } else {
        throw new Error(data.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <p className="text-center text-gray-500 mb-6">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-600 hover:underline ml-1">
          {isLogin ? 'Sign up' : 'Login'}
        </button>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input id="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Full Name" required />
        )}
        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required />
        {!isLogin && (
          <div className="flex space-x-2">
            <Input id="countryCode" type="text" value={formData.countryCode} onChange={handleInputChange} placeholder="Country Code (+1)" required />
            <Input id="number" type="text" value={formData.number} onChange={handleInputChange} placeholder="Phone Number" required />
          </div>
        )}
        <Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" required />
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner /> : (isLogin ? 'Login' : 'Create Account')}
        </Button>
      </form>
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
    </Card>
  );
}

interface BookingComponentProps {
  token: string;
  user: User;
}

function BookingComponent({ token, user }: BookingComponentProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({ startingTime: '', endingTime: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data.data.bookings);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Could not fetch bookings: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const body = {
        ...formData,
        userId: user._id,
        startingTime: new Date(formData.startingTime).toISOString(),
        endingTime: new Date(formData.endingTime).toISOString(),
      };
      
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Booking created successfully!');
        fetchBookings();
      } else {
        throw new Error(data.message || 'Failed to create booking.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="startingTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <Input id="startingTime" type="datetime-local" value={formData.startingTime} onChange={handleInputChange} placeholder='' required />
          </div>
          <div>
            <label htmlFor="endingTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <Input id="endingTime" type="datetime-local" value={formData.endingTime} onChange={handleInputChange} placeholder='' required />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Create Booking'}
          </Button>
        </form>
        <Alert message={error} type="error" />
        <Alert message={success} type="success" />
      </Card>
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Bookings</h2>
        {loadingBookings ? <Spinner/> : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-800">{booking.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-600">{booking.user?.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">From:</span> {new Date(booking.startingTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">To:</span> {new Date(booking.endingTime).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No bookings found.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

interface UsersComponentProps {
  token: string;
}

function UsersComponent({ token }: UsersComponentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data.users);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Could not fetch users: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Users</h2>
      <Alert message={error} type="error" />
      {loading ? <Spinner/> : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user._id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <p className="text-xs text-gray-400">ID: {user._id}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PasswordResetComponent() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "If a user with that email exists, a reset token has been sent.");
        setStep(2);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/resetPassword/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password has been reset successfully! You can now log in with your new password.");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Password Reset</h2>
      {step === 1 ? (
        <form onSubmit={handleForgot} className="space-y-4">
          <p className="text-center text-gray-600">Enter your email to receive a password reset token.</p>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email Address" required />
          <Button type="submit" disabled={loading}>{loading ? <Spinner/> : "Send Reset Token"}</Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-center text-gray-600">Enter the token from your email and your new password.</p>
          <Input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Reset Token" required />
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" required />
          <Button type="submit" disabled={loading}>{loading ? <Spinner/> : "Reset Password"}</Button>
        </form>
      )}
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
    </Card>
  )
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('bookings');

  // Initialize token from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  useEffect(() => {
    const initUser = async () => {
      if (token && !user) {
        try {
          const res = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.data.users.length > 0) {
            setUser(data.data.users[0]);
          } else if (!res.ok) {
            throw new Error("Session expired or invalid. Please log in again.");
          }
        } catch (error) {
          console.error("Could not auto-fetch user:", error);
          handleLogout();
        }
      } else if (!token) {
        setUser(null);
      }
    };

    initUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setCurrentPage('bookings');
  };

  interface NavButtonProps {
    page: string;
    children: React.ReactNode;
  }

  const NavButton: React.FC<NavButtonProps> = ({ page, children }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`px-4 py-2 rounded-md font-semibold transition ${currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-blue-600">Booking App Tester</h1>
          <div>
            {token && (
              <Button onClick={handleLogout} className="w-auto px-4 py-2 text-sm bg-red-500 hover:bg-red-600">Logout</Button>
            )}
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!token ? (
          <div className="max-w-md mx-auto">
            <AuthComponent setToken={setToken} setUser={setUser} />
            <PasswordResetComponent />
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
              <p className="text-lg">Welcome, <span className="font-bold text-gray-800">{user?.name || 'User'}!</span></p>
              <div className="flex space-x-2">
                <NavButton page="bookings">Bookings</NavButton>
                <NavButton page="users">Users</NavButton>
              </div>
            </div>

            {currentPage === 'bookings' && user && <BookingComponent token={token} user={user} />}
            {currentPage === 'users' && <UsersComponent token={token} />}
          </div>
        )}
      </main>
    </div>
  );
}
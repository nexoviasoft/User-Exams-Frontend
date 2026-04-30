import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  role: 'student' | 'teacher' | 'admin' | null;
}

// Load initial state from localStorage if available
const loadState = (): AuthState => {
  if (typeof window === 'undefined') return { user: null, accessToken: null, role: null };
  try {
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) {
      return { user: null, accessToken: null, role: null };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { user: null, accessToken: null, role: null };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(state));
        // Set cookies for middleware
        if (state.accessToken) Cookies.set('accessToken', state.accessToken, { expires: 7 });
        if (state.role) Cookies.set('role', state.role, { expires: 7 });
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
        Cookies.remove('accessToken');
        Cookies.remove('role');
      }
    },
  },
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;

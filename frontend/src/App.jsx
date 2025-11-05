import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { AppRouter } from './routes';
import { supabase } from './lib/supabase';
import { checkSession, setUser, clearUser } from './models/authSlice';

// Inner component that has access to dispatch
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing session on app load
    dispatch(checkSession());

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setUser({ user: session.user, session }));
      } else {
        dispatch(clearUser());
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;

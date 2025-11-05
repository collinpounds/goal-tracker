import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import GoalsView from '../views/GoalsView';
import NotFoundView from '../views/NotFoundView';
import LoginView from '../views/LoginView';
import SignupView from '../views/SignupView';
import ProtectedRoute from '../components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/signup',
    element: <SignupView />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <GoalsView />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundView />,
  },
  {
    path: '/goals',
    element: (
      <ProtectedRoute>
        <GoalsView />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundView />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;

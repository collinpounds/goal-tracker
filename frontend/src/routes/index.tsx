import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout';
import GoalsView from '../views/GoalsView';
import TeamDetailsView from '../views/TeamDetailsView';
import CategoryView from '../views/CategoryView';
import ProfileView from '../views/ProfileView';
import NotFoundView from '../views/NotFoundView';
import LoginView from '../views/LoginView';
import SignupView from '../views/SignupView';
import InviteView from '../views/InviteView';
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
    path: '/invite/:inviteCode',
    element: <InviteView />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <NotFoundView />,
    children: [
      {
        index: true,
        element: <GoalsView />,
      },
      {
        path: 'goals',
        element: <GoalsView />,
      },
      {
        path: 'goals/private',
        element: <GoalsView view="private" />,
      },
      {
        path: 'goals/public',
        element: <GoalsView view="public" />,
      },
      {
        path: 'teams/:teamId',
        element: <TeamDetailsView />,
      },
      {
        path: 'categories/:categoryId',
        element: <CategoryView />,
      },
      {
        path: 'profile',
        element: <ProfileView />,
      },
    ],
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

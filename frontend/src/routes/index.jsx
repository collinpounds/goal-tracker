import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import GoalsView from '../views/GoalsView';
import NotFoundView from '../views/NotFoundView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <GoalsView />,
    errorElement: <NotFoundView />,
  },
  {
    path: '/goals',
    element: <GoalsView />,
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

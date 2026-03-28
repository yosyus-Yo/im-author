import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import './index.css'
import AppLayout from './layouts/AppLayout.tsx'
import LandingPage from './pages/LandingPage.tsx'
import AuthPage from './pages/AuthPage.tsx'
import CreationWorkspace from './pages/CreationWorkspace.tsx'
import MyLibrary from './pages/MyLibrary.tsx'
import CommunityLibrary from './pages/CommunityLibrary.tsx'
import WebViewer from './pages/WebViewer.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/write" replace />,
      },
      {
        path: 'write',
        element: <CreationWorkspace />,
      },
      {
        path: 'library',
        element: <MyLibrary />,
      },
      {
        path: 'community',
        element: <CommunityLibrary />,
      },
      {
        path: 'reader/:id',
        element: <WebViewer />,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

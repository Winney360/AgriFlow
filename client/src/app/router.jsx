import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyHomeRoute } from './PublicOnlyHomeRoute';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { SellerDashboardPage } from '../pages/SellerDashboardPage';
import { CreateListingPage } from '../pages/CreateListingPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import FAQPage from '../pages/FAQPage';
import { EmergencyRequestPage } from '../pages/EmergencyRequestPage';
import { EmergencyRequestsBoard } from '../pages/EmergencyRequestsBoard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <PublicOnlyHomeRoute>
            <HomePage />
          </PublicOnlyHomeRoute>
        ),
      },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <SellerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-listing',
        element: (
          <ProtectedRoute>
            <CreateListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'emergency-request',
        element: (
          <ProtectedRoute>
            <EmergencyRequestPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'emergency-board',
        element: (
          <ProtectedRoute>
            <EmergencyRequestsBoard />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

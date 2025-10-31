import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '@/components/layout/authLayout';
import ErrorPage from '@/pages/errors/errorPage';
import Layout from '@/components/layout';
import Redirect from '@/components/layout/redirect';
import NotFoundPage from '@/pages/errors/notfoundPage';
import { webRoutes } from '@/routes/web';
import loadable from '@loadable/component';
import ProgressBar from '@/components/loader/progressBar';
import RequireAuth from '@/routes/requireAuth';
import LoginPage from '@/pages/auth/loginPage';
import ProductListPage from '@/pages/products/productListPage';
import ProductDetailPage from '@/pages/products/productDetailPage';
import VendorList from '@/pages/vendors/vendorsListPage';
import VendorDetail from '@/pages/vendors/vendorDetailPage';

const errorElement = <ErrorPage />;
const fallbackElement = <ProgressBar />;

const DashboardPage = loadable(() => import('@/pages/dashboardPage'), {
  fallback: fallbackElement,
});
const UserListPage = loadable(() => import('@/pages/users/userListPage'), {
  fallback: fallbackElement,
});
const UserDetailPage = loadable(() => import('@/pages/users/userDetailPage'), {
  fallback: fallbackElement,
});
const OrderDetailsPage = loadable(
  () => import('@/pages/orders/orderDetailsPage'),
  {
    fallback: fallbackElement,
  }
);
const AboutPage = loadable(() => import('@/pages/aboutPage'), {
  fallback: fallbackElement,
});

export const browserRouter = createBrowserRouter([
  {
    path: webRoutes.home,
    element: <Redirect />,
    errorElement: errorElement,
  },

  // auth routes
  {
    element: <AuthLayout />,
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.login,
        element: <LoginPage />,
      },
    ],
  },

  // protected routes
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.dashboard,
        element: <DashboardPage />,
      },
      {
        path: webRoutes.users,
        element: <UserListPage />,
      },
      {
        path: `${webRoutes.users}/:id`,
        element: <UserDetailPage />,
      },
      {
        path: '/orders/:customerId',
        element: <OrderDetailsPage />,
      },
      {
        path: `${webRoutes.users}/:id`,
        element: <UserDetailPage />,
      },
      {
        path: webRoutes.products,
        element: <ProductListPage />,
      },
      {
        path: `${webRoutes.products}/:id`,
        element: <ProductDetailPage />,
      },
      {
        path: `${webRoutes.vendors}`,
        element: <VendorList />,
      },
      {
        path: webRoutes.about,
        element: <AboutPage />,
      },
      {
        path: `${webRoutes.vendor}/:id`,
        element: <VendorDetail />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: errorElement,
  },
]);

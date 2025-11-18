import { webRoutes } from '@/routes/web';
import { BiHomeAlt2 } from 'react-icons/bi';
import Icon, { UserOutlined } from '@ant-design/icons';
import { SiImprovmx } from 'react-icons/si';
import { LiaUserSolid } from 'react-icons/lia';
import { FiUsers } from 'react-icons/fi';

export const sidebar = [
  {
    path: webRoutes.dashboard,
    key: webRoutes.dashboard,
    name: 'Dashboard',
    icon: <Icon component={BiHomeAlt2} />,
  },
  {
    path: webRoutes.vendors,
    key: webRoutes.vendors,
    name: 'Vendors',
    icon: <LiaUserSolid />,
  },
  {
    path: webRoutes.products,
    key: webRoutes.products,
    name: 'Products',
    icon: <SiImprovmx />,
  },
  {
    path: webRoutes.users,
    key: webRoutes.users,
    name: 'Customers',
    icon: <FiUsers />,
  },

  {
    path: webRoutes.orders,
    key: webRoutes.orders,
    name: 'Orders',
    icon: <LiaUserSolid />,
  },
  // {
  //   path: webRoutes.about,
  //   key: webRoutes.about,
  //   name: 'About',
  //   icon: <InfoCircleOutlined />,
  // },
];

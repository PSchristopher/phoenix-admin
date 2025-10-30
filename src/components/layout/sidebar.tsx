import { webRoutes } from '@/routes/web';
import { BiHomeAlt2 } from 'react-icons/bi';
import Icon, { UserOutlined } from '@ant-design/icons';
import { RiShoppingCartFill } from 'react-icons/ri';

export const sidebar = [
  {
    path: webRoutes.dashboard,
    key: webRoutes.dashboard,
    name: 'Dashboard',
    icon: <Icon component={BiHomeAlt2} />,
  },
  {
    path: webRoutes.users,
    key: webRoutes.users,
    name: 'Customers',
    icon: <UserOutlined />,
  },
  {
    path: webRoutes.products,
    key: webRoutes.products,
    name: 'Products',
    icon: <RiShoppingCartFill />,
  },
  {
    path: webRoutes.vendors,
    key: webRoutes.vendors,
    name: 'Vendors',
    icon: <RiShoppingCartFill />,
  },
  // {
  //   path: webRoutes.about,
  //   key: webRoutes.about,
  //   name: 'About',
  //   icon: <InfoCircleOutlined />,
  // },
];

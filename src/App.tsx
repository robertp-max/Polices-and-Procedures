import { RouterProvider } from 'react-router-dom';
import { v6Router } from './v6/routing/router';

export default function App() {
  return <RouterProvider router={v6Router} />;
}

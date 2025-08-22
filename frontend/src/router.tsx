import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectWorkspace } from './components/ProjectWorkspace';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <ProjectDashboard />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectWorkspace />,
      },
    ],
  },
]);

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ProjectDashboard } from './components/ProjectDashboard';
import { Project } from './types/project';
import styles from './App.module.css';

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  // 处理项目点击
  const handleProjectClick = (project: Project) => {
    console.log('项目被点击:', project);
    // TODO: 导航到项目详情页面
    alert(`点击了项目: ${project.name} (${project.id})`);
  };

  // 处理创建项目
  const handleCreateProject = () => {
    console.log('创建新项目');
    // TODO: 打开创建项目对话框
    alert('创建新项目功能将在任务1.2中实现');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.app}>
        <header className={styles.appHeader}>
          <div className={styles.appHeaderContent}>
            <div className={styles.appLogo}>
              <h1>Clario</h1>
              <p>需求规格助手</p>
            </div>
          </div>
        </header>

        <main className={styles.appMain}>
          <ProjectDashboard
            onProjectClick={handleProjectClick}
            onCreateProject={handleCreateProject}
          />
        </main>
      </div>

      {/* 开发环境下显示 React Query DevTools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;

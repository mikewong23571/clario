import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from 'react-router-dom';
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
          <Outlet />
        </main>
      </div>

      {/* 开发环境下显示 React Query DevTools */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;

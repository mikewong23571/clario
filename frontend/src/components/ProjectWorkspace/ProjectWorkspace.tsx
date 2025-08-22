/**
 * ProjectWorkspace 组件
 * 项目工作区界面，包含对话界面和文档预览的两栏布局
 */
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Link, useParams } from 'react-router-dom';
import { ConversationInterface } from '../ConversationInterface';
import { Button } from '../ui';
import { useProject } from '../../hooks/useProjects';
import { ConversationSession } from '../../types/conversation';
import { useConversation } from '../../hooks/useConversation';
import styles from './ProjectWorkspace.module.css';

interface ProjectWorkspaceContentProps {
  projectId: string;
  className?: string;
}

function ProjectWorkspaceContent({
  projectId,
  className = '',
}: ProjectWorkspaceContentProps) {
  const {
    data: project,
    isLoading: isProjectLoading,
    isError,
    error,
  } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<'conversation' | 'documents'>(
    'conversation'
  );
  const [documentContent, setDocumentContent] = useState<string>(
    '# 项目文档\n\n正在加载项目文档...'
  );
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const { session, startConversation } = useConversation();

  useEffect(() => {
    if (!session && project) {
      startConversation({
        projectId: project.id,
        initialMessage: `你好！我想为项目 "${project.name}" 进行需求澄清和文档完善。请帮助我开始这个过程。`,
      });
    }
  }, [project, session, startConversation]);

  useEffect(() => {
    if (!project) return;
    const loadDocument = async () => {
      setIsDocumentLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockContent = `# ${project.name}\n\n## 项目概述\n\n这是 ${project.name} 项目的详细文档。\n\n## 核心功能\n\n- 功能1：待定义\n- 功能2：待定义\n- 功能3：待定义\n\n## 技术栈\n\n- 前端：React + TypeScript\n- 后端：FastAPI\n- 数据库：PostgreSQL\n\n## 开发进度\n\n- [x] 项目初始化\n- [ ] 核心功能开发\n- [ ] 测试用例编写\n- [ ] 部署配置\n\n## 更新日志\n\n### ${project.lastUpdated}\n- 项目创建\n- 初始文档生成`;
      setDocumentContent(mockContent);
      setIsDocumentLoading(false);
    };
    loadDocument();
  }, [project]);

  const handleConversationEnd = (session: ConversationSession) => {
    console.log('对话结束:', session);
  };

  const handleDocumentUpdate = (updates: Record<string, unknown>) => {
    console.log('文档更新:', updates);
  };

  return (
    <div className={clsx(styles.workspace, className)}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.projectInfo}>
            <Link to="/" className={styles.backButtonLink}>
              <Button
                variant="ghost"
                size="small"
                className={styles.backButton}
              >
                <svg
                  className={styles.backIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                返回项目列表
              </Button>
            </Link>
            {isProjectLoading ? (
              <div className={styles.projectDetails}>
                <h1 className={styles.projectName}>正在加载项目...</h1>
              </div>
            ) : project ? (
              <div className={styles.projectDetails}>
                <h1 className={styles.projectName}>{project.name}</h1>
                <p className={styles.projectMeta}>
                  项目ID: {project.id} • 最后更新:{' '}
                  {new Date(project.lastUpdated).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ) : null}
          </div>
          <div className={styles.tabs}>
            <button
              type="button"
              className={clsx(
                styles.tab,
                activeTab === 'conversation' && styles.tabActive
              )}
              onClick={() => setActiveTab('conversation')}
            >
              <svg
                className={styles.tabIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
              AI 对话
            </button>
            <button
              type="button"
              className={clsx(
                styles.tab,
                activeTab === 'documents' && styles.tabActive
              )}
              onClick={() => setActiveTab('documents')}
            >
              <svg
                className={styles.tabIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              项目文档
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        {isProjectLoading ? (
          <div className={styles.stateContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>正在加载项目...</p>
          </div>
        ) : isError ? (
          <div className={styles.stateContainer}>
            <p>
              加载项目失败:{' '}
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ) : project ? (
          <div className={styles.content}>
            {activeTab === 'conversation' ? (
              <div className={styles.conversationPanel}>
                <ConversationInterface
                  projectId={project.id}
                  initialMessage={`开始为项目 "${project.name}" 进行需求澄清`}
                  onConversationEnd={handleConversationEnd}
                  onDocumentUpdate={handleDocumentUpdate}
                  className={styles.conversation}
                />
              </div>
            ) : (
              <div className={styles.documentPanel}>
                <div className={styles.documentHeader}>
                  <h2>项目文档</h2>
                  <div className={styles.documentActions}>
                    <Button variant="secondary" size="small">
                      <svg
                        className={styles.actionIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                      编辑
                    </Button>
                    <Button variant="secondary" size="small">
                      <svg
                        className={styles.actionIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      导出
                    </Button>
                  </div>
                </div>
                <div className={styles.documentContent}>
                  {isDocumentLoading ? (
                    <div className={styles.documentLoading}>
                      <div className={styles.loadingSpinner}></div>
                      <p>正在加载项目文档...</p>
                    </div>
                  ) : (
                    <div className={styles.documentViewer}>
                      <pre className={styles.documentText}>
                        {documentContent}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.stateContainer}>
            <p>未找到项目。</p>
          </div>
        )}
      </main>
    </div>
  );
}

export interface ProjectWorkspaceProps {
  className?: string;
}

export function ProjectWorkspace({ className = '' }: ProjectWorkspaceProps) {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className={styles.stateContainer}>
        <p>无效的项目 ID</p>
      </div>
    );
  }

  return (
    <ProjectWorkspaceContent projectId={projectId} className={className} />
  );
}

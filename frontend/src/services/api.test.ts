import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from './api';
import type { CreateProjectRequest, ProjectSpec } from '../types/project';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock data
const mockProject: ProjectSpec = {
  lastUpdated: '2024-01-15T10:30:00Z',
  specVersion: '1.0.0',
  coreIdea: {
    problemStatement: 'Test problem',
    targetAudience: 'Test users',
    coreValue: 'Test value',
  },
  scope: {
    inScope: ['feature1', 'feature2'],
    outOfScope: ['feature3'],
  },
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project for unit testing',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z',
};

// const mockProjects: Project[] = [
//   mockProject,
//   {
//     id: 'test-project-2',
//     name: 'Another Test Project',
//     description: 'Another test project',
//     status: 'completed',
//     specVersion: '2.0.0',
//     lastUpdated: '2024-01-10T08:15:00Z',
//     created_at: '2024-01-05T00:00:00Z',
//     updated_at: '2024-01-10T08:15:00Z',
//   },
// ];

const createMockResponse = (data: unknown, status = 200, ok = true) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default environment variable
    vi.stubEnv('VITE_API_URL', 'http://localhost:8000');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('fetchProjects', () => {
    it('fetches projects successfully', async () => {
      const mockProjects = [mockProject];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      } as Response);

      const result = await fetchProjects();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
      expect(result).toEqual(mockProjects);
    });

    it('handles empty project list', async () => {
      mockFetch.mockResolvedValue(createMockResponse([]));

      const result = await fetchProjects();

      expect(result).toEqual([]);
    });

    it('uses default localhost URL', async () => {
      const mockProjects = [mockProject];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      } as Response);

      await fetchProjects();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
    });
  });

  describe('getProject', () => {
    it('fetches single project successfully', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockProject));

      const result = await getProject('test-project-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/test-project-1',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'GET',
        }
      );
      expect(result).toEqual(mockProject);
    });

    it('handles project not found', async () => {
      const errorResponse = { detail: 'Project not found' };
      mockFetch.mockResolvedValue(
        createMockResponse(errorResponse, 404, false)
      );

      await expect(getProject('non-existent')).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('createProject', () => {
    const createRequest: CreateProjectRequest = {
      project_id: 'new-project-id',
      spec: {
        name: 'New Project',
        description: 'A new project description',
      },
    };

    it('creates project successfully', async () => {
      const createdProject: ProjectSpec = {
        lastUpdated: '2024-01-15T10:30:00Z',
        specVersion: '1.0.0',
        coreIdea: {
          problemStatement: 'Test problem',
          targetAudience: 'Test users',
          coreValue: 'Test value',
        },
        scope: {
          inScope: ['feature1'],
          outOfScope: ['feature2'],
        },
        id: 'new-project-id',
        name: 'New Project',
        description: 'A new project description',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      };
      mockFetch.mockResolvedValue(createMockResponse(createdProject, 201));

      const result = await createProject(createRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createRequest),
        }
      );
      expect(result).toEqual(createdProject);
    });

    it('handles validation errors', async () => {
      const errorResponse = { detail: 'Validation failed' };
      mockFetch.mockResolvedValue(
        createMockResponse(errorResponse, 400, false)
      );

      await expect(createProject(createRequest)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('updateProject', () => {
    const updateSpec = {
      name: 'Updated Project',
      description: 'Updated description',
      status: 'completed',
    };

    it('updates project successfully', async () => {
      const updatedProject: ProjectSpec = {
        ...mockProject,
        name: updateSpec.name,
        description: updateSpec.description,
        status: updateSpec.status as 'active' | 'completed' | 'archived',
      };
      mockFetch.mockResolvedValue(createMockResponse(updatedProject));

      const result = await updateProject(
        'test-project-1',
        updateSpec,
        'Test update'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/test-project-1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spec: updateSpec,
            change_description: 'Test update',
          }),
        }
      );
      expect(result).toEqual(updatedProject);
    });

    it('handles project not found during update', async () => {
      const errorResponse = { detail: 'Project not found' };
      mockFetch.mockResolvedValue(
        createMockResponse(errorResponse, 404, false)
      );

      await expect(updateProject('non-existent', updateSpec)).rejects.toThrow(
        'Project not found'
      );
    });

    it('handles partial updates', async () => {
      const partialUpdate = { name: 'New Name Only' };
      const updatedProject: ProjectSpec = {
        ...mockProject,
        name: 'New Name Only',
      };
      mockFetch.mockResolvedValue(createMockResponse(updatedProject));

      const result = await updateProject('test-project-1', partialUpdate);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/test-project-1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spec: partialUpdate,
            change_description: '更新项目',
          }),
        }
      );
      expect(result).toEqual(updatedProject);
    });
  });

  describe('deleteProject', () => {
    it('deletes project successfully', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ message: 'Project deleted successfully' })
      );

      const result = await deleteProject('test-project-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/projects/test-project-1',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ message: 'Project deleted successfully' });
    });

    it('handles project not found during deletion', async () => {
      const errorResponse = { detail: 'Project not found' };
      mockFetch.mockResolvedValue(
        createMockResponse(errorResponse, 404, false)
      );

      await expect(deleteProject('non-existent')).rejects.toThrow(
        'Project not found'
      );
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network timeout');
      mockFetch.mockRejectedValue(networkError);

      await expect(fetchProjects()).rejects.toThrow('Network timeout');
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      await expect(fetchProjects()).rejects.toThrow('Invalid JSON');
    });

    it('handles empty response body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(null),
      } as Response);

      const result = await fetchProjects();
      expect(result).toBeNull();
    });
  });

  describe('Request Headers', () => {
    it('includes correct content-type for POST requests', async () => {
      const createRequest: CreateProjectRequest = {
        project_id: 'test-project-1',
        spec: {
          name: 'Test Project',
          description: 'Test Description',
        },
      };
      mockFetch.mockResolvedValue(createMockResponse(mockProject, 201));

      await createProject(createRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('includes correct content-type for PUT requests', async () => {
      const updateRequest = {
        name: 'Updated Project',
      };
      mockFetch.mockResolvedValue(createMockResponse(mockProject));

      await updateProject('test-project-1', updateRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });
});

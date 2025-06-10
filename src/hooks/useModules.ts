import useSWR from 'swr';
import { ModuleData } from '@/types/module';

export function useModules(courseId: string) {
  const { data: modules, error, isLoading, mutate } = useSWR<ModuleData[]>(
    `/api/courses/${courseId}/modules`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      return response.json();
    }
  );

  const createModule = async (moduleData: Partial<ModuleData>) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(moduleData)
      });

      if (!response.ok) {
        throw new Error("Failed to create module");
      }

      const newModule = await response.json();
      mutate(prevModules => [...(prevModules || []), newModule]);
      return newModule;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  };

  const updateModule = async (
    moduleId: string,
    moduleData: Partial<ModuleData>
  ) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(moduleData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update module");
      }

      const updatedModule = await response.json();
      mutate(prevModules =>
        prevModules.map(module =>
          module.id === moduleId ? updatedModule : module
        )
      );
      return updatedModule;
    } catch (error) {
      console.error("Error updating module:", error);
      throw error;
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete module");
      }

      mutate(prevModules =>
        prevModules.filter(module => module.id !== moduleId)
      );
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  };

  const refresh = () => {
    mutate();
  };

  return {
    modules: modules || [],
    isLoading,
    isError: error,
    createModule,
    updateModule,
    deleteModule,
    mutate,
    refresh
  };
}

import { moduleRegistry, type ModuleDefinition } from '@/core';

type ModuleRegisterExports = Record<string, unknown>;

const moduleRegisterFiles = import.meta.glob<ModuleRegisterExports>('@/modules/**/register.ts', { eager: true });

const isModuleDefinition = (value: unknown): value is ModuleDefinition => {
  if (!value || typeof value !== 'object') return false;
  const module = value as Partial<ModuleDefinition>;
  return typeof module.name === 'string' && module.name.trim().length > 0;
};

const collectModuleDefinitions = (exports: ModuleRegisterExports): ModuleDefinition[] => {
  return Object.values(exports).filter(isModuleDefinition);
};

export const registerModules = (modules: readonly ModuleDefinition[]): void => {
  for (const module of modules) {
    if (!moduleRegistry.has(module.name)) {
      moduleRegistry.register(module);
    }
  }
};

export const registerDiscoveredModules = (): void => {
  const modules = Object.entries(moduleRegisterFiles)
    .flatMap(([path, exports]) => collectModuleDefinitions(exports).map(module => ({ path, module })))
    .sort((left, right) => left.path.localeCompare(right.path) || left.module.name.localeCompare(right.module.name));

  registerModules(modules.map(({ module }) => module));
};

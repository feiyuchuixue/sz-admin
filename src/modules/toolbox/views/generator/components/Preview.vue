<template>
  <el-dialog
    v-model="visible"
    :title="`代码预览：${parameter.tableName}`"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    width="88vw"
    top="4vh"
    append-to-body
  >
    <div class="preview-summary">
      <div class="summary-main">
        <div class="summary-item summary-create">
          <span class="summary-value">{{ summary.create }}</span>
          <span class="summary-label">新增文件</span>
        </div>
        <div class="summary-item summary-modify">
          <span class="summary-value">{{ summary.modify }}</span>
          <span class="summary-label">修改文件</span>
        </div>
        <div class="summary-item summary-skip">
          <span class="summary-value">{{ summary.skip }}</span>
          <span class="summary-label">跳过</span>
        </div>
        <div class="summary-item summary-script">
          <span class="summary-value">{{ summary.script }}</span>
          <span class="summary-label">脚本</span>
        </div>
      </div>
      <div class="summary-target">
        <div class="scope-summary">
          <span class="scope-pill scope-backend">后端 {{ scopeSummary.backend }}</span>
          <span class="scope-pill scope-frontend">前端 {{ scopeSummary.frontend }}</span>
          <span class="scope-pill scope-script">脚本 {{ scopeSummary.script }}</span>
        </div>
        <span>目标：{{ targetText }}</span>
        <span v-if="summary.modify > 0" class="summary-note">修改项仅做幂等插入，不覆盖已有内容。</span>
      </div>
    </div>

    <div class="preview-body">
      <aside class="target-panel">
        <div class="panel-heading">
          <span>生成目标树</span>
          <span>{{ filteredItems.length }} 项</span>
        </div>
        <div class="tree-tools">
          <el-input v-model="keyword" clearable placeholder="搜索文件 / 路径" />
          <el-radio-group v-model="operationFilter" size="small" class="filter-group">
            <el-radio-button label="ALL">全部</el-radio-button>
            <el-radio-button label="CREATE_FILE">新增</el-radio-button>
            <el-radio-button label="MODIFY_FILE">修改</el-radio-button>
            <el-radio-button label="SKIP_EXISTS">跳过</el-radio-button>
            <el-radio-button label="SCRIPT">脚本</el-radio-button>
          </el-radio-group>
        </div>
        <el-scrollbar class="tree-scroll">
          <el-tree
            ref="previewTreeRef"
            :data="treeData"
            node-key="id"
            default-expand-all
            highlight-current
            :current-node-key="selectedTreeNodeId"
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <span
                class="tree-node"
                :class="[data.item ? 'is-file' : 'is-dir', data.isScopeRoot ? 'is-scope-root' : '', `scope-${data.scope}`]"
              >
                <span class="node-main">
                  <span v-if="data.isScopeRoot" class="node-scope-mark">{{ scopeMeta(data.scope).short }}</span>
                  <el-icon class="node-icon" :class="{ 'file-icon': Boolean(data.item), 'dir-icon': !data.item }">
                    <Document v-if="data.item" />
                    <Folder v-else />
                  </el-icon>
                  <span class="node-label" :title="data.path">{{ data.label }}</span>
                </span>
                <span class="node-extra">
                  <span v-if="data.isScopeRoot" class="scope-count">{{ data.count || 0 }} 项</span>
                  <el-tag v-if="data.item" size="small" :type="operationMeta(data.item.operationType).type" effect="plain">
                    {{ operationMeta(data.item.operationType).label }}
                  </el-tag>
                </span>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </aside>

      <section class="detail-panel" :class="`scope-${selectedScope}`">
        <template v-if="selectedItem">
          <div class="detail-header">
            <div class="detail-title">
              <div class="detail-name">
                <span class="scope-badge">{{ scopeMeta(selectedScope).label }}</span>
                <span>{{ selectedItem.name }}</span>
              </div>
              <div class="detail-tags">
                <el-tag :type="operationMeta(selectedItem.operationType).type" effect="plain">
                  {{ operationMeta(selectedItem.operationType).detail }}
                </el-tag>
              </div>
            </div>
            <div class="detail-path-row">
              <span class="detail-path-label">相对路径</span>
              <span class="detail-path">{{ selectedDisplayPath || selectedItem.relativePath || selectedItem.name }}</span>
            </div>
            <div v-if="selectedItem.fullPath" class="detail-path-row">
              <span class="detail-path-label">完整路径</span>
              <span class="detail-full-path">{{ selectedItem.fullPath }}</span>
            </div>
            <div v-if="selectedItem.message" class="detail-message">{{ selectedItem.message }}</div>
          </div>
          <HighCode
            :code="selectedCode"
            :language="selectedLanguage"
            :title="selectedItem.name"
            :language-label="selectedLanguageLabel"
            class="code-box"
          />
        </template>
        <el-empty v-else description="暂无可预览文件" />
      </section>
    </div>

    <template #footer>
      <el-button @click="downloadCurrent">下载完整离线包</el-button>
      <el-button :disabled="!selectedItem" @click="copyCurrent">复制当前文件</el-button>
      <el-button type="primary" @click="generateCurrent">生成代码</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { checkDisk, codeGenerator, downloadZip, previewCode } from '@/modules/toolbox/api/generator';
import type { GeneratorCheckInfo, GeneratorPreviewInfo } from '@/modules/toolbox/types/generator';
import type { IResultData } from '@/api/types';
import HighCode from '@/components/HighCode/index.vue';
import { useDownload } from '@/hooks/useDownload';
import { computed, nextTick, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Folder } from '@element-plus/icons-vue';

defineOptions({
  name: 'Preview'
});

type OperationType = NonNullable<GeneratorPreviewInfo['operationType']>;
type OperationFilter = OperationType | 'ALL';
type PreviewScope = 'frontend' | 'backend' | 'script' | 'other';

type PreviewTreeNode = {
  id: string;
  label: string;
  path: string;
  scope: PreviewScope;
  isScopeRoot?: boolean;
  count?: number;
  item?: GeneratorPreviewInfo;
  children?: PreviewTreeNode[];
};

const visible = ref(false);
const codeList = ref<GeneratorPreviewInfo[]>([]);
const keyword = ref('');
const operationFilter = ref<OperationFilter>('ALL');
const selectedItem = ref<GeneratorPreviewInfo>();
const previewTreeRef = ref();

const parameter = ref<PreviewParameterProps>({
  tableName: ''
});

export interface PreviewParameterProps {
  tableName: string;
}

const acceptParams = (params: PreviewParameterProps) => {
  parameter.value = { ...parameter.value, ...params };
  visible.value = true;
  getCode();
};

const summary = computed(() => ({
  create: countByOperation('CREATE_FILE'),
  modify: countByOperation('MODIFY_FILE'),
  skip: countByOperation('SKIP_EXISTS'),
  script: countByOperation('SCRIPT')
}));

const scopeSummary = computed(() => ({
  backend: countByScope('backend'),
  frontend: countByScope('frontend'),
  script: countByScope('script')
}));

const targetText = computed(() => {
  const projects = Array.from(
    new Set(
      codeList.value
        .map(item => {
          const scope = resolveScope(item);
          return firstPathSegment(resolveDisplayPath(item, scope));
        })
        .filter(Boolean)
    )
  );
  return projects.length ? projects.join(' / ') : '-';
});

const filteredItems = computed(() => {
  const searchValue = keyword.value.trim().toLowerCase();
  return codeList.value.filter(item => {
    const operationMatched = operationFilter.value === 'ALL' || item.operationType === operationFilter.value;
    const searchMatched =
      !searchValue ||
      [item.name, item.relativePath, item.fullPath, item.message, item.alias]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(searchValue));
    return operationMatched && searchMatched;
  });
});

const treeData = computed(() => buildTree(filteredItems.value));

const selectedCode = computed(() => {
  if (!selectedItem.value) {
    return '';
  }
  if (selectedItem.value.operationType === 'MODIFY_FILE') {
    return selectedItem.value.diff || selectedItem.value.code || '';
  }
  if (selectedItem.value.operationType === 'SKIP_EXISTS') {
    return (
      selectedItem.value.content || selectedItem.value.code || selectedItem.value.message || '目标文件已存在，生成器不会覆盖。'
    );
  }
  return selectedItem.value.content || selectedItem.value.code || '';
});

const selectedLanguage = computed(() => {
  if (selectedItem.value?.operationType === 'MODIFY_FILE') {
    return 'diff';
  }
  return selectedItem.value?.language || 'text';
});

const selectedScope = computed<PreviewScope>(() => {
  return selectedItem.value ? resolveScope(selectedItem.value) : 'other';
});

const selectedDisplayPath = computed(() => {
  return selectedItem.value ? resolveDisplayPath(selectedItem.value, selectedScope.value) : '';
});

const selectedTreeNodeId = computed(() => {
  return selectedItem.value ? getItemNodeId(selectedItem.value) : '';
});

const selectedLanguageLabel = computed(() => {
  const language = selectedLanguage.value || 'text';
  if (language === 'typescript') return 'TypeScript';
  if (language === 'javascript') return 'JavaScript';
  if (language === 'diff') return 'Diff';
  if (language === 'xml') return 'XML';
  if (language === 'java') return 'Java';
  if (language === 'vue') return 'Vue';
  return language.toUpperCase();
});

watch(filteredItems, items => {
  if (!items.length) {
    selectedItem.value = undefined;
    return;
  }
  if (!selectedItem.value || !items.some(item => item.relativePath === selectedItem.value?.relativePath)) {
    selectedItem.value = pickDefaultItem(items);
  }
});

watch(selectedTreeNodeId, id => {
  nextTick(() => {
    previewTreeRef.value?.setCurrentKey?.(id || undefined);
  });
});

const getCode = () => {
  previewCode(parameter.value.tableName).then((info: IResultData<GeneratorPreviewInfo[]>) => {
    codeList.value = info.data || [];
    selectedItem.value = pickDefaultItem(codeList.value);
    nextTick(() => {
      visible.value = true;
    });
  });
};

const countByOperation = (operationType: OperationType) => {
  return codeList.value.filter(item => item.operationType === operationType).length;
};

const countByScope = (scope: PreviewScope) => {
  return codeList.value.filter(item => resolveScope(item) === scope).length;
};

const operationMeta = (operationType?: string) => {
  switch (operationType) {
    case 'MODIFY_FILE':
      return { label: '修改', detail: '修改文件', type: 'warning' as const };
    case 'SKIP_EXISTS':
      return { label: '跳过', detail: '已存在，跳过', type: 'info' as const };
    case 'SCRIPT':
      return { label: '脚本', detail: '脚本文件', type: 'primary' as const };
    default:
      return { label: '新增', detail: '新增文件', type: 'success' as const };
  }
};

const scopeMeta = (scope?: PreviewScope) => {
  switch (scope) {
    case 'frontend':
      return { label: '前端', short: '前', rootLabel: '前端项目' };
    case 'backend':
      return { label: '后端', short: '后', rootLabel: '后端项目' };
    case 'script':
      return { label: '脚本', short: '脚', rootLabel: '脚本清单' };
    default:
      return { label: '其他', short: '其', rootLabel: '其他文件' };
  }
};

const buildTree = (items: GeneratorPreviewInfo[]) => {
  const roots: PreviewTreeNode[] = [];
  const nodeMap = new Map<string, PreviewTreeNode>();

  items.forEach(item => {
    const scope = resolveScope(item);
    const displayPath = resolveDisplayPath(item, scope);
    const segments = displayPath.split('/').filter(Boolean);
    let currentChildren = roots;
    let currentPath = '';
    let rootNode: PreviewTreeNode | undefined;

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const nodeKey = `${scope}:${currentPath}`;
      let node = nodeMap.get(nodeKey);
      if (!node) {
        node = {
          id: nodeKey,
          label: index === 0 ? formatRootLabel(segment, scope) : segment,
          path: currentPath,
          scope,
          isScopeRoot: index === 0,
          children: []
        };
        nodeMap.set(nodeKey, node);
        currentChildren.push(node);
      }
      if (index === 0) {
        rootNode = node;
      }
      if (index === segments.length - 1) {
        node.item = item;
        node.children = undefined;
      }
      currentChildren = node.children || [];
    });
    if (rootNode) {
      rootNode.count = (rootNode.count || 0) + 1;
    }
  });

  return compactTree(sortTree(roots), true);
};

const sortTree = (nodes: PreviewTreeNode[]): PreviewTreeNode[] => {
  return nodes
    .map(node => ({
      ...node,
      children: node.children ? sortTree(node.children) : undefined
    }))
    .sort((a, b) => {
      if (a.isScopeRoot && b.isScopeRoot && a.scope !== b.scope) {
        return scopeOrder(a.scope) - scopeOrder(b.scope);
      }
      if (Boolean(a.item) !== Boolean(b.item)) {
        return a.item ? 1 : -1;
      }
      return a.label.localeCompare(b.label);
    });
};

const scopeOrder = (scope: PreviewScope) => {
  const order: Record<PreviewScope, number> = {
    backend: 1,
    frontend: 2,
    script: 3,
    other: 4
  };
  return order[scope];
};

const compactTree = (nodes: PreviewTreeNode[], isRootLevel = false): PreviewTreeNode[] => {
  return nodes.flatMap(node => compactNode(node, isRootLevel));
};

const compactNode = (node: PreviewTreeNode, isRoot: boolean): PreviewTreeNode | PreviewTreeNode[] => {
  const compacted: PreviewTreeNode = {
    ...node,
    children: node.children ? compactTree(node.children) : undefined
  };

  if (isRoot || compacted.item || !compacted.children?.length) {
    return compacted;
  }

  if (compacted.label === 'src') {
    return compactSourcePath(compacted);
  }

  if (isPackageRoot(compacted.label)) {
    return compactPackagePath(compacted);
  }

  return compacted;
};

const compactSourcePath = (node: PreviewTreeNode): PreviewTreeNode | PreviewTreeNode[] => {
  const mainNode = onlyDirectoryChild(node);
  const targetNode = mainNode && onlyDirectoryChild(mainNode);
  if (!mainNode || !targetNode || !['java', 'resources'].includes(targetNode.label)) {
    if (mainNode?.label === 'main') {
      const sourceChildren = mainNode.children?.filter(child => !child.item && ['java', 'resources'].includes(child.label)) || [];
      if (sourceChildren.length && sourceChildren.length === mainNode.children?.length) {
        return sourceChildren.map(child => ({
          ...child,
          id: child.id,
          label: `${node.label}/${mainNode.label}/${child.label}`,
          children: child.children ? compactTree(child.children) : undefined
        }));
      }
    }
    return node;
  }
  return {
    ...targetNode,
    id: targetNode.id,
    label: `${node.label}/${mainNode.label}/${targetNode.label}`,
    children: targetNode.children ? compactTree(targetNode.children) : undefined
  };
};

const compactPackagePath = (node: PreviewTreeNode) => {
  const labels = [node.label];
  let current = node;
  let child = onlyDirectoryChild(current);
  while (child && isPackageSegment(child.label)) {
    labels.push(child.label);
    current = child;
    child = onlyDirectoryChild(current);
  }
  if (labels.length === 1) {
    return node;
  }
  return {
    ...current,
    id: current.id,
    label: labels.join('.'),
    children: current.children ? compactTree(current.children) : undefined
  };
};

const onlyDirectoryChild = (node: PreviewTreeNode) => {
  if (!node.children || node.children.length !== 1 || node.children[0].item) {
    return undefined;
  }
  return node.children[0];
};

const isPackageRoot = (label: string) => {
  return ['com', 'org', 'net', 'io', 'cn'].includes(label);
};

const isPackageSegment = (label: string) => {
  return /^[a-z][a-z0-9_]*$/i.test(label) && !label.includes('-') && !label.includes('.');
};

const pickDefaultItem = (items: GeneratorPreviewInfo[]) => {
  const treeItems = flattenTreeItems(buildTree(items));
  return treeItems.find(isSelectablePreviewItem) || treeItems[0] || items.find(isSelectablePreviewItem) || items[0];
};

const flattenTreeItems = (nodes: PreviewTreeNode[]): GeneratorPreviewInfo[] => {
  return nodes.flatMap(node => {
    if (node.item) return [node.item];
    return node.children ? flattenTreeItems(node.children) : [];
  });
};

const isSelectablePreviewItem = (item: GeneratorPreviewInfo) => {
  if (item.operationType === 'SKIP_EXISTS') return false;
  return Boolean(item.content || item.code || item.diff || item.message);
};

const getItemNodeId = (item: GeneratorPreviewInfo) => {
  const scope = resolveScope(item);
  const displayPath = resolveDisplayPath(item, scope);
  return `${scope}:${displayPath.split('/').filter(Boolean).join('/')}`;
};

const handleNodeClick = (node: PreviewTreeNode) => {
  if (node.item) {
    selectedItem.value = node.item;
  }
};

const normalizePath = (path?: string) => {
  return (path || '').replace(/\\/g, '/');
};

const firstPathSegment = (path?: string) => {
  return normalizePath(path).split('/').filter(Boolean)[0] || '';
};

const resolveScope = (item: GeneratorPreviewInfo): PreviewScope => {
  const source = normalizePath(`${item.projectName || ''}/${item.relativePath || ''}/${item.fullPath || ''}`).toLowerCase();
  if (item.operationType === 'SCRIPT' || source.includes('/scripts/') || source.startsWith('scripts/')) {
    return 'script';
  }
  if (source.includes('sz-admin') || source.includes('src/modules/')) {
    return 'frontend';
  }
  if (
    source.includes('sz-boot-parent') ||
    source.includes('sz-module') ||
    source.includes('sz-service') ||
    item.language === 'java'
  ) {
    return 'backend';
  }
  return 'other';
};

const resolveDisplayPath = (item: GeneratorPreviewInfo, scope: PreviewScope) => {
  const pathSegments = normalizePath(item.relativePath || item.name)
    .split('/')
    .filter(Boolean);
  const root = resolveProjectRoot(item, scope, pathSegments);
  const innerSegments = stripMismatchedRoot(pathSegments, scope, root);
  if (!root) {
    return innerSegments.join('/');
  }
  if (innerSegments[0] === root) {
    return innerSegments.join('/');
  }
  return [root, ...innerSegments].filter(Boolean).join('/');
};

const resolveProjectRoot = (item: GeneratorPreviewInfo, scope: PreviewScope, pathSegments: string[]) => {
  const firstSegment = pathSegments[0] || '';
  const projectName = firstPathSegment(item.projectName);
  if (scope === 'frontend') {
    return isFrontendRoot(firstSegment) || isFrontendRoot(projectName) ? 'sz-admin' : defaultRootByScope(scope);
  }
  if (scope === 'backend') {
    return isBackendRoot(firstSegment) || isBackendRoot(projectName) ? 'sz-boot-parent' : defaultRootByScope(scope);
  }
  if (scope === 'script') {
    return defaultRootByScope(scope);
  }
  return projectName || firstSegment || defaultRootByScope(scope);
};

const stripMismatchedRoot = (segments: string[], scope: PreviewScope, root: string) => {
  const firstSegment = segments[0];
  if (!firstSegment || firstSegment === root) {
    return segments;
  }
  if (scope === 'frontend' && isBackendRoot(firstSegment)) {
    return segments.slice(1);
  }
  if (scope === 'backend' && isFrontendRoot(firstSegment)) {
    return segments.slice(1);
  }
  if (scope === 'script' && (isFrontendRoot(firstSegment) || isBackendRoot(firstSegment))) {
    return segments.slice(1);
  }
  return segments;
};

const isFrontendRoot = (segment?: string) => {
  return segment === 'sz-admin';
};

const isBackendRoot = (segment?: string) => {
  return segment === 'sz-boot-parent';
};

const defaultRootByScope = (scope: PreviewScope) => {
  switch (scope) {
    case 'frontend':
      return 'sz-admin';
    case 'backend':
      return 'sz-boot-parent';
    case 'script':
      return 'scripts';
    default:
      return '';
  }
};

const formatRootLabel = (segment: string, scope: PreviewScope) => {
  return `${scopeMeta(scope).rootLabel} · ${segment}`;
};

const downloadCurrent = () => {
  useDownload(downloadZip, '', { tableNames: [parameter.value.tableName] });
};

const copyCurrent = async () => {
  if (!selectedItem.value) {
    return;
  }
  await navigator.clipboard.writeText(selectedCode.value);
  ElMessage.success('已复制当前内容');
};

const generateCurrent = async () => {
  const record = await checkDisk(parameter.value.tableName);
  const data = record.data as GeneratorCheckInfo;
  if (data.errors?.length) {
    ElMessage.error(data.errors[0]);
    return;
  }
  if (data.warnings?.length) {
    await ElMessageBox.confirm(data.warnings.join('\n'), '生成前确认', {
      confirmButtonText: '继续生成',
      cancelButtonText: '取消',
      type: 'warning'
    });
  }
  if (summary.value.skip > 0) {
    await ElMessageBox.confirm(`本次有 ${summary.value.skip} 个已存在文件会跳过，生成器不会覆盖这些文件。`, '跳过确认', {
      confirmButtonText: '继续生成',
      cancelButtonText: '取消',
      type: 'warning'
    });
  }
  await codeGenerator(parameter.value.tableName);
  if (summary.value.skip > 0) {
    ElMessage.warning(`生成完成，已跳过 ${summary.value.skip} 个已存在文件`);
  } else {
    ElMessage.success('生成成功');
  }
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.preview-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  box-shadow: 0 6px 18px rgb(15 23 42 / 4%);
}

.summary-main {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 92px;
  padding: 7px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-left-width: 3px;
  border-radius: 6px;
  background: #ffffff;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.summary-create {
  border-left-color: #22a06b;
}

.summary-create .summary-value {
  color: #168753;
}

.summary-modify {
  border-left-color: #d97706;
}

.summary-modify .summary-value {
  color: #b45309;
}

.summary-skip {
  border-left-color: #64748b;
}

.summary-skip .summary-value {
  color: #475569;
}

.summary-script {
  border-left-color: #7c3aed;
}

.summary-script .summary-value {
  color: #6d28d9;
}

.summary-label,
.summary-target,
.summary-note {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.summary-target {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.summary-note {
  color: var(--el-color-warning);
}

.scope-summary {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.scope-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.scope-pill.scope-backend {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.scope-pill.scope-frontend {
  color: #047857;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.scope-pill.scope-script {
  color: #6d28d9;
  border-color: #ddd6fe;
  background: #f5f3ff;
}

.preview-body {
  display: grid;
  grid-template-columns: minmax(320px, 36%) 1fr;
  gap: 14px;
  min-height: 62vh;
}

.target-panel,
.detail-panel {
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  box-shadow: 0 8px 22px rgb(15 23 42 / 5%);
}

.target-panel {
  display: flex;
  flex-direction: column;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 13px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  background: #fbfdff;
}

.panel-heading span:last-child {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.tree-tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
}

.filter-group :deep(.el-radio-button__inner) {
  height: 26px;
  padding: 5px 10px;
  border-color: var(--el-border-color-lighter);
  font-size: 12px;
}

.tree-scroll {
  height: calc(62vh - 132px);
  padding: 8px;
}

.tree-scroll :deep(.el-tree-node__content) {
  height: 30px;
  border-radius: 6px;
}

.tree-scroll :deep(.el-tree-node__content:hover) {
  background: #f8fafc;
}

.tree-scroll :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background: #eef6ff;
}

.tree-node {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding-left: 7px;
  padding-right: 5px;
}

.tree-node:not(.is-scope-root)::before {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 0;
  width: 3px;
  border-radius: 999px;
  content: '';
  opacity: 0.7;
}

.node-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.node-extra {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.node-scope-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 20px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
}

.node-icon {
  flex: 0 0 auto;
  font-size: 15px;
}

.dir-icon {
  color: #d29a16;
}

.file-icon {
  color: var(--el-text-color-secondary);
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-dir .node-label {
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.is-file .node-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.is-scope-root {
  padding: 0 7px 0 2px;
  border-radius: 6px;
  font-weight: 700;
}

.is-scope-root.scope-backend {
  color: #1d4ed8;
  background: #eff6ff;
}

.is-scope-root.scope-frontend {
  color: #047857;
  background: #f0fdf4;
}

.is-scope-root.scope-script {
  color: #6d28d9;
  background: #f5f3ff;
}

.scope-backend .node-scope-mark {
  color: #ffffff;
  background: #2563eb;
}

.tree-node.scope-backend:not(.is-scope-root)::before {
  background: #60a5fa;
}

.scope-frontend .node-scope-mark {
  color: #ffffff;
  background: #059669;
}

.tree-node.scope-frontend:not(.is-scope-root)::before {
  background: #34d399;
}

.scope-script .node-scope-mark {
  color: #ffffff;
  background: #7c3aed;
}

.tree-node.scope-script:not(.is-scope-root)::before {
  background: #a78bfa;
}

.scope-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.is-file.scope-backend .file-icon {
  color: #3b82f6;
}

.is-file.scope-frontend .file-icon {
  color: #10b981;
}

.is-file.scope-script .file-icon {
  color: #8b5cf6;
}

.detail-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  position: relative;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: #fbfdff;
}

.detail-header::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  content: '';
  background: #94a3b8;
}

.detail-panel.scope-backend .detail-header::before {
  background: #2563eb;
}

.detail-panel.scope-frontend .detail-header::before {
  background: #059669;
}

.detail-panel.scope-script .detail-header::before {
  background: #7c3aed;
}

.detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-name,
.detail-tags {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.detail-name > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scope-badge {
  flex: 0 0 auto;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: #64748b;
}

.detail-panel.scope-backend .scope-badge {
  background: #2563eb;
}

.detail-panel.scope-frontend .scope-badge {
  background: #059669;
}

.detail-panel.scope-script .scope-badge {
  background: #7c3aed;
}

.detail-path-row {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  margin-top: 3px;
}

.detail-path-label {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.detail-path,
.detail-full-path,
.detail-message {
  font-size: 12px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.detail-message {
  margin-top: 4px;
  color: var(--el-color-primary);
}

.code-box {
  width: 100%;
  height: calc(62vh - 98px);
  overflow: auto;
}

@media (max-width: 900px) {
  .preview-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-target {
    justify-content: flex-start;
  }

  .scope-summary {
    justify-content: flex-start;
  }

  .preview-body {
    grid-template-columns: 1fr;
  }

  .tree-scroll,
  .code-box {
    height: 38vh;
  }
}
</style>

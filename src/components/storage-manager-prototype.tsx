"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ArrowBigUpDash,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Edit3,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type PvcStatus = "已挂载" | "创建中" | "异常" | "未使用";
type AccessMode = "单节点读写" | "多节点只读";

type PVC = {
  id: string;
  name: string;
  namespace: string;
  application: string;
  status: PvcStatus;
  capacityGi: number;
  usedGi: number;
  accessMode: AccessMode;
  mountPath: string;
  createdAt: string;
};

type FileNode = {
  id: string;
  name: string;
  type: "目录" | "文件";
  size?: string;
  modifiedAt: string;
  editable?: boolean;
  content?: string;
  children?: FileNode[];
};

type FileTreeRow = {
  node: FileNode;
  depth: number;
  path: string[];
};

type FolderOption = {
  key: string;
  label: string;
  path: string[];
};

type FileSortField = "名称" | "大小" | "修改时间";
type NameSortMode = "首字母" | "类型";
type SortDirection = "asc" | "desc";

const namespaces = ["全部命名空间", "default", "sealos-system", "user-db-proj"] as const;
type NamespaceValue = (typeof namespaces)[number];
type CreatableNamespace = Exclude<NamespaceValue, "全部命名空间">;
const creatableNamespaces = namespaces.filter((namespace) => namespace !== "全部命名空间") as CreatableNamespace[];

const initialPvcs: PVC[] = [
  {
    id: "pvc-1",
    name: "mysql-data",
    namespace: "user-db-proj",
    application: "mysql-prod",
    status: "已挂载",
    capacityGi: 100,
    usedGi: 88,
    accessMode: "单节点读写",
    mountPath: "/var/lib/mysql",
    createdAt: "今天 09:12",
  },
  {
    id: "pvc-2",
    name: "postgres-backup",
    namespace: "default",
    application: "backup-worker",
    status: "已挂载",
    capacityGi: 20,
    usedGi: 2,
    accessMode: "单节点读写",
    mountPath: "/data/backup",
    createdAt: "昨天 18:40",
  },
  {
    id: "pvc-3",
    name: "registry-cache",
    namespace: "sealos-system",
    application: "image-registry",
    status: "创建中",
    capacityGi: 50,
    usedGi: 0,
    accessMode: "单节点读写",
    mountPath: "/cache",
    createdAt: "今天 10:03",
  },
  {
    id: "pvc-4",
    name: "redis-snapshot",
    namespace: "user-db-proj",
    application: "未关联应用",
    status: "未使用",
    capacityGi: 20,
    usedGi: 0,
    accessMode: "单节点读写",
    mountPath: "/data",
    createdAt: "3 天前",
  },
  {
    id: "pvc-5",
    name: "etl-warehouse",
    namespace: "default",
    application: "data-ops",
    status: "异常",
    capacityGi: 100,
    usedGi: 98,
    accessMode: "多节点只读",
    mountPath: "/warehouse",
    createdAt: "今天 07:28",
  },
];

const initialFilesByPvcId: Record<string, FileNode[]> = {
  "pvc-1": [
    {
      id: "mysql-conf",
      name: "my.cnf",
      type: "文件",
      size: "3 KB",
      modifiedAt: "今天 09:40",
      editable: true,
      content: `[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
max_connections = 600
innodb_buffer_pool_size = 2G
slow_query_log = 1
slow_query_log_file = /var/lib/mysql/slow.log
`,
    },
    {
      id: "mysql-data-dir",
      name: "data",
      type: "目录",
      modifiedAt: "今天 09:38",
      children: [
        {
          id: "ibdata1",
          name: "ibdata1",
          type: "文件",
          size: "12.4 GB",
          modifiedAt: "今天 09:38",
        },
        {
          id: "mysql-dir",
          name: "mysql",
          type: "目录",
          modifiedAt: "今天 09:31",
          children: [
            {
              id: "user-frm",
              name: "user.frm",
              type: "文件",
              size: "16 KB",
              modifiedAt: "今天 09:31",
            },
            {
              id: "db-opt",
              name: "db.opt",
              type: "文件",
              size: "1 KB",
              modifiedAt: "昨天 23:18",
              editable: true,
              content: `default-character-set=utf8mb4
default-collation=utf8mb4_general_ci
`,
            },
          ],
        },
      ],
    },
    {
      id: "mysql-log",
      name: "error.log",
      type: "文件",
      size: "240 MB",
      modifiedAt: "今天 09:41",
      editable: true,
      content: `2026-04-22T09:30:12 [Warning] 连接数接近上限
2026-04-22T09:31:03 [Note] 完成 InnoDB 恢复
2026-04-22T09:38:19 [Warning] 磁盘使用率已超过 85%
`,
    },
    {
      id: "mysql-tmp",
      name: "tmp",
      type: "目录",
      modifiedAt: "今天 08:12",
      children: [
        {
          id: "mysql-tmp-file",
          name: "sort_buffer_01.tmp",
          type: "文件",
          size: "48 MB",
          modifiedAt: "今天 08:12",
        },
      ],
    },
  ],
  "pvc-2": [
    {
      id: "backup-dir",
      name: "backup",
      type: "目录",
      modifiedAt: "昨天 18:40",
      children: [
        {
          id: "dump-sql",
          name: "dump-2026-04-21.sql.gz",
          type: "文件",
          size: "1.8 GB",
          modifiedAt: "昨天 18:40",
        },
      ],
    },
  ],
  "pvc-3": [
    {
      id: "init-note",
      name: "初始化中.txt",
      type: "文件",
      size: "1 KB",
      modifiedAt: "今天 10:03",
      editable: true,
      content: `当前卷正在创建中，请稍后刷新查看。`,
    },
  ],
  "pvc-4": [
    {
      id: "empty-dir",
      name: "空目录",
      type: "目录",
      modifiedAt: "3 天前",
      children: [],
    },
  ],
  "pvc-5": [
    {
      id: "etl-conf",
      name: "warehouse.yaml",
      type: "文件",
      size: "5 KB",
      modifiedAt: "今天 07:28",
      editable: true,
      content: `存储配置:
  分区数: 48
  压缩格式: parquet
告警策略:
  使用率阈值: 95
  通知对象: 数据平台值班群
`,
    },
    {
      id: "crash-dir",
      name: "crash",
      type: "目录",
      modifiedAt: "今天 07:10",
      children: [
        {
          id: "crash-log",
          name: "panic.log",
          type: "文件",
          size: "32 MB",
          modifiedAt: "今天 07:10",
          editable: true,
          content: `磁盘写入失败，建议尽快扩容并清理临时文件。`,
        },
      ],
    },
  ],
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getUsagePercent(pvc: PVC) {
  if (pvc.capacityGi === 0) return 0;
  return Math.min(100, Math.round((pvc.usedGi / pvc.capacityGi) * 100));
}

function getProgressTone(percent: number) {
  if (percent > 95) {
    return "[&>div]:bg-destructive";
  }
  return "[&>div]:bg-[#49AEFF]";
}

function sumCapacity(list: PVC[]) {
  return list.reduce((total, pvc) => total + pvc.capacityGi, 0);
}

function sumUsed(list: PVC[]) {
  return list.reduce((total, pvc) => total + pvc.usedGi, 0);
}

function sumWaste(list: PVC[]) {
  return list
    .filter((pvc) => pvc.status === "未使用")
    .reduce((total, pvc) => total + pvc.capacityGi, 0);
}

function getStatusDotColor(status: PvcStatus) {
  switch (status) {
    case "已挂载":
      return "#10b981";
    case "创建中":
      return "#f59e0b";
    case "异常":
      return "#ef4444";
    case "未使用":
    default:
      return "#94a3b8";
  }
}

function getDefaultCreateNamespace(selectedNamespace: NamespaceValue): CreatableNamespace {
  if (selectedNamespace !== "全部命名空间") {
    return selectedNamespace as CreatableNamespace;
  }
  return creatableNamespaces[0];
}

function collectFolderOptions(nodes: FileNode[], prefix: string[] = []): FolderOption[] {
  const options: FolderOption[] = [];
  for (const node of nodes) {
    if (node.type !== "目录") continue;
    const path = [...prefix, node.name];
    options.push({
      key: path.join("/") || "__root__",
      label: `/${path.join("/")}`,
      path,
    });
    options.push(...collectFolderOptions(node.children ?? [], path));
  }
  return options;
}

function addFolderToPath(nodes: FileNode[], targetPath: string[], folder: FileNode): FileNode[] {
  if (targetPath.length === 0) {
    return [folder, ...nodes];
  }

  const [current, ...rest] = targetPath;
  return nodes.map((node) => {
    if (node.type !== "目录" || node.name !== current) {
      return node;
    }

    return {
      ...node,
      children: addFolderToPath(node.children ?? [], rest, folder),
    };
  });
}

function addFileToPath(nodes: FileNode[], targetPath: string[], file: FileNode): FileNode[] {
  if (targetPath.length === 0) {
    return [file, ...nodes];
  }

  const [current, ...rest] = targetPath;
  return nodes.map((node) => {
    if (node.type !== "目录" || node.name !== current) {
      return node;
    }

    return {
      ...node,
      children: addFileToPath(node.children ?? [], rest, file),
    };
  });
}

function getFolderIdsByPath(nodes: FileNode[], path: string[]): string[] {
  if (path.length === 0) return [];
  const ids: string[] = [];
  let currentNodes = nodes;

  for (const segment of path) {
    const target = currentNodes.find((node) => node.type === "目录" && node.name === segment);
    if (!target) break;
    ids.push(target.id);
    currentNodes = target.children ?? [];
  }

  return ids;
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const rounded = size >= 10 || unitIndex === 0 ? Math.round(size) : Number(size.toFixed(1));
  return `${rounded} ${units[unitIndex]}`;
}

function parseSizeToBytes(size?: string): number {
  if (!size || size === "--") return 0;
  const match = size.trim().match(/^([\d.]+)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return 0;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 0;
  const unit = match[2].toUpperCase();
  const powerMap: Record<string, number> = { B: 0, KB: 1, MB: 2, GB: 3, TB: 4 };
  return value * 1024 ** (powerMap[unit] ?? 0);
}

function parseModifiedAtToWeight(modifiedAt: string): number {
  const text = modifiedAt.trim();
  if (text === "刚刚") return Date.now();

  const todayMatch = text.match(/^今天\s+(\d{1,2}):(\d{2})$/);
  if (todayMatch) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(todayMatch[1]), Number(todayMatch[2]), 0, 0);
    return date.getTime();
  }

  const yesterdayMatch = text.match(/^昨天\s+(\d{1,2}):(\d{2})$/);
  if (yesterdayMatch) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, Number(yesterdayMatch[1]), Number(yesterdayMatch[2]), 0, 0);
    return date.getTime();
  }

  const daysAgoMatch = text.match(/^(\d+)\s*天前$/);
  if (daysAgoMatch) {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Number(daysAgoMatch[1]), 12, 0, 0, 0);
    return date.getTime();
  }

  return 0;
}

function getFileTypeRank(node: FileNode): number {
  if (node.type === "目录") return 0;
  const dotIndex = node.name.lastIndexOf(".");
  const extension = dotIndex >= 0 ? node.name.slice(dotIndex + 1).toLowerCase() : "";
  const rankMap: Record<string, number> = {
    cnf: 1,
    conf: 1,
    ini: 1,
    yaml: 2,
    yml: 2,
    json: 3,
    log: 4,
    txt: 5,
    sql: 6,
    gz: 7,
  };
  return rankMap[extension] ?? 99;
}

export default function StorageManagerPrototype() {
  const [pvcsData, setPvcsData] = React.useState<PVC[]>(initialPvcs);
  const [filesByPvcId, setFilesByPvcId] = React.useState<Record<string, FileNode[]>>(initialFilesByPvcId);
  const [selectedNamespace, setSelectedNamespace] = React.useState<NamespaceValue>("全部命名空间");
  const [selectedPvcId, setSelectedPvcId] = React.useState<string | null>(null);
  const [currentPath, setCurrentPath] = React.useState<string[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = React.useState<Set<string>>(new Set());
  const [editorFile, setEditorFile] = React.useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = React.useState("");
  const [expandingPvc, setExpandingPvc] = React.useState<PVC | null>(null);
  const [nextCapacity, setNextCapacity] = React.useState<number[]>([160]);
  const [dashboardPage, setDashboardPage] = React.useState(1);
  const [instanceSearch, setInstanceSearch] = React.useState("");
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [newPvcName, setNewPvcName] = React.useState("");
  const [newNamespace, setNewNamespace] = React.useState<CreatableNamespace>(getDefaultCreateNamespace("全部命名空间"));
  const [newCapacityGi, setNewCapacityGi] = React.useState("20");
  const [newAccessMode, setNewAccessMode] = React.useState<AccessMode>("单节点读写");
  const [createError, setCreateError] = React.useState("");
  const [deletingPvc, setDeletingPvc] = React.useState<PVC | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [newFolderPathKey, setNewFolderPathKey] = React.useState("__root__");
  const [createFolderError, setCreateFolderError] = React.useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [uploadSelectedFile, setUploadSelectedFile] = React.useState<File | null>(null);
  const [uploadPathKey, setUploadPathKey] = React.useState("__root__");
  const [uploadError, setUploadError] = React.useState("");
  const [highlightNodeId, setHighlightNodeId] = React.useState<string | null>(null);
  const [fileSortField, setFileSortField] = React.useState<FileSortField>("修改时间");
  const [fileSortDirection, setFileSortDirection] = React.useState<SortDirection>("desc");
  const [nameSortMode, setNameSortMode] = React.useState<NameSortMode>("首字母");
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 });
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const currentView = selectedPvcId ? "文件浏览器" : "全局大盘";
  const isCompactScreen = viewport.width > 0 && (viewport.width < 1360 || viewport.height < 900);
  const isVeryCompactHeight = viewport.height > 0 && viewport.height < 780;
  const pageSize = isVeryCompactHeight ? 2 : 3;

  React.useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const filteredPvcs = React.useMemo(() => {
    return selectedNamespace === "全部命名空间"
      ? pvcsData
      : pvcsData.filter((pvc) => pvc.namespace === selectedNamespace);
  }, [selectedNamespace, pvcsData]);

  const selectedPvc = React.useMemo(() => {
    return pvcsData.find((pvc) => pvc.id === selectedPvcId) ?? null;
  }, [selectedPvcId, pvcsData]);

  const rootFiles = React.useMemo(() => {
    if (!selectedPvc) return [];
    return filesByPvcId[selectedPvc.id] ?? [];
  }, [filesByPvcId, selectedPvc]);

  const currentFiles = React.useMemo(() => {
    const rows: FileTreeRow[] = [];

    const compareNode = (a: FileNode, b: FileNode) => {
      let result = 0;
      if (fileSortField === "大小") {
        result = parseSizeToBytes(a.size) - parseSizeToBytes(b.size);
      } else if (fileSortField === "修改时间") {
        result = parseModifiedAtToWeight(a.modifiedAt) - parseModifiedAtToWeight(b.modifiedAt);
      } else if (nameSortMode === "类型") {
        const typeRankDiff = getFileTypeRank(a) - getFileTypeRank(b);
        result = typeRankDiff !== 0 ? typeRankDiff : a.name.localeCompare(b.name, "zh-Hans-CN");
      } else {
        result = a.name.localeCompare(b.name, "zh-Hans-CN");
      }
      return fileSortDirection === "asc" ? result : -result;
    };

    const walk = (nodes: FileNode[], depth: number, pathPrefix: string[]) => {
      const orderedNodes = [...nodes].sort(compareNode);
      for (const node of orderedNodes) {
        const path = [...pathPrefix, node.name];
        rows.push({ node, depth, path });
        if (node.type === "目录" && expandedFolderIds.has(node.id) && node.children && node.children.length > 0) {
          walk(node.children, depth + 1, path);
        }
      }
    };
    walk(rootFiles, 0, []);
    return rows;
  }, [expandedFolderIds, fileSortDirection, fileSortField, nameSortMode, rootFiles]);

  const folderOptions = React.useMemo(() => {
    const options: FolderOption[] = [{ key: "__root__", label: "/", path: [] }];
    return [...options, ...collectFolderOptions(rootFiles)];
  }, [rootFiles]);

  const searchedPvcs = React.useMemo(() => {
    const keyword = instanceSearch.trim().toLowerCase();
    if (!keyword) return filteredPvcs;
    return filteredPvcs.filter(
      (pvc) =>
        pvc.application.toLowerCase().includes(keyword) ||
        pvc.name.toLowerCase().includes(keyword),
    );
  }, [filteredPvcs, instanceSearch]);

  const totalCapacity = sumCapacity(filteredPvcs);
  const totalUsed = sumUsed(filteredPvcs);
  const totalWaste = sumWaste(filteredPvcs);
  const totalPages = Math.max(1, Math.ceil(searchedPvcs.length / pageSize));
  const pagedPvcs = searchedPvcs.slice((dashboardPage - 1) * pageSize, dashboardPage * pageSize);

  const estimatedMonthlyIncrease = React.useMemo(() => {
    if (!expandingPvc) return 0;
    const delta = Math.max(0, nextCapacity[0] - expandingPvc.capacityGi);
    return delta * 4;
  }, [expandingPvc, nextCapacity]);

  const openBrowser = React.useCallback((pvc: PVC) => {
    setSelectedPvcId(pvc.id);
    setCurrentPath([]);
    setExpandedFolderIds(new Set());
  }, []);

  const returnToDashboard = React.useCallback(() => {
    setSelectedPvcId(null);
    setCurrentPath([]);
    setExpandedFolderIds(new Set());
  }, []);

  const openEditor = React.useCallback((file: FileNode) => {
    setEditorFile(file);
    setEditorContent(file.content ?? "");
  }, []);

  const openExpandDialog = React.useCallback((pvc: PVC) => {
    setExpandingPvc(pvc);
    setNextCapacity([Math.min(Math.max(pvc.capacityGi + 20, 40), 500)]);
  }, []);

  const openCreateDialog = React.useCallback(() => {
    setCreateError("");
    setNewNamespace(getDefaultCreateNamespace(selectedNamespace));
    setCreateDialogOpen(true);
  }, [selectedNamespace]);

  const openCreateFolderDialog = React.useCallback(() => {
    if (!selectedPvc) return;
    setCreateFolderError("");
    setNewFolderName("");
    const currentKey = currentPath.length > 0 ? currentPath.join("/") : "__root__";
    const matched = folderOptions.some((option) => option.key === currentKey);
    setNewFolderPathKey(matched ? currentKey : "__root__");
    setCreateFolderDialogOpen(true);
  }, [currentPath, folderOptions, selectedPvc]);

  const openUploadDialog = React.useCallback(() => {
    if (!selectedPvc) return;
    setUploadError("");
    setUploadSelectedFile(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
    const currentKey = currentPath.length > 0 ? currentPath.join("/") : "__root__";
    const matched = folderOptions.some((option) => option.key === currentKey);
    setUploadPathKey(matched ? currentKey : "__root__");
    setUploadDialogOpen(true);
  }, [currentPath, folderOptions, selectedPvc]);

  const openDeleteDialog = React.useCallback((pvc: PVC) => {
    setDeleteError("");
    setDeleteConfirmName("");
    setDeletingPvc(pvc);
  }, []);

  const handleDeletePvc = React.useCallback(() => {
    if (!deletingPvc) return;
    const inputName = deleteConfirmName.trim();
    if (!inputName) {
      setDeleteError("请输入存储卷名称以确认删除");
      return;
    }
    if (inputName !== deletingPvc.name) {
      setDeleteError("输入名称不匹配，请重新确认");
      return;
    }

    setPvcsData((prev) => prev.filter((pvc) => pvc.id !== deletingPvc.id));
    if (selectedPvcId === deletingPvc.id) {
      setSelectedPvcId(null);
      setCurrentPath([]);
    }
    setDeletingPvc(null);
    setDeleteConfirmName("");
    setDeleteError("");
  }, [deleteConfirmName, deletingPvc, selectedPvcId]);

  const handleCreatePvc = React.useCallback(() => {
    const normalizedName = newPvcName.trim();
    const capacity = Number(newCapacityGi);

    if (!normalizedName) {
      setCreateError("请填写存储卷名称");
      return;
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      setCreateError("容量需为大于 0 的数字");
      return;
    }

    const duplicated = pvcsData.some(
      (pvc) => pvc.namespace === newNamespace && pvc.name.toLowerCase() === normalizedName.toLowerCase(),
    );
    if (duplicated) {
      setCreateError("同一命名空间下已存在同名存储卷");
      return;
    }

    const nextPvc: PVC = {
      id: `pvc-${Date.now()}`,
      name: normalizedName,
      namespace: newNamespace,
      application: "未关联应用",
      status: "未使用",
      capacityGi: Math.round(capacity),
      usedGi: 0,
      accessMode: newAccessMode,
      mountPath: `/data/${normalizedName}`,
      createdAt: "刚刚",
    };

    setPvcsData((prev) => [nextPvc, ...prev]);
    setCreateDialogOpen(false);
    setNewPvcName("");
    setNewNamespace(getDefaultCreateNamespace(selectedNamespace));
    setNewCapacityGi("20");
    setNewAccessMode("单节点读写");
    setCreateError("");
  }, [newAccessMode, newCapacityGi, newNamespace, newPvcName, pvcsData, selectedNamespace]);

  const handleCreateFolder = React.useCallback(() => {
    if (!selectedPvc) return;
    const normalizedName = newFolderName.trim();
    if (!normalizedName) {
      setCreateFolderError("请填写文件夹名称");
      return;
    }

    const targetOption = folderOptions.find((option) => option.key === newFolderPathKey) ?? folderOptions[0];
    const targetPath = targetOption.path;
    const siblings = targetPath.length === 0
      ? rootFiles
      : targetPath.reduce<FileNode[]>((nodes, segment) => {
          const folder = nodes.find((node) => node.type === "目录" && node.name === segment);
          return folder?.children ?? [];
        }, rootFiles);

    const duplicated = siblings.some((node) => node.type === "目录" && node.name === normalizedName);
    if (duplicated) {
      setCreateFolderError("同一目录下已存在同名文件夹");
      return;
    }

    const folderId = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextFolder: FileNode = {
      id: folderId,
      name: normalizedName,
      type: "目录",
      modifiedAt: "刚刚",
      children: [],
    };

    setFilesByPvcId((prev) => {
      const pvcFiles = prev[selectedPvc.id] ?? [];
      return {
        ...prev,
        [selectedPvc.id]: addFolderToPath(pvcFiles, targetPath, nextFolder),
      };
    });

    const expandedIds = getFolderIdsByPath(rootFiles, targetPath);
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      expandedIds.forEach((id) => next.add(id));
      return next;
    });
    setCurrentPath(targetPath);
    setHighlightNodeId(folderId);
    window.setTimeout(() => {
      setHighlightNodeId((prev) => (prev === folderId ? null : prev));
    }, 1800);
    setCreateFolderDialogOpen(false);
    setNewFolderName("");
    setNewFolderPathKey("__root__");
    setCreateFolderError("");
  }, [folderOptions, newFolderName, newFolderPathKey, rootFiles, selectedPvc]);

  const handleUploadFile = React.useCallback(() => {
    if (!selectedPvc) return;
    if (!uploadSelectedFile) {
      setUploadError("请先选择要上传的文件");
      return;
    }
    const normalizedName = uploadSelectedFile.name.trim();
    if (!normalizedName) {
      setUploadError("文件名称无效，请重新选择");
      return;
    }

    const targetOption = folderOptions.find((option) => option.key === uploadPathKey) ?? folderOptions[0];
    const targetPath = targetOption.path;
    const siblings = targetPath.length === 0
      ? rootFiles
      : targetPath.reduce<FileNode[]>((nodes, segment) => {
          const folder = nodes.find((node) => node.type === "目录" && node.name === segment);
          return folder?.children ?? [];
        }, rootFiles);

    const duplicated = siblings.some((node) => node.name === normalizedName);
    if (duplicated) {
      setUploadError("同一目录下已存在同名文件或文件夹");
      return;
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextFile: FileNode = {
      id: fileId,
      name: normalizedName,
      type: "文件",
      size: formatFileSize(uploadSelectedFile.size),
      modifiedAt: "刚刚",
      editable: /\.(cnf|conf|ini|yaml|yml|json|txt|log)$/i.test(normalizedName),
      content: `# ${normalizedName}\n# 这是模拟上传的文件内容`,
    };

    setFilesByPvcId((prev) => {
      const pvcFiles = prev[selectedPvc.id] ?? [];
      return {
        ...prev,
        [selectedPvc.id]: addFileToPath(pvcFiles, targetPath, nextFile),
      };
    });

    const expandedIds = getFolderIdsByPath(rootFiles, targetPath);
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      expandedIds.forEach((id) => next.add(id));
      return next;
    });
    setCurrentPath(targetPath);
    setHighlightNodeId(fileId);
    window.setTimeout(() => {
      setHighlightNodeId((prev) => (prev === fileId ? null : prev));
    }, 1800);
    setUploadDialogOpen(false);
    setUploadSelectedFile(null);
    setUploadPathKey("__root__");
    setUploadError("");
  }, [folderOptions, rootFiles, selectedPvc, uploadPathKey, uploadSelectedFile]);

  const toggleSortField = React.useCallback((field: FileSortField) => {
    if (fileSortField === field) {
      setFileSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setFileSortField(field);
    setFileSortDirection(field === "修改时间" ? "desc" : "asc");
  }, [fileSortField]);

  React.useEffect(() => {
    setDashboardPage(1);
  }, [selectedNamespace, instanceSearch]);

  React.useEffect(() => {
    if (dashboardPage > totalPages) {
      setDashboardPage(totalPages);
    }
  }, [dashboardPage, totalPages]);

  return (
    <div className="h-[100dvh] overflow-hidden bg-background p-0 text-foreground md:p-2">
      <div className="h-full w-full">
        <div className="relative flex h-full w-full flex-col rounded-none border border-border bg-card text-card-foreground shadow-none md:rounded-[20px] md:shadow-xl">
          <div
            className={cn(
              "relative flex h-full min-h-0 flex-col",
              isCompactScreen ? "px-4 py-3 md:px-8 md:py-4" : "px-4 py-4 md:px-12 md:py-6",
            )}
          >
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent md:inset-x-12" />
            <div className="flex h-full min-h-0 flex-col">
              <section
                className={cn(
                  "origin-top h-full min-h-0 transition-all duration-300",
                  currentView === "全局大盘"
                    ? "block translate-y-0 opacity-100"
                    : "hidden -translate-y-2 opacity-0",
                )}
              >
                <div className={cn("flex h-full min-h-0 flex-col", isCompactScreen ? "gap-3" : "gap-4")}>
                  <div
                    className={cn(
                      "flex flex-col border-b border-border md:flex-row md:items-end md:justify-between",
                      isCompactScreen ? "gap-2 pb-3" : "gap-3 pb-4",
                    )}
                  >
                    <div>
                      <h1 className={cn("font-semibold tracking-tight text-foreground", isCompactScreen ? "text-[26px]" : "text-[28px]")}>存储管家</h1>
                      <p className="mt-1 text-sm text-muted-foreground">统一查看各命名空间的存储卷状态、容量健康度与资源浪费情况。</p>
                    </div>

                    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                      <div className="w-full md:w-60">
                        <Select value={selectedNamespace} onValueChange={(value) => setSelectedNamespace(value as NamespaceValue)}>
                          <SelectTrigger className="relative z-10 h-10 rounded-xl border-border bg-background shadow-sm">
                            <SelectValue placeholder="选择命名空间" />
                          </SelectTrigger>
                          <SelectContent className="z-[90]">
                            {namespaces.map((namespace) => (
                              <SelectItem key={namespace} value={namespace}>
                                {namespace}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={openCreateDialog}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        新建存储卷
                      </Button>
                    </div>
                  </div>

                  <div className={cn("grid md:grid-cols-3", isCompactScreen ? "gap-2.5" : "gap-3")}>
                    <Card className="rounded-2xl border-border shadow-sm">
                      <CardHeader className={cn(isCompactScreen ? "p-3 pb-1.5" : "p-4 pb-2")}>
                        <CardDescription>总分配容量</CardDescription>
                        <CardTitle className={cn(isCompactScreen ? "text-[24px]" : "text-[28px]")}>{totalCapacity} Gi</CardTitle>
                      </CardHeader>
                      <CardContent className={cn("text-sm text-muted-foreground", isCompactScreen ? "p-3 pt-0" : "p-4 pt-0")}>当前筛选范围内已分配的全部持久化容量。</CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                      <CardHeader className={cn(isCompactScreen ? "p-3 pb-1.5" : "p-4 pb-2")}>
                        <CardDescription>已使用容量</CardDescription>
                        <CardTitle className={cn(isCompactScreen ? "text-[24px]" : "text-[28px]")}>{totalUsed} Gi</CardTitle>
                      </CardHeader>
                      <CardContent className={cn("text-sm text-muted-foreground", isCompactScreen ? "p-3 pt-0" : "p-4 pt-0")}>依据存储卷使用率估算的实时已使用空间。</CardContent>
                    </Card>

                    <Card className="rounded-2xl border-border shadow-sm">
                      <CardHeader className={cn(isCompactScreen ? "p-3 pb-1.5" : "p-4 pb-2")}>
                        <CardDescription>闲置资源</CardDescription>
                        <CardTitle className={cn("text-chart-4", isCompactScreen ? "text-[24px]" : "text-[28px]")}>{totalWaste} Gi</CardTitle>
                      </CardHeader>
                      <CardContent className={cn("text-sm text-muted-foreground", isCompactScreen ? "p-3 pt-0" : "p-4 pt-0")}>处于未使用状态、可能造成浪费的已分配容量。</CardContent>
                    </Card>
                  </div>

                  <Card className="flex min-h-0 flex-1 flex-col rounded-2xl border-border bg-muted/30 shadow-sm">
                    <CardHeader className="flex flex-col gap-4 px-5 pb-3 pt-5 md:px-6 md:pt-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                          <CardTitle>存储卷列表</CardTitle>
                          <CardDescription className="mt-3">按使用率、挂载状态和风险等级快速定位需要处理的存储卷。</CardDescription>
                        </div>
                        <div className="relative w-full md:w-[360px] md:shrink-0">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={instanceSearch}
                            onChange={(event) => setInstanceSearch(event.target.value)}
                            className="pl-9"
                            placeholder="可搜索存储卷或挂载实例名称"
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className={cn("flex min-h-0 flex-1 flex-col md:px-6", isCompactScreen ? "px-4 pb-4 pt-3 md:pb-4" : "px-5 pb-5 pt-4 md:pb-6")}>
                      <div className="rounded-xl border border-border bg-card px-5 py-2 shadow-sm md:px-6">
                        <div className="grid min-h-10 grid-cols-[2.2fr_1fr_2fr_1.2fr_1.5fr] items-center gap-4 text-sm font-semibold text-muted-foreground">
                          <div>存储卷名称</div>
                          <div>状态</div>
                          <div>容量与使用率</div>
                          <div>访问模式</div>
                          <div className="text-left">操作</div>
                        </div>
                      </div>

                      <div className={cn(isCompactScreen ? "mt-3 flex flex-col gap-3" : "mt-4 flex flex-col gap-4")}>
                        {pagedPvcs.length > 0 ? pagedPvcs.map((pvc) => {
                          const usagePercent = getUsagePercent(pvc);
                          const isExpandable = usagePercent > 85 || pvc.status === "异常";
                          const canDelete = pvc.status !== "已挂载";

                          return (
                            <div
                              key={pvc.id}
                              className={cn(
                                "grid grid-cols-[2.2fr_1fr_2fr_1.2fr_1.5fr] gap-4 rounded-xl border border-border bg-card px-5 shadow-sm transition-colors hover:bg-accent/40 md:px-6",
                                isCompactScreen ? "py-3.5" : "py-4",
                              )}
                            >
                              <div className="flex items-center gap-3 self-center">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                                  <Database className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">{pvc.name}</div>
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {pvc.application === "未关联应用" ? "当前未关联应用" : `已挂载至：${pvc.application}`}
                                  </div>
                                  <div className="mt-1 text-xs text-muted-foreground/80">{pvc.namespace}</div>
                                </div>
                              </div>

                              <div className="flex items-center self-center">
                                <div className="inline-flex items-center gap-2 text-sm text-foreground">
                                  <span
                                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: getStatusDotColor(pvc.status) }}
                                  />
                                  <span>{pvc.status}</span>
                                </div>
                              </div>

                              <div className="pr-5 self-center">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm leading-none">
                                    <span className="font-medium text-foreground">
                                      {pvc.usedGi} Gi / {pvc.capacityGi} Gi
                                    </span>
                                    <span className={cn("text-[11px] font-medium", usagePercent > 95 ? "text-destructive" : usagePercent > 85 ? "text-chart-4" : "text-muted-foreground")}>
                                      {usagePercent}%
                                    </span>
                                  </div>
                                  <Progress value={usagePercent} className={cn("h-2 bg-muted", getProgressTone(usagePercent))} />
                                </div>
                              </div>

                              <div className="self-center text-sm text-foreground">{pvc.accessMode}</div>

                              <div className="flex items-center justify-start gap-2 self-center">
                                <Button
                                  className="h-9 rounded-lg bg-black px-3 text-sm font-semibold text-white hover:bg-black/90"
                                  onClick={() => openBrowser(pvc)}
                                >
                                  浏览文件
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44 rounded-xl p-2 shadow-lg">
                                    <DropdownMenuItem
                                      className={cn(
                                        "h-9 rounded-md px-2 text-sm",
                                        isExpandable && "text-chart-4",
                                      )}
                                      onClick={() => openExpandDialog(pvc)}
                                    >
                                      <ArrowBigUpDash className="mr-2 h-4 w-4 text-muted-foreground" />
                                      <span>扩容</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={!canDelete}
                                      className="h-9 rounded-md px-2 text-sm text-destructive focus:bg-accent focus:text-destructive data-[disabled]:text-destructive/50"
                                      onClick={() => {
                                        if (canDelete) {
                                          openDeleteDialog(pvc);
                                        }
                                      }}
                                    >
                                      <Trash2
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          canDelete ? "text-destructive" : "text-destructive/50",
                                        )}
                                      />
                                      <span>删除</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground md:px-6">
                            未找到与关键词匹配的存储卷
                          </div>
                        )}
                      </div>

                      <div className={cn("flex flex-col gap-3 border-t border-border sm:flex-row sm:items-center sm:justify-between", isCompactScreen ? "mt-3 pt-3" : "mt-4 pt-4")}>
                        <div className="text-sm text-muted-foreground">
                          {searchedPvcs.length > 0
                            ? `显示第 ${(dashboardPage - 1) * pageSize + 1}-${Math.min(dashboardPage * pageSize, searchedPvcs.length)} 条，共 ${searchedPvcs.length} 条`
                            : "当前无匹配结果"}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-border"
                            disabled={dashboardPage === 1}
                            onClick={() => setDashboardPage((page) => Math.max(1, page - 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">
                            第 {dashboardPage} / {totalPages} 页
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-border"
                            disabled={dashboardPage === totalPages}
                            onClick={() => setDashboardPage((page) => Math.min(totalPages, page + 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section
                className={cn(
                  "origin-top h-full min-h-0 transition-all duration-300",
                  currentView === "文件浏览器"
                    ? "block translate-y-0 opacity-100"
                    : "hidden translate-y-2 opacity-0",
                )}
              >
                {selectedPvc && (
                  <div className="flex h-full min-h-0 flex-col gap-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl px-3 text-muted-foreground md:w-auto"
                        onClick={returnToDashboard}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        返回列表
                      </Button>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={openUploadDialog}>
                          <Upload className="mr-1.5 h-4 w-4" />
                          上传文件
                        </Button>
                        <Button variant="outline" className="rounded-xl border-border" onClick={openCreateFolderDialog}>
                          <Plus className="mr-1.5 h-4 w-4" />
                          新建文件夹
                        </Button>
                      </div>
                    </div>

                    <Card className="flex min-h-0 flex-1 flex-col rounded-2xl border-border shadow-sm">
                      <CardHeader>
                        <CardTitle>文件列表</CardTitle>
                        <CardDescription>支持浏览目录、下载文件、在线编辑配置，并快速识别高风险日志文件。</CardDescription>
                      </CardHeader>
                      <CardContent className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                              <TableRow>
                                <TableHead className="w-[320px] font-semibold text-foreground">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      className="h-7 px-2 text-sm font-semibold text-foreground hover:bg-accent"
                                      onClick={() => toggleSortField("名称")}
                                    >
                                      名称
                                      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-7 px-2 text-xs text-muted-foreground hover:bg-accent">
                                          {nameSortMode}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start" className="w-36 rounded-xl p-2 shadow-lg">
                                        <DropdownMenuItem
                                          className="h-9 rounded-md px-2 text-sm"
                                          onClick={() => {
                                            setNameSortMode("首字母");
                                            setFileSortField("名称");
                                          }}
                                        >
                                          按首字母排序
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="h-9 rounded-md px-2 text-sm"
                                          onClick={() => {
                                            setNameSortMode("类型");
                                            setFileSortField("名称");
                                          }}
                                        >
                                          按类型排序
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableHead>
                                <TableHead className="text-left font-semibold text-foreground">
                                  <Button
                                    variant="ghost"
                                    className="h-7 justify-start px-0 text-sm font-semibold text-foreground hover:bg-accent"
                                    onClick={() => toggleSortField("大小")}
                                  >
                                    大小
                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </TableHead>
                                <TableHead className="text-left font-semibold text-foreground">
                                  <Button
                                    variant="ghost"
                                    className="h-7 justify-start px-0 text-sm font-semibold text-foreground hover:bg-accent"
                                    onClick={() => toggleSortField("修改时间")}
                                  >
                                    最后修改时间
                                    <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </TableHead>
                                <TableHead className="text-left font-semibold text-foreground">操作</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentFiles.length > 0 ? (
                                currentFiles.map(({ node, depth, path }) => {
                                  const isFolder = node.type === "目录";
                                  const hasChildren = Boolean(node.children && node.children.length > 0);
                                  const isExpanded = isFolder && expandedFolderIds.has(node.id);
                                  const isActiveFolder = isFolder && path.join("/") === currentPath.join("/");

                                  return (
                                  <TableRow
                                    key={node.id}
                                    className={cn(
                                      "group cursor-pointer transition-colors hover:bg-accent/40",
                                      highlightNodeId === node.id && "bg-accent/60",
                                    )}
                                    onDoubleClick={() => {
                                      if (!isFolder) return;
                                      setCurrentPath(path);
                                      if (hasChildren) {
                                        setExpandedFolderIds((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(node.id)) {
                                            next.delete(node.id);
                                          } else {
                                            next.add(node.id);
                                          }
                                          return next;
                                        });
                                      }
                                    }}
                                  >
                                    <TableCell>
                                      <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 18}px` }}>
                                        {isFolder ? (
                                          <button
                                            type="button"
                                            className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              setCurrentPath(path);
                                              if (!hasChildren) return;
                                              setExpandedFolderIds((prev) => {
                                                const next = new Set(prev);
                                                if (next.has(node.id)) {
                                                  next.delete(node.id);
                                                } else {
                                                  next.add(node.id);
                                                }
                                                return next;
                                              });
                                            }}
                                          >
                                            {hasChildren ? (
                                              isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
                                            ) : (
                                              <span className="h-3.5 w-3.5" />
                                            )}
                                          </button>
                                        ) : (
                                          <span className="h-5 w-5" />
                                        )}
                                        <div
                                          className={cn(
                                            "rounded-xl p-2",
                                            isFolder ? "bg-sky-100 text-sky-700" : node.editable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600",
                                          )}
                                        >
                                          {isFolder ? (
                                            isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
                                          ) : node.editable ? (
                                            <FileCode2 className="h-4 w-4" />
                                          ) : (
                                            <FileText className="h-4 w-4" />
                                          )}
                                        </div>
                                        <div>
                                          <div
                                            className={cn(
                                              "font-medium",
                                              isFolder && "text-sky-700",
                                              isActiveFolder && "underline decoration-border underline-offset-4",
                                            )}
                                          >
                                            {node.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground/80">
                                            {isFolder ? "目录" : node.editable ? "可在线编辑" : "文件"}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>

                                    <TableCell className="text-left text-sm text-muted-foreground">{node.size ?? "--"}</TableCell>
                                    <TableCell className="text-left text-sm text-muted-foreground">{node.modifiedAt}</TableCell>

                                    <TableCell>
                                      <div className="flex items-center justify-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        {isFolder ? (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-lg text-muted-foreground"
                                            onClick={() => {
                                              setCurrentPath(path);
                                              if (!hasChildren) return;
                                              setExpandedFolderIds((prev) => {
                                                const next = new Set(prev);
                                                if (next.has(node.id)) {
                                                  next.delete(node.id);
                                                } else {
                                                  next.add(node.id);
                                                }
                                                return next;
                                              });
                                            }}
                                          >
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                          </Button>
                                        ) : (
                                          <>
                                            <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground">
                                              <Download className="h-4 w-4" />
                                            </Button>
                                            {node.editable && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-lg text-muted-foreground hover:text-chart-2"
                                                onClick={() => openEditor(node)}
                                              >
                                                <Edit3 className="h-4 w-4" />
                                              </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="rounded-lg text-destructive hover:bg-accent hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                                })
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                                    当前目录为空
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setCreateError("");
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">新建存储卷</DialogTitle>
            <DialogDescription>创建后暂不分配到特定实例，可在后续流程中再进行挂载。</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">存储卷名称</div>
              <Input
                value={newPvcName}
                onChange={(event) => setNewPvcName(event.target.value)}
                placeholder="请输入名称，例如 mysql-cache"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">命名空间</div>
                <Select value={newNamespace} onValueChange={(value) => setNewNamespace(value as CreatableNamespace)}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {creatableNamespaces.map((namespace) => (
                      <SelectItem key={namespace} value={namespace}>
                        {namespace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">容量 (Gi)</div>
                <Input
                  type="number"
                  min={1}
                  value={newCapacityGi}
                  onChange={(event) => setNewCapacityGi(event.target.value)}
                  placeholder="请输入容量"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">访问模式</div>
              <Select value={newAccessMode} onValueChange={(value) => setNewAccessMode(value as AccessMode)}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="单节点读写">单节点读写</SelectItem>
                  <SelectItem value="多节点只读">多节点只读</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createError ? <div className="text-sm text-destructive">{createError}</div> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl border-border" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={handleCreatePvc}>
              创建存储卷
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editorFile)}
        onOpenChange={(open) => {
          if (!open) {
            setEditorFile(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl rounded-3xl border-border p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="text-xl">{editorFile?.name}</DialogTitle>
            <DialogDescription>在线修改配置文件内容，保存后将同步到当前存储卷。</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <Textarea
              value={editorContent}
              onChange={(event) => setEditorContent(event.target.value)}
              className="min-h-[420px] rounded-2xl border-input bg-foreground font-mono text-sm text-background shadow-inner focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" className="rounded-xl border-border" onClick={() => setEditorFile(null)}>
              取消
            </Button>
            <Button className="rounded-xl bg-black text-white hover:bg-black/90">保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createFolderDialogOpen}
        onOpenChange={(open) => {
          setCreateFolderDialogOpen(open);
          if (!open) {
            setCreateFolderError("");
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">新建文件夹</DialogTitle>
            <DialogDescription>
              支持在当前存储卷的根目录或任意已有目录下创建新文件夹。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">文件夹名称</div>
              <Input
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="请输入文件夹名称，例如 backup-2026"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">创建位置</div>
              <Select value={newFolderPathKey} onValueChange={setNewFolderPathKey}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {createFolderError ? <div className="text-sm text-destructive">{createFolderError}</div> : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border"
              onClick={() => {
                setCreateFolderDialogOpen(false);
                setCreateFolderError("");
              }}
            >
              取消
            </Button>
            <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={handleCreateFolder}>
              创建文件夹
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            setUploadError("");
            setUploadSelectedFile(null);
            if (uploadInputRef.current) {
              uploadInputRef.current.value = "";
            }
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">上传文件</DialogTitle>
            <DialogDescription>
              选择本地文件并指定上传路径，模拟上传到当前存储卷。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">选择文件</div>
              <input
                ref={uploadInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setUploadSelectedFile(file);
                  if (file) {
                    setUploadError("");
                  }
                }}
              />
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-accent/40"
                onClick={() => uploadInputRef.current?.click()}
              >
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span>{uploadSelectedFile ? "已选择本地文件" : "点击选择本地文件"}</span>
                </div>
                <span className="text-xs text-muted-foreground">从本地文件管理器选择</span>
              </button>
              {uploadSelectedFile ? (
                <div className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-sm">
                  <div className="font-medium text-foreground">{uploadSelectedFile.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(uploadSelectedFile.size)}</div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">上传路径</div>
              <Select value={uploadPathKey} onValueChange={setUploadPathKey}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {uploadError ? <div className="text-sm text-destructive">{uploadError}</div> : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border"
              onClick={() => {
                setUploadDialogOpen(false);
                setUploadError("");
              }}
            >
              取消
            </Button>
            <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={handleUploadFile}>
              确认上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(expandingPvc)}
        onOpenChange={(open) => {
          if (!open) {
            setExpandingPvc(null);
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">扩容存储卷</DialogTitle>
            <DialogDescription>
              为 {expandingPvc?.name} 调整容量上限，缓解空间不足带来的服务风险。
            </DialogDescription>
          </DialogHeader>

          {expandingPvc && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-accent p-4 text-sm text-accent-foreground">
                当前使用率为 {getUsagePercent(expandingPvc)}%，建议在业务高峰前预留更多空间，避免写入失败或备份中断。
              </div>

              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">目标容量</div>
                    <div className="text-3xl font-semibold text-foreground">{nextCapacity[0]} Gi</div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    当前容量
                    <div className="mt-1 font-medium text-foreground">{expandingPvc.capacityGi} Gi</div>
                  </div>
                </div>

                <Slider
                  value={nextCapacity}
                  onValueChange={setNextCapacity}
                  min={expandingPvc.capacityGi}
                  max={500}
                  step={10}
                />

                <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                  <span className="text-sm text-muted-foreground">预计每月费用将增加</span>
                  <span className="text-xl font-semibold text-foreground">¥{estimatedMonthlyIncrease} 元</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="rounded-xl border-border" onClick={() => setExpandingPvc(null)}>
                  取消
                </Button>
                <Button className="rounded-xl bg-black text-white hover:bg-black/90">确认扩容</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingPvc)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPvc(null);
            setDeleteConfirmName("");
            setDeleteError("");
          }
        }}
      >
        <DialogContent className="max-w-xl rounded-3xl border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">确认删除存储卷</DialogTitle>
            <DialogDescription>
              删除后将无法恢复。请输入存储卷名称以确认删除操作。
            </DialogDescription>
          </DialogHeader>

          {deletingPvc && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-accent p-4 text-sm text-accent-foreground">
                将要删除：<span className="font-semibold text-foreground">{deletingPvc.name}</span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  请输入 <span className="font-semibold">{deletingPvc.name}</span> 进行确认
                </div>
                <Input
                  value={deleteConfirmName}
                  onChange={(event) => setDeleteConfirmName(event.target.value)}
                  placeholder="输入完整存储卷名称"
                />
                {deleteError ? <div className="text-sm text-destructive">{deleteError}</div> : null}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl border-border"
              onClick={() => {
                setDeletingPvc(null);
                setDeleteConfirmName("");
                setDeleteError("");
              }}
            >
              取消
            </Button>
            <Button
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeletePvc}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

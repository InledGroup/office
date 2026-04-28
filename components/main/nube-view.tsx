"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Folder, 
  File as FileIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ArrowLeft,
  MoreVertical,
  Download,
  FolderPlus,
  Loader2,
  X,
  Move,
  Edit2
} from "lucide-react";
import { useExtracted } from "next-intl";
import { cn } from "@/lib/utils";
import { 
  getCloudFiles, 
  getFolders, 
  createFolder, 
  deleteCloudFile, 
  deleteFolder,
  CloudFile,
  CloudFolder,
  moveFile,
  renameFolder,
  getAllFolders,
  renameCloudFile
} from "@/utils/cloud-storage";
import { DocumentIcon } from "@/components/document-icon";
import { formatRelativeTime } from "@/utils/recent-files";
import { useAppStore } from "@/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NubeView() {
  const t = useExtracted();
  const router = useRouter();
  const server = useAppStore((state) => state.server);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<CloudFolder[]>([]);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [path, setPath] = useState<CloudFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [allFolders, setAllFolders] = useState<CloudFolder[]>([]);

  useEffect(() => {
    loadData();
    loadAllFolders();
  }, [currentFolderId]);

  const loadAllFolders = async () => {
    try {
      const f = await getAllFolders();
      setAllFolders(f);
    } catch (e) {
      console.error("Failed to load all folders:", e);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [f, fi] = await Promise.all([
        getFolders(currentFolderId),
        getCloudFiles(currentFolderId)
      ]);
      setFolders(f);
      setFiles(fi);
    } catch (error) {
      console.error("Failed to load cloud storage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName("");
      setIsCreatingFolder(false);
      loadData();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm(t({ id: "confirmDelete", message: "Are you sure you want to delete this file?" }))) return;
    try {
      await deleteCloudFile(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm(t({ id: "confirmDeleteFolder", message: "Are you sure you want to delete this folder and all its content?" }))) return;
    try {
      await deleteFolder(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const handleMoveFile = async (fileId: string, folderId: string | null) => {
    try {
      await moveFile(fileId, folderId);
      loadData();
      loadAllFolders();
    } catch (error) {
      console.error("Failed to move file:", error);
    }
  };

  const handleRenameFile = async (id: string, currentName: string) => {
    const newName = prompt(t({ id: "renamePrompt", message: "Enter new name:" }), currentName);
    if (newName && newName !== currentName) {
      try {
        await renameCloudFile(id, newName);
        loadData();
      } catch (error) {
        console.error("Failed to rename file:", error);
      }
    }
  };

  const handleRenameFolder = async (id: string, currentName: string) => {
    const newName = prompt(t({ id: "renamePrompt", message: "Enter new name:" }), currentName);
    if (newName && newName !== currentName) {
      try {
        await renameFolder(id, newName);
        loadData();
        loadAllFolders();
      } catch (error) {
        console.error("Failed to rename folder:", error);
      }
    }
  };

  const handleOpenFile = async (file: CloudFile) => {
    const f = new File([file.data as BlobPart], file.name, { type: "application/octet-stream" });
    await server.open(f, { cloudId: file.id, fileType: file.type });
    router.push("/editor");
  };

  const navigateToFolder = (folder: CloudFolder | null) => {
    if (folder === null) {
      setCurrentFolderId(null);
      setPath([]);
    } else {
      setCurrentFolderId(folder.id);
      // Update path (very simple implementation)
      setPath(prev => [...prev, folder]);
    }
  };

  const goBack = () => {
    if (path.length === 0) return;
    const newPath = [...path];
    newPath.pop();
    setPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
  };

  const downloadFile = (file: CloudFile) => {
    const blob = new Blob([file.data as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentFolderId && (
            <button 
              onClick={goBack}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold">{t("Cloud Storage")}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            {t("New Folder")}
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-text-secondary overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => navigateToFolder(null)}
          className={cn("hover:text-primary transition-colors", !currentFolderId && "text-primary font-bold")}
        >
          {t("Root")}
        </button>
        {path.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 shrink-0">
            <ChevronRight className="w-4 h-4 opacity-50" />
            <button 
              onClick={() => {
                const newPath = path.slice(0, i + 1);
                setPath(newPath);
                setCurrentFolderId(p.id);
              }}
              className={cn("hover:text-primary transition-colors", currentFolderId === p.id && "text-primary font-bold")}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>

      {isCreatingFolder && (
        <div className="flex items-center gap-3 p-4 bg-muted/40 border border-primary/20 rounded-xl animate-in zoom-in-95 duration-200">
          <Folder className="w-6 h-6 text-primary fill-primary/20" />
          <input
            autoFocus
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            placeholder={t("Folder name...")}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreateFolder}
              className="p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsCreatingFolder(false)}
              className="p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p className="text-sm">{t("Loading your files...")}</p>
        </div>
      ) : (folders.length === 0 && files.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/20 border-2 border-dashed border-border rounded-2xl">
          <Folder className="w-16 h-16 text-text-secondary opacity-20 mb-4" />
          <h3 className="text-lg font-bold text-text-secondary opacity-60">{t("This folder is empty")}</h3>
          <p className="text-sm text-text-secondary opacity-40">{t("Save documents from the editor to see them here")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1">
          {/* Render Folders */}
          {folders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => navigateToFolder(folder)}
              className="group flex items-center justify-between p-4 hover:bg-muted/50 border border-transparent hover:border-border rounded-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Folder className="w-6 h-6 text-primary fill-primary/20" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{folder.name}</p>
                  <p className="text-[10px] text-text-secondary">{formatRelativeTime(folder.updatedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFolder(folder.id, folder.name);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t("Rename")}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("Delete")}
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}

          {/* Render Files */}
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => handleOpenFile(file)}
              className="group flex items-center justify-between p-4 hover:bg-muted/50 border border-transparent hover:border-border rounded-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <DocumentIcon type={file.type} size="sm" />
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-[10px] text-text-secondary">{formatRelativeTime(file.updatedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title={t("Download")}
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFile(file.id, file.name);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t("Rename")}
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                        >
                          <Move className="w-4 h-4" />
                          {t("Move to...")}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="left" className="w-48 p-1 max-h-64 overflow-y-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveFile(file.id, null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded-md truncate"
                        >
                          / {t("Root")}
                        </button>
                        {allFolders.filter(f => f.id !== currentFolderId).map(f => (
                          <button 
                            key={f.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveFile(file.id, f.id);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted rounded-md truncate"
                          >
                            {f.name}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("Delete")}
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

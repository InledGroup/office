import { openDB, IDBPDatabase } from "idb";

export interface CloudFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CloudFile {
  id: string;
  name: string;
  type: string;
  data: ArrayBuffer | Blob | Uint8Array;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

// We don't extend DBSchema anymore to avoid the strict validation error during build
interface NubeDB {
  files: {
    key: string;
    value: CloudFile;
    indexes: { "by-folder": string | null };
  };
  folders: {
    key: string;
    value: CloudFolder;
    indexes: { "by-parent": string | null };
  };
}

const DB_NAME = "nube-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB(): Promise<IDBPDatabase<any>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in the browser"));
  }
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const fileStore = db.createObjectStore("files", { keyPath: "id" });
        fileStore.createIndex("by-folder", "folderId");

        const folderStore = db.createObjectStore("folders", { keyPath: "id" });
        folderStore.createIndex("by-parent", "parentId");
      },
    });
  }
  return dbPromise;
}

// File Operations
export async function saveCloudFile(file: Omit<CloudFile, "createdAt" | "updatedAt">): Promise<CloudFile> {
  const db = await getDB();
  const existing = await db.get("files", file.id);
  const now = Date.now();
  
  const cloudFile: CloudFile = {
    ...file,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  
  await db.put("files", cloudFile);
  return cloudFile;
}

export async function getCloudFile(id: string): Promise<CloudFile | undefined> {
  const db = await getDB();
  return db.get("files", id);
}

export async function getCloudFiles(folderId: string | null = null): Promise<CloudFile[]> {
  const db = await getDB();
  const allFiles = (await db.getAll("files")) as CloudFile[];
  return allFiles.filter(file => file.folderId === folderId);
}

export async function getAllCloudFiles(): Promise<CloudFile[]> {
  const db = await getDB();
  return (await db.getAll("files")) as CloudFile[];
}

export async function deleteCloudFile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("files", id);
}

// Folder Operations
export async function createFolder(name: string, parentId: string | null = null): Promise<CloudFolder> {
  const db = await getDB();
  const now = Date.now();
  const folder: CloudFolder = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    parentId,
    createdAt: now,
    updatedAt: now,
  };
  await db.put("folders", folder);
  return folder;
}

export async function getFolders(parentId: string | null = null): Promise<CloudFolder[]> {
  const db = await getDB();
  const allFolders = (await db.getAll("folders")) as CloudFolder[];
  return allFolders.filter(folder => folder.parentId === parentId);
}

export async function getAllFolders(): Promise<CloudFolder[]> {
  const db = await getDB();
  return (await db.getAll("folders")) as CloudFolder[];
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  
  const subfolders = await getFolders(id);
  for (const f of subfolders) {
    await deleteFolder(f.id);
  }
  
  const files = await getCloudFiles(id);
  for (const f of files) {
    await deleteCloudFile(f.id);
  }
  
  await db.delete("folders", id);
}

export async function renameFolder(id: string, newName: string): Promise<void> {
  const db = await getDB();
  const folder = (await db.get("folders", id)) as CloudFolder | undefined;
  if (folder) {
    folder.name = newName;
    folder.updatedAt = Date.now();
    await db.put("folders", folder);
  }
}

export async function renameCloudFile(id: string, newName: string): Promise<void> {
  const db = await getDB();
  const file = (await db.get("files", id)) as CloudFile | undefined;
  if (file) {
    file.name = newName;
    const newExt = newName.split(".").pop()?.toLowerCase();
    if (newExt && ["docx", "doc", "xlsx", "xls", "pptx", "ppt", "pdf"].includes(newExt)) {
      file.type = newExt;
    }
    file.updatedAt = Date.now();
    await db.put("files", file);
  }
}

export async function moveFile(fileId: string, folderId: string | null): Promise<void> {
  const db = await getDB();
  const file = (await db.get("files", fileId)) as CloudFile | undefined;
  if (file) {
    file.folderId = folderId;
    file.updatedAt = Date.now();
    await db.put("files", file);
  }
}

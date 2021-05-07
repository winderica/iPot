interface FileSystemPermissionDescriptor extends PermissionDescriptor {
  handle: FileSystemHandle;
  mode: 'read' | 'readwrite';
}

interface FileSystemHandlePermissionDescriptor {
  mode: 'read' | 'readwrite';
}

interface FileSystemHandle {
  readonly kind: 'file' | 'directory';
  readonly name: string;

  isSameEntry(other: FileSystemHandle): Promise<boolean>;

  queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;

  requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemCreateWritableOptions {
  keepExistingData: boolean;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';

  getFile(): Promise<File>;

  createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

interface FileSystemGetFileOptions {
  create: boolean;
}

interface FileSystemGetDirectoryOptions {
  create: boolean;
}

interface FileSystemRemoveOptions {
  recursive: boolean;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: 'directory';

  keys(): AsyncIterable<string>;

  values(): AsyncIterable<FileSystemDirectoryHandle | FileSystemFileHandle>;

  entries(): AsyncIterable<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;

  getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;

  getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;

  removeEntry(name: string, options ?: FileSystemRemoveOptions): Promise<undefined>;

  resolve(possibleDescendant: FileSystemHandle): Promise<string[]>;
}

interface WriteParams {
  type: 'write' | 'seek' | 'truncate';
  size?: number;
  position?: number;
  data?: BufferSource | Blob | string;
}

type FileSystemWriteChunkType = BufferSource | Blob | string | WriteParams;

interface FileSystemWritableFileStream extends WritableStream {
  write(data: FileSystemWriteChunkType): Promise<undefined>;

  seek(position: number): Promise<undefined>;

  truncate(size: number): Promise<undefined>;
}

interface FilePickerAcceptType {
  description: string;
  accept: Record<string, string | string[]>;
}

interface FilePickerOptions {
  types: FilePickerAcceptType[];
  excludeAcceptAllOption: boolean;
}

interface OpenFilePickerOptions extends FilePickerOptions {
  multiple: boolean;
}

interface SaveFilePickerOptions extends FilePickerOptions {
}

interface DirectoryPickerOptions {
}

interface Window {
  showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;

  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;

  showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}

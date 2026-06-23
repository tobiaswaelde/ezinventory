declare module 'file-type' {
  export type FileTypeResult =
    | {
        ext: string;
        mime: string;
      }
    | undefined;

  export function fileTypeFromBuffer(buffer: Uint8Array | ArrayBuffer): Promise<FileTypeResult>;
}

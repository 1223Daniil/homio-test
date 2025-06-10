import { FILE_TYPES } from "@/constants";

export const isValidFileType = (file: File, accept: string): boolean => {
  if (!accept) return true;
  const acceptedTypes = accept.split(",").map(type => type.trim());
  return acceptedTypes.some(type => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    if (type.endsWith("/*")) {
      const [mainType] = type.split("/");
      return file.type.startsWith(`${mainType}/`);
    }
    return file.type === type;
  });
};

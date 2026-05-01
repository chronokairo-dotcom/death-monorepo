export function slugify(input: string, opts?: { separator?: string }): string {
  const separator = opts?.separator ?? "-";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "")
    .replace(new RegExp(`${separator}+`, "g"), separator);
}

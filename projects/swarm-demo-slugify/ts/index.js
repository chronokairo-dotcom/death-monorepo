export function slugify(input, opts) {
    const separator = opts?.separator ?? "-";
    return input
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, separator)
        .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "")
        .replace(new RegExp(`${separator}+`, "g"), separator);
}

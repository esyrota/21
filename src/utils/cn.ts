export function cn(...names: (string | null | undefined | false)[]): string {
  return names.filter((value) => !!value && typeof value === 'string').join(' ')
}

/** Resolve a file in public/ using the deployment base path configured in Vite. */
export function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

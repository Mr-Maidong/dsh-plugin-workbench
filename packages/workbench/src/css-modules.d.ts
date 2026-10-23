/** CSS Modules imports resolve to their generated class-name record. */

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

/**
 * Raster asset imports resolve to a `data:` URL in the browser bundle (see
 * `tsdown.client.ts`), not to a shipped file.
 */

declare module '*.webp' {
  const url: string
  export default url
}

declare module '*.png' {
  const url: string
  export default url
}

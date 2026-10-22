/** CSS Modules imports resolve to their generated class-name record. */

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}

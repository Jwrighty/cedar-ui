// Lets tsc resolve `import styles from "./X.module.css"` when emitting
// declarations. Vite supplies the real class map at build time.
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

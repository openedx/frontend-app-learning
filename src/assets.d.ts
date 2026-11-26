// Image imports in TypeScript modules resolve to the asset's URL. This lives under src/, unlike app.d.ts, so that the
// package build (tsconfig.build.json) sees it too.
declare module '*.png' {
  const content: string;
  export default content;
}

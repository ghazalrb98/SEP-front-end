declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_BASE?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};

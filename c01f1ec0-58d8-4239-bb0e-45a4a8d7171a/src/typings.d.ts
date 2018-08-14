/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare const gadget: any;
declare module "*.json" {
  const value: any;
  export default value;
}
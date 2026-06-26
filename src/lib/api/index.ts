import { adversaryTimeApi } from "./adversary-time";
import { assetsApi } from "./assets";
import { catalogsApi } from "./catalogs";
import { methodologyApi } from "./methodology";
import { moslerApi } from "./mosler";
import { projectsApi } from "./projects";

export * from "./client";
export * from "./projects";
export * from "./mosler";
export * from "./adversary-time";
export * from "./catalogs";
export * from "./methodology";
export * from "./assets";

export const api = {
  projects: projectsApi,
  mosler: moslerApi,
  adversaryTime: adversaryTimeApi,
  catalogs: catalogsApi,
  methodology: methodologyApi,
  assets: assetsApi,
};

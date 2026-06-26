import { adversaryTimeApi } from "./adversary-time";
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

export const api = {
  projects: projectsApi,
  mosler: moslerApi,
  adversaryTime: adversaryTimeApi,
  catalogs: catalogsApi,
  methodology: methodologyApi,
};

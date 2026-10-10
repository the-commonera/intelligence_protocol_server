import { SupabaseUploadObject } from "./supadb.js";
import  CodeGenerationEngine from "./code_generation.js";
import {uploadsecret} from "./secretsmanagement.js";


export const rpcMethods = { 
  "templates.register": async (params) => {
    const {
      name,
      tenantid,
      version,
      description,
      capabilities,
      context,
      modeldata,
      webhook_url
    } = params;

    const specKey = `${name}@${version}`;

    const status = await SupabaseUploadObject({
      table: "templates",
      asset: {
        tenantid: tenantid,
        id: specKey,
        version: version,
        description: description,
        capabilities: capabilities,
        context: context,
        modeldata: modeldata,
        webhook_url: webhook_url ?? null,
        registered_at: new Date()
      }
    });

    const secretsarray = [
      {
        key: modeldata.apikeyname,
        value: modeldata.apikeyvalue,
        path: modeldata.apikeypath
      }
    ];

    const response = await uploadsecret(secretsarray);

    if (status && response === true) {
      return {
        status: "registered",
        spec: specKey
      };
    }

    return {
      status: "failed",
      spec: specKey
    };
  },


   "workflow.run": async (params) => {
    const {
      name,
      tenantid,
      goal,
      provider,
      model,
      context
    } = params;

    const WorkflowResponse = await CodeGenerationEngine({
      id: name,
      tenantid,
      goal,
      provider,
      model,
      context
    });

    return {
      response: WorkflowResponse
    };
  }


};

import Fastify from 'fastify';

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {rpcMethods} from './rpcmethods.js';



const fastify = Fastify({ logger: true });




const registerTemplateSchema = {
  
  body: {
    type: "object",
    required: ["name", "version", "description","capabilities","context","webhook_url"],
    properties: {
      name:{type:"string"},
      tenantid:{type:"string"},
      version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
      description:{type:"string",minLength:1},
      capabilities: {
        
        type: "array",
        minItems: 1,
        items: { 
          type: "object", 
          required: ["name", "mcp_url", "apikey"],
          properties: {
            name: { type: "string", minLength: 1 },
            mcp_url: { type: "string"},
            apikey: { type: "string", minLength: 1 }
          },
          additionalProperties: false
        },
      },
      context:{
        type:"object"
      },
      webhook_url: { type: "string", format: "uri" }
    },
    additionalProperties: true,
  },
};




const templatesRegisterRpcSchema = {

  type: "object",
  properties: {
    jsonrpc: { type: "string", enum: ["2.0"] },
    method: { type: "string", enum: ["templates.register"] },
    params: registerTemplateSchema.body,
    id: { type: ["string", "number"] }
  },
  required: ["jsonrpc", "method", "params", "id"]
};



const RunSchema = {
  body:{
  type: 'object',
  required: ['name'], // Automatically returns 400 if 'name' is missing
  properties: {
    name: { type: 'string' },
    tenantid:{type:'string'},
    goal:{type:'string'},
    context:{
       type:"object"
    }
  },
  additionalProperties: true  
  }
};




const workflowRunRpcSchema = {
  type: "object",
  properties: {
    jsonrpc: { type: "string", enum: ["2.0"] },
    method: { type: "string", enum: ["workflow.run"] },
    params: RunSchema.body,
    id: { type: ["string", "number"] }
  },
  required: ["jsonrpc", "method", "params", "id"]
};



await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'API Docs',
      version: '1.0.0'
    },
       components: {
      schemas: {
        TemplatesRegisterRpcRequest: templatesRegisterRpcSchema,
        WorkflowRunRpcRequest: workflowRunRpcSchema
      }
    }
  }
});






fastify.get('/openapi.json', async (request, reply) => {
  return fastify.swagger();
});


fastify.post("/rpc", async (request, reply) => {
  const { jsonrpc, method, params, id } = request.body;

  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32600,
        message: "Invalid Request"
      },
      id: id ?? null
    };
  }

  const handler = rpcMethods[method];

  if (!handler) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32601,
        message: "Method not found"
      },
      id: id ?? null
    };
  }

  try {
    const result = await handler(params ?? {});

    return {
      jsonrpc: "2.0",
      result,
      id
    };
  } catch (error) {
    fastify.log.error(error);

    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error"
      },
      id: id ?? null
    };
  }
});


const start = async () => {
  try {
    const PORT = process.env.PORT || 7860;
    const HOST = '0.0.0.0';
    
    await fastify.listen({ port: PORT, host: HOST });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

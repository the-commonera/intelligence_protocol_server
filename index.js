import Fastify from 'fastify';
import { SupabaseUploadObject ,SupabaseFetchTaskStatus} from "./database/supadb.js";
import backgroundRunner from './background/backgroundrunner.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { encrypt } from './credentials/encryption.js';



const fastify = Fastify({ logger: true });


await fastify.register(fastifySwagger, {

  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Fastify API Documentation',
      description: 'Automated swagger documentation for Fastify',
      version: '1.0.0'
    },
    servers: [{ url: 'http://localhost:3000' }]
  }
}
);

// 2. Register the UI plugin to serve the documentation
await fastify.register(fastifySwaggerUi, {
  routePrefix: '/documentation', // Access via http://localhost:3000/documentation
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
});


const policyTemplateSchema = {
  
  body: {
    type: "object",
    required: ["name", "version","tenantid", "description","capabilities","modeldata","mcp_cred","model_cred","webhook_url"],
    properties: {
      name:{type:"string"},
      version: { type: "string"},
      tenantid:{type:"string"},
      description:{type:"string",minLength:1},
      capabilities: {
        
        type: "array",
        minItems: 1,
        items: { 
          type: "object", 
          required: ["name", "mcp_url"],
          properties: {
            name: { type: "string", minLength: 1 },
            mcp_url: { type: "string"},
          },
          additionalProperties: false
        },
      },
       modeldata:{
        type:"object"
      },
      model_cred:{type:"string"},

      mcp_cred:{

        type: "array",
          minItems: 1,
          items: { 
            type: "object", 
            required: ["mcp_url","apikey"],
            properties: {
              mcp_url: { type: "string", minLength: 1 },
              apikey: { type: "string"},
            },
          additionalProperties: false
        },
      },
      webhook_url: { type: "string", format: "uri" }
    },
    additionalProperties: true,
  },
};




const TenantSchema={
  body:{
    type:'object',
    required:['id','name','organisation','created_at'],
    properties:{
    id:{type:'string'},
    name:{type:'string'},
    organisation:{type:'string'},
    created_at:{type:'string'}
  }
}
}



const RunSchema = {
  body:{
  type: 'object',
  required: ['name','tenantid','goal'],
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




const TaskSchema = {
  body:{
  type: 'object',
  required: ['taskid'],
  properties: {
    taskid: { type: 'string' },
  },
  additionalProperties: true  
  }
};






fastify.post("/register/tenant",{schema:TenantSchema},async (request,reply)=>{

  const {id,name,organisation,created_at}=request.body;
 
  try{
  let status=await SupabaseUploadObject({
    table:"tenants",
    asset:{
      id:id,
      name:name,
      organisation:organisation,
      created_at:created_at
    }});

   if(status==true){
   
    return {
      status:"success",
      message:"Tenant registered successfully"
    }

   }
   else if (status==false){
    return {
      status: "failed",
      message: "Failed to register tenant",
    }
   }



    
}
  catch(e){


    reply.code(500);
    return {
      status: "error",
      message: String(e),
  }
  
}

})




fastify.post("/policy/register",{ schema: policyTemplateSchema },
  
  async (request, reply) => {


  //console.log(request.body)

    
    const { name,tenantid,version,description,capabilities,modeldata,model_cred,mcp_cred,webhook_url} = request.body;

    try {
      const specKey = `${name}@${version}`;
 
      const encrypted_mcp_cred=encrypt(JSON.stringify(mcp_cred))
      const  encrypted_model_cred=encrypt(model_cred)
      
      console.log(mcp_cred)
      console.log(encrypted_mcp_cred)
      
      let status=await SupabaseUploadObject({
        table:"templates",
        asset:{
        id:specKey,
        tenantid:tenantid,
        version:version,
        description:description,
        capabilities:capabilities,
        modeldata:modeldata,
        model_cred:encrypted_model_cred,
        mcp_cred:encrypted_mcp_cred,
        webhook_url: webhook_url ?? null,
        registered_at: new Date(),
      }
      });
      
      if (status ==true){

          return {
            status: "registered",
            spec: specKey,
        };
        
      }
      else {

          return {
            status: "failed",
            spec: specKey,
      };
      
      
      }
    
    } catch (e) {
      reply.code(500);
      return {
        status: "error",
        message: String(e),
      };
    }
    
  }
    
);







fastify.post("/run",{schema:RunSchema},async (request,reply)=>{


    const {name,tenantid,goal,context}=request.body;
    let inputs={
      name:name,
      tenantid:tenantid,
      goal:goal,
      context:context
    }
    backgroundRunner(inputs).catch((err) => {

          fastify.log.error(err, 'Background task failed');

    });

    return {taskid:name,status:"running"}
  
})




fastify.post("/task/status",{schema:TaskSchema},async (request,reply)=>{


    const {taskid}=request.body;
    let taskstatus=SupabaseFetchTaskStatus({documentId:taskid})
    return taskstatus
  
})



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


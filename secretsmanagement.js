import Phase from "@phase.dev/phase-node";

const phase=new Phase(process.env.PHASE_SECRET)

export async function uploadsecret(payload){


  try {
    
    let options={
       appId: "3b7443aa-3a7c-4791-849a-42aafc9cbe66",
       envName: "Production",
       secrets: payload.secrets
    };

    await phase.create(options);
    return true 
    
  }catch(e){

    console.log(e)
    return false
    
  }
  
}




export async function downloadsecret(payload){


  try {

    

  let getOptions = {
   appId: "3b7443aa-3a7c-4791-849a-42aafc9cbe66",
   envName: "Production",
   key: payload.key,
   path:payload.path
 };

 const secret = await phase.get(getOptions);

 return secret
    
  }
  catch(e){

    
  console.log(e)
  return false
    
  }

  
}
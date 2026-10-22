import runSingleTask from "./runSingleTask.js";

export default async function Execute(codeString) {



  const cleanCode = codeString
      .replace(/```(?:javascript|js)?\n?/g, '')
      .replace(/```/g, '')
      .trim();

  console.log("Executing >>",cleanCode)
  
  try {
    const factory = new Function('runSingleTask', `${cleanCode}; return RuntimeCall;`);
    const RuntimeCall = factory(runSingleTask);
    const result = await RuntimeCall();
    console.log("Result:", result);
    return result

  }catch(e){
    console.log(e)
    return false
  }

  
}

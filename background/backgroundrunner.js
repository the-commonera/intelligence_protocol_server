import  CodeGenerationEngine from "../codegeneration/code_generation.js";

export default async function backgroundRunner(inputtask) {


     await CodeGenerationEngine({
          id:inputtask.name,
          tenantid:inputtask.tenantid,
          goal:inputtask.goal,
          context:inputtask.context
        })
    
}

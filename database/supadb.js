import { createClient } from '@supabase/supabase-js'
import 'dotenv/config';

console.log(process.env.SUPABASE_SECRET, process.env.SUPABASE_PUBLISHABLE_KEY, process.env.SUPABASE_DATA_API
);

const SECRET=process.env.SUPABASE_SECRET
const PUBL=process.env.SUPABASE_PUBLISHABLE_KEY
const DATA_API=process.env.SUPABASE_DATA_API


const supabase = createClient(DATA_API,SECRET)







export async function SupabaseUploadObject(p) {
  const { data, error } = await supabase
    .from(p.table)
    .insert(p.asset)
    .select("id")
    .single(); 

  if (error) {
    console.error('❌ Upload failed:', error.message);
    throw new Error(error.message); // <--- Throw so Fastify catches it
  }

  if (!data || !data.id) {
    throw new Error('Insert succeeded, but no ID was returned.');
  }

  return true;
}








export async function SupabaseFetchObjectFromReplay(p){

    const { data, error } = await supabase
    .from('replay')
    .select('id,object')
    .eq('id', p.documentId)
    .eq('tenantid',p.tenantid)
    .single()             

    if (error) {
 
      if (error.code === 'PGRST116') {
          console.log(`ℹ️ No document found with ID: ${documentId}`)
          return null
      }
      console.error('❌ Fetch failed:', error.message)
      return null
    }

    console.log(`📋 Successfully fetched document: "${data}"`)
    return data

  
}


export async function SupabaseFetchObjectFromTemplates(p){

      
    const { data, error } = await supabase
    .from('templates')
    .select("version,id,tenantid,capabilities,webhook_url,registered_at,modeldata")
    .eq('id',p.id)
    .eq('tenantid',p.tenantid)
    .single()             

    if (error) {
 
      if (error.code === 'PGRST116') {
          console.log(`ℹ️ No document found with ID: ${documentId}`)
          return null
      }
      console.error('❌ Fetch failed:', error.message)
      return null
    }

    console.log(`📋 Successfully fetched document:`,data)
    return data


}






export async function SupabaseFetchTaskStatus(p){


    const { data, error } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', p.documentId)
    .single()             

    if (error) {
 
      if (error.code === 'PGRST116') {
          console.log(`ℹ️ No document found with ID: ${documentId}`)
          return null
      }
      console.error('❌ Fetch failed:', error.message)
      return null
    }

    console.log(`📋 Successfully fetched document: "${data}"`)
    return data

  
}





export async function FetchOutputSchemaFromPastRuns(p) {
  
    const { data, error } = await supabase
        .from('tasks')
        .select("output")
        .eq('tool', p.tool)
        .or('output->isError.is.null,output->>isError.eq.false')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('❌ Fetch failed:', error.message);
        return null;
    }

    if (!data || data.length === 0) {
        console.log(`ℹ️ No document found for tool: ${p.tool}`);
        return null;
    }

    const latestRecord = data[0];
    
    console.log(`📋 Successfully fetched document:`, latestRecord);
    return latestRecord;
}



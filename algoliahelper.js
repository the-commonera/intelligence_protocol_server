import { algoliasearch } from "algoliasearch";

const aclient = algoliasearch(process.env.ALGOLIA_ID, process.env.ALGOLIA_SEARCH_KEY);


export default async function AlgoliaUploader(index, meta) {
    try {
        await aclient.saveObject({
            indexName: index,
            body: typeof meta === 'string' ? JSON.parse(meta) : meta
        });
        
        return true;
    } catch (error) {
        console.error("Algolia upload failed:", error);
        return false;
    }
}

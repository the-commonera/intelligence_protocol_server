export default function intentDataPrompt(){
  return `
  Read the user's request provided to you. Pull out every concrete value they mentioned — names, paths,
  content, messages, anything specific — into a flat JSON object. Do not interpret intent beyond
  what they literally said. Output ONLY the JSON object, nothing else.
  Example output shape (yours will have different keys, based on what THIS request mentions):
  { "repoName": "my-app", "filePath": "index.js", "fileContent": "console.log('Hello World');" }
`
}
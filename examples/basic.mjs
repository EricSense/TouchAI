/**
 * TouchAI MVP — Hardware-Aware AI
 * Run: npm install && npm run dev → open #try
 */

console.log(`
TouchAI — Hardware-aware AI · MVP

Try the prototype:
  npm run dev
  open http://localhost:5173/#try

Install the SDK:
  npm install ./sdk

Example:
  import { createTouchAI } from 'touchai-sdk'
  const touch = await createTouchAI()
  const { response, plan } = await touch.runInference('What hardware am I on?')
  console.log(plan.device, plan.dtype, response)
`)

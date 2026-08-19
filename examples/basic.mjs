/**
 * Minimal Hardware-Aware AI example
 * Run from repo root after `npm install`:
 *   node --experimental-vm-modules examples/basic.mjs
 * (Browser APIs required for full scan — use the web app for the real product.)
 */

console.log(`
TouchAI — Hardware-Aware AI

Use the product in a browser:
  npm run dev
  open http://localhost:5173/#use

Install the SDK into your app:
  npm install ./sdk

Example:
  import { createTouchAI } from 'touchai-sdk'
  const touch = await createTouchAI()
  const { response, plan } = await touch.runInference('What hardware am I on?')
  console.log(plan.device, plan.dtype, response)
`)

# TouchAI

**An AI that understands Touch.**

Contact, pressure, motion, and material — read as meaning. Not chat about touch. Touch, understood.

Live: [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

## Experience

Open the site. Touch the sensing field. TouchAI tells you what it felt — gesture, material, pressure, intent — in language.

Ask it: *What did you feel?* · *What material?* · *How hard?* · *What was the intent?*

## Engine

```js
import { createTouchAI } from './src/touchai.js'

const ai = createTouchAI()

ai.sense('start', { x, y, nx, ny, pressure })
ai.sense('move',  { x, y, nx, ny, pressure })
const felt = ai.sense('end')
// felt.text — what TouchAI understood

ai.ask('What material was that?')
```

## Develop

```bash
npm install
npm run dev
```

# TouchAI

**Touch-Aware AI.**

TouchAI is Touch-Aware AI — contact enters awareness as force, motion, and place, then becomes understanding you can ask about.

Live: [touchai-kohl.vercel.app](https://touchai-kohl.vercel.app)

## Run locally

```bash
npm install
npm run dev
```

## API

```js
import { createTouchAI } from './src/touchai.js'

const ai = createTouchAI()

ai.sense('start', { x, y, nx, ny, pressure })
ai.sense('move',  { x, y, nx, ny, pressure })
const aware = ai.sense('end')

ai.ask('What did you last feel?')
```

// jsdom lacks TextEncoder, which react-dom/server needs; imported before it.
import { TextEncoder } from 'util';

Object.assign(globalThis, { TextEncoder });

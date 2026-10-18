import { httpApi } from './http';
import { staticApi } from './static';

export const isStatic = import.meta.env.VITE_STATIC_DATA === 'true';

export const api = isStatic ? staticApi : httpApi;

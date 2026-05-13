import mitt from 'mitt';
import type { BusEvent } from '~/types/events';

export default defineNuxtPlugin(() => {
  const emitter = mitt<BusEvent>();

  return {
    provide: {
      bus: emitter,
    },
  };
});

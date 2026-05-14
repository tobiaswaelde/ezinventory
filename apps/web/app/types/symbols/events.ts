import type { Emitter } from 'mitt';
import type { InjectionKey } from 'vue';
import type { BusEvent } from '~/types/events';

export const EventBus: InjectionKey<Emitter<BusEvent>> = Symbol('bus');

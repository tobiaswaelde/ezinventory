import type { TableEvents } from '~/types/table/events';
import type { UiEvents } from '~/types/ui/events';

export type BusEvent = UiEvents & TableEvents & {};

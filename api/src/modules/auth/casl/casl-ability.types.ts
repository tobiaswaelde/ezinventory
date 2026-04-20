import type { MongoAbility } from '@casl/ability';

export const CASL_ACTIONS = ['manage', 'create', 'read', 'update', 'delete', 'scan', 'stock-out'] as const;
export const CASL_SUBJECTS = ['all', 'Auth', 'Category', 'Item', 'Location', 'Container', 'Stock', 'User'] as const;

export type CaslAction = (typeof CASL_ACTIONS)[number];
export type CaslSubject = (typeof CASL_SUBJECTS)[number];

export type AppAbility = MongoAbility<[CaslAction, CaslSubject]>;

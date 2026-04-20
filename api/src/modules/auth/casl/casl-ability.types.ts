import type { MongoAbility } from '@casl/ability';

export type CaslAction = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'scan' | 'stock-out';
export type CaslSubject = 'all' | 'Auth' | 'Category' | 'Item' | 'Location' | 'Container' | 'Stock' | 'User';

export type AppAbility = MongoAbility<[CaslAction, CaslSubject]>;

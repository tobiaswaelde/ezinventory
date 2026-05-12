import type { UsersEndpoints } from '~/types/api/modules/user';

export type Endpoints = UsersEndpoints;

export type Endpoint = keyof Endpoints;

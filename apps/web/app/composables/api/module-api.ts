import qs from 'qs';
import { useApi } from '~/composables/api/api';
import type { Endpoint, Endpoints } from '~/types/api/endpoints';
import type { PaginatedDto } from '~/types/api/pagination';

/**
 * useModuleApi is a composable that provides methods to interact with a specific module's API.
 *
 * It allows querying, creating, updating, and deleting resources for the specified endpoint.
 * @param {TEndpoint} endpoint The endpoint of the module API to interact with.
 * @returns {Object} An object containing methods for querying, creating, updating, and deleting resources.
 * @template TEndpoint The type of the endpoint, which extends Endpoint.
 */
export const useModuleApi = <TEndpoint extends Endpoint>(endpoint: TEndpoint) => {
  /**
   * Queries the API for a list of items based on the provided query parameters.
   * @param {Record<string, any>} query The query parameters to filter the results.
   * @returns {Promise<PaginatedDto<Endpoints[TEndpoint]['dto']>>} A promise that resolves to the paginated data.
   */
  const query = async (query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().get<PaginatedDto<Endpoints[TEndpoint]['dto']>>(`/${String(endpoint)}${q}`);
  };

  /**
   * Get resource by ID
   * @param {string} id The ID of the resource to retrieve.
   * @param {Record<string, any>} query Additional query parameters.
   * @returns {Promise<Endpoints[TEndpoint]['dto']>} A promise that resolves to the retrieved resource.
   */
  const get = async (id: string, query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().get<Endpoints[TEndpoint]['dto']>(`/${String(endpoint)}/${id}${q}`);
  };

  const count = async (query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().get<number>(`/${String(endpoint)}/count${q}`);
  };

  /**
   * Creates a new resource in the API.
   * @param {Endpoints[TEndpoint]['create']} data The data for the new resource.
   * @param {Record<string, any>} query Additional query parameters.
   * @returns {Promise<Endpoints[TEndpoint]['dto']>} A promise that resolves to the created resource.
   */
  const create = async (data: Endpoints[TEndpoint]['create'], query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().post<Endpoints[TEndpoint]['dto']>(`/${String(endpoint)}${q}`, data);
  };

  /**
   * Updates an existing resource in the API.
   * @param {string} id The ID of the resource to update.
   * @param {Endpoints[TEndpoint]['update']} data The updated data for the resource.
   * @param {Record<string, any>} query Additional query parameters.
   * @returns {Promise<Endpoints[TEndpoint]['dto']>} A promise that resolves to the updated resource.
   */
  const update = async (id: string, data: Endpoints[TEndpoint]['update'], query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().patch<Endpoints[TEndpoint]['dto']>(`/${String(endpoint)}/${id}${q}`, data);
  };

  /**
   * Deletes a resource from the API.
   * @param {string} id The ID of the resource to delete.
   * @param {Record<string, any>} query Additional query parameters.
   * @returns {Promise<Endpoints[TEndpoint]['dto']>} A promise that resolves to the deleted resource.
   */
  const remove = async (id: string, query: Record<string, any> = {}) => {
    const q = qs.stringify(query, {
      encodeValuesOnly: true,
      addQueryPrefix: true,
    });
    return useApi().delete<Endpoints[TEndpoint]['dto']>(`/${String(endpoint)}/${id}${q}`);
  };

  return {
    query,
    get,
    count,
    create,
    update,
    delete: remove,
  };
};

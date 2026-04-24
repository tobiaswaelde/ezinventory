import { PageMetaDTO } from '~/types/pagination/page-meta.dto';

const make = (page: number, perPage: number, itemCount: number) =>
  new PageMetaDTO({ pageOptions: { page, perPage }, itemCount });

describe('PageMetaDTO', () => {
  it('sets page and perPage from options', () => {
    const meta = make(2, 20, 100);
    expect(meta.page).toBe(2);
    expect(meta.perPage).toBe(20);
    expect(meta.itemCount).toBe(100);
  });

  it('calculates pageCount correctly', () => {
    expect(make(1, 10, 100).pageCount).toBe(10);
    expect(make(1, 10, 101).pageCount).toBe(11);
    expect(make(1, 10, 0).pageCount).toBe(0);
    expect(make(1, 10, 5).pageCount).toBe(1);
  });

  it('sets hasPrevPage correctly', () => {
    expect(make(1, 10, 100).hasPrevPage).toBe(false);
    expect(make(2, 10, 100).hasPrevPage).toBe(true);
  });

  it('sets hasNextPage correctly', () => {
    expect(make(1, 10, 100).hasNextPage).toBe(true);
    expect(make(10, 10, 100).hasNextPage).toBe(false);
    expect(make(11, 10, 100).hasNextPage).toBe(false);
  });

  it('handles single page scenario', () => {
    const meta = make(1, 10, 5);
    expect(meta.pageCount).toBe(1);
    expect(meta.hasPrevPage).toBe(false);
    expect(meta.hasNextPage).toBe(false);
  });

  it('handles empty result set', () => {
    const meta = make(1, 10, 0);
    expect(meta.pageCount).toBe(0);
    expect(meta.hasPrevPage).toBe(false);
    expect(meta.hasNextPage).toBe(false);
  });
});

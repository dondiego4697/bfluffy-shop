import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {CatalogSearchProvider} from '$search/catalog-search';
import '$search/catalog-search';

interface Query {
    query: string;
}

const catalogSearchProvider = new CatalogSearchProvider();

export const fullText = wrap<Request, Response>(async (req, res) => {
    const query = (req.query as unknown) as Query;
    const data = await catalogSearchProvider.search(query.query);

    res.json(data);
});

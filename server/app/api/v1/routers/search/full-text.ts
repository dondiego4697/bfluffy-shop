import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {catalogSearchProvider} from '$search/catalog-search';

interface Query {
    text: string;
}

export const fullText = wrap<Request, Response>(async (req, res) => {
    const query = req.query as unknown as Query;
    const data = await catalogSearchProvider.search(query.text);

    res.json(data);
});
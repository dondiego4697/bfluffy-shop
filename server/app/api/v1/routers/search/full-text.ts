import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
import {CatalogSearchProvider} from '$search/catalog-search';

interface Query {
    text: string;
}

const provider = new CatalogSearchProvider();

export const fullText = wrap<Request, Response>(async (req, res) => {
    const query = req.query as unknown as Query;
    const {results: [result]} = await provider.search(query.text);

    const data = result.hits.map((hit) => ({
        searchMeta: hit.searchMeta,
        text: [
            `"${hit._highlightResult?.brand?.value || hit.brand}"`,
            hit._highlightResult?.good?.value || hit.good,
            (hit._highlightResult?.pet?.value || hit.pet).toLowerCase(),
            hit._highlightResult?.weightKg?.value || hit.weightKg,
        ].join(' ')
    }));

    res.json(data);
});
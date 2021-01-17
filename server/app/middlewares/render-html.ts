import {Request, Response} from 'express';
import {wrap} from 'async-middleware';
// import {config} from 'app/config';

export const renderHTML = wrap<Request, Response>(async (_req, res) => {
    // const mobileDetect = new MobileDetect(req.headers['user-agent'] || '');
    // const bundleType = mobileDetect.mobile() ? 'touch' : 'desktop';

    // const renderConfig = {
    //     bundlesUrl: `${config['client.bundlesRootFolder']}${bundleType}`
    // };

    // const clientConfig = JSON.stringify({});

    res.render('desktop', {
        config: {},
        clientConfig: {}
    });
});

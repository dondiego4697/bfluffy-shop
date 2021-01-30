"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHTML = void 0;
const async_middleware_1 = require("async-middleware");
// import {config} from 'app/config';
exports.renderHTML = async_middleware_1.wrap(async (_req, res) => {
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
//# sourceMappingURL=render-html.js.map
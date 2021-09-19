import express from 'express';

import mountRouting from './http/express/routing'

const app = express();

const setupApp = () => {
    mountRouting(app);
    return app;
}

export default setupApp;

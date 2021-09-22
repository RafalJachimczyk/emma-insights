import express from 'express';

import mountRouting from './http/express/routing'

const app = express();

const setupApp = () => {
    app.use(express.json({ limit: '10mb' }));
    mountRouting(app);

    return app;
}

export default setupApp;

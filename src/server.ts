import setupApp from './app';

const port = process.env.API_PORT || 8080;

process.title = 'emma-insights';

const app = setupApp();

app.listen(port, () => {
    console.log(`Server listening on ${port}`)
});

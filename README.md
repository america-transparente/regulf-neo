# regulf-neo
Frontend for [Reguleque](https://reguleque.cl), a search engine for chilean public workers records' as obtained through transparency databases.

## Get started

To run this project locally, install the dependencies and run the local server:

```sh
npm install
npm start
```

Alternatively, you may use [Yarn](https://http://yarnpkg.com/):

```sh
yarn
yarn start
```

Open http://localhost:3000 to see your app.

## Running with Typesense
For the frontend to show results it must be paired with a working [Typesense](https://typesense.org/) instance in the backend. You should also clone [agucova/reguleque-search](reguleque-search), start a Typesense instance and use the provided scripts to load test data. (Make sure to fill in the endpoint and API key in `src/app.js`.

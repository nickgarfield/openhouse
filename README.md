This is the server that powers the Openhouse project. In the future, this repo may get merged with the primary [client repo](https://github.com/nickgarfield/openhouse-client)

# Developer Onboarding

To get started:

We use [Feather](https://feather.id) for Authentication. In order for the server to run locally, you will need to supply a Feather secret key as an env variable.

To get started, make an account w/Feather, and set your Feather secret key as `FEATHER_API_KEY` via an environment variable

```bash
yarn install
FEATHER_API_KEY=<YOUR KEY> node app.js
# now running on localhost:9000
```

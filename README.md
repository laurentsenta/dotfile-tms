# DotfileTms

## Requirements

⚠️ Make sure you have installed all [requirements](./docs/requirements.md)

```bash
cd dotfile-tms
make -C dev-stack certs-generate
make -C dev-stack add-hosts
make -C dev-stack start
npm install
```

## Running

### Start apps

```bash
nx serve tms-api # start & serve API
nx serve tms-app # start & serve App
```

### Run tests

```bash
nx test tms-api # run unit tests
nx test tms-app # run unit tests
nx e2e tms-api-e2e # run e2e tests
```

### Note on e2e tests

We don't cleanup tests between runs yet, so you'll need to:

- Clear the database with `./tools/scripts/db/schema/drop.sh`
- Clear the redis accounts database by remove the `accounts` key in redis (https://redis.dotfile-tms.local/)
- Trigger the database migrations, for example by editing a file in `tms-api` or restarting the `tms-api` server.

## Notes

### Architecture

I "spiked" through nestjs for now to get the scalable architecture down before refactoring to patterns.

### Knowingly wrong idioms

Logging a few tasks, as taking the time to get up to speed with nestjs meant giving up on a few idioms:

- [ ] Move configuration for redis to an external config, and use a keyPrefix, which we can override during e2e tests
- [ ] Move the server's URL to an external config in the frontend
- [ ] Remove overly permissive CORS settings and dig into the traefik config
- [ ] Setup tooling to use camelCase in typescript and snake_case in db and I/Os like APIs (use class-transforms?)
- [ ] Setup a way to spin up a test db during e2e tests to avoid using the dev db or rework the test so they don't step on each other toes.
- [ ] Exposing the metadata fields in the graphql schema -- we'd need to discuss the possible values and implement the resolvers for them. Likely a map key => number, string, date.
- [ ] Improve types sharing (see graphql e2e tests, and most other tests)
  - Fix the GraphQL schema generation, I experienced an infinite loop at the time of testing which was supposed to be fixed in la
  - test versions.
  - Related: https://docs.nestjs.com/graphql/sharing-models
  - Realted: https://www.apollographql.com/docs/react/development-testing/static-typing
- [ ] Rewrite tests to use supertest instead of axios, as seems to be the standard in the nestjs community
- [ ] Use the `@nestjs/config` package to load environment variables and configuration files
- [ ] Look into the `CQRS` module in nestjs, as there are well known recipes in the docs.

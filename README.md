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

## Start apps

```bash
nx serve tms-api # start & serve API
nx serve tms-app # start & serve App
```

## Tasks

### Architecture

Logging a few tasks, as I'm "spiking" through nestjs for now to get the scalable architecture down before refactoring to patterns.

- [ ] APIs are Leaky for now - rethink the rule evaluator vs app controller.
  - [ ] This will break unit-tests and let me clean them up as well. They are mostly cline-generated for now, not very good, but let me 'overspec' to refactor later.

### Idioms

Logging a few tasks, as finding the idioms and patterns in nestjs would prevent me from focusing on the system'ic part of the project.

- [ ] Move the server's URL to an external config in the frontend
- [ ] Remove overly permissive CORS settings and dig into the traefik config
- [ ] In the e2e tests, import the type from the DTO somehow instead of duplicating it
- [ ] Setup tooling to use camelCase in typescript and snake_case in db and IOs (use class-transforms?)
- [ ] Setup a way to spin up a test db during e2e tests to avoid using the dev db
- [ ] Code deduplication in the unit tests (app.controller.spec.ts, etc)
- [ ] Exposing the metadata fields in the graphql schema -- we'd need to discuss the possible values and implement the resolvers for them. Likely a map key => number, string, date.
- [ ] Move around the types correctly (see graphql e2e tests, and most other tests)
  - Related: https://docs.nestjs.com/graphql/sharing-models
  - Realted: https://www.apollographql.com/docs/react/development-testing/static-typing

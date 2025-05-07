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

Logging a few tasks, as finding the idioms and patterns in nestjs would prevent me from focusing on the system'ic part of the project.

- [ ] In the e2e tests, import the type from the DTO somehow instead of duplicating it
- [ ] Setup tooling to use camelCase in typescript and snake_case in db and IOs (use class-transforms?)
- [ ] Setup a way to spin up a test db during e2e tests to avoid using the dev db
- [ ] Code deduplication in the unit tests (app.controller.spec.ts, etc)

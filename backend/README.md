<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

HR System – Payroll Processing & Execution (Milestone 1: Phase 0 – Pre-Run Reviews & Approvals)

This backend provides minimal, working endpoints to support Phase 0 of the Payroll Processing & Execution subsystem:
- Payroll Specialists can list pending pre-run adjustments (signing bonuses, resignation and termination benefits).
- Edit a pending item (amount, currency, note) before approval or rejection.
- Approve or reject each item with a reason (for rejections).
- Seed demo data to simulate integration with upstream subsystems until real integrations arrive.

## Project setup

```bash
$ npm install
```

## Compile and run the project

Create a .env file with your MongoDB connection string and optional server port:

```env
MONGODB_URI=mongodb://localhost:27017/payroll
# Optional: change the server port if 3000 is busy
PORT=3001
```

Port selection behavior:
- If PORT is set in the environment or .env, the app will try to bind to that port. If it is busy, it will automatically try the next available ports (up to 10 more) and start on the first free one.
- If PORT is not set, the app will try 3000 first. If it is busy, it will automatically try the next available port up to 3009 and start on the first free one. The chosen port is printed in the console.

Then run:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints (Phase 0)

- Seed demo data
  - POST http://localhost:3000/payroll.processing/pre-run/seed-demo
- List pending adjustments (optional departmentId and type query)
  - GET http://localhost:3000/payroll.processing/pre-run/pending?departmentId=<mongoId>&type=SIGNING_BONUS|RESIGNATION_BENEFIT
- Create a pre-run adjustment
  - POST http://localhost:3000/payroll.processing/pre-run
  - Body: { "type": "SIGNING_BONUS|RESIGNATION_BENEFIT|TERMINATION_BENEFIT", "employeeId": "<mongoId>", "departmentId": "<mongoId>", "amount": 1000, "currency": "EGP", "note": "optional" }
- Edit a pending adjustment
  - PATCH http://localhost:3000/payroll.processing/pre-run/:id
  - Body: { "amount": 1200, "currency": "EGP", "note": "updated" }
- Approve a pending adjustment
  - POST http://localhost:3000/payroll.processing/pre-run/:id/approve
  - Body: { "actorId": "<userId>" }
- Reject a pending adjustment
  - POST http://localhost:3000/payroll.processing/pre-run/:id/reject
  - Body: { "reason": "not eligible", "actorId": "<userId>" }

## Shared types access across the project

To make common types/enums easily accessible across modules, a shared barrel and TypeScript path alias are provided:

- Alias: @shared
- Barrel file: src/shared/index.ts (re-exports DTO enums like PreRunAdjustmentType, PayrollRunStatus, etc.)

Usage example in any file:

```ts
import { PreRunAdjustmentType, PayrollRunStatus } from '@shared';
```

No breaking changes: existing relative imports continue to work. The alias is optional and available for new code.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# WebSocket Event Catalog

> **Wire format:** `{channel}:{event}`. Server emits events; clients listen with `socket.on('channel:event', handler)`.
>
> Implementation: `emitWSEvent(req, channel, event, data)` in `api/phase2-endpoints.js:32` delegates to `phase2WS.emit(channel, event, data)` in `api/phase2-websocket.js`. The wire-level `type` field is the concatenated `{channel}:{event}` identifier.

## Compliance

Channel: `compliance`. Clients subscribe via `{type: 'phase2.subscribe', channels: ['compliance']}`.

| Event | Wire type | Payload | Emitted by |
|---|---|---|---|
| `updated` | `compliance:updated` | `{repository, compliant, score, issueCount, timestamp}` | `services/compliance/complianceService.js:221` after per-repo compliance check |
| `job-started` | `compliance:job-started` | `{jobId, job}` | `services/compliance/complianceService.js:289` when an async compliance job begins |
| `job-progress` | `compliance:job-progress` | `{jobId, progress, result}` | `services/compliance/complianceService.js:314` after each repo processed in a job |
| `job-completed` | `compliance:job-completed` | `{jobId, job}` | `services/compliance/complianceService.js:324` when a job finishes |
| `job-failed` | `compliance:job-failed` | `{jobId, job, error}` | `services/compliance/complianceService.js:331` on job error |
| `application-started` | `compliance:application-started` | `{repository, template, timestamp}` | `services/compliance/complianceService.js:454` before a template is applied |
| `application-completed` | `compliance:application-completed` | `{repository, template, result, timestamp}` | `services/compliance/complianceService.js:478` after successful template application |
| `application-failed` | `compliance:application-failed` | `{repository, template, error, timestamp}` | `services/compliance/complianceService.js:489` on template application error |

**Route-level request-tracking events** (informational — fired when a route handler is invoked, not lifecycle transitions):

| Event | Wire type | Payload | Emitted by |
|---|---|---|---|
| `status.requested` | `compliance:status.requested` | `{repositoryCount, filters, userId}` | `phase2-endpoints.js` on `GET /compliance/status` |
| `repository.checked` | `compliance:repository.checked` | `{repository, includeHistory, userId}` | `phase2-endpoints.js` on `GET /compliance/repository/:repo` |
| `check.triggered` | `compliance:check.triggered` | `{jobId, repositories, templates, userId}` | `phase2-endpoints.js` on `POST /compliance/check` |
| `templates.requested` | `compliance:templates.requested` | `{templateCount, userId}` | `phase2-endpoints.js` on `GET /compliance/templates` |
| `history.requested` | `compliance:history.requested` | `{applicationCount, filters, userId}` | `phase2-endpoints.js` on `GET /compliance/history` |
| `template.applied` | `compliance:template.applied` | `{repository, templates, results, userId}` | `phase2-endpoints.js` on `POST /compliance/apply` |

## Pipelines

Channel: `pipelines`.

| Event | Wire type | Payload | Emitted by |
|---|---|---|---|
| `pipeline:status` | `pipelines:pipeline:status` | `{runId, repository, workflow, status, timestamp}` | `phase2-endpoints.js` on pipeline status transitions (`/pipelines/:id/execute`, status refresh) |
| `pipeline:triggered` | `pipelines:pipeline:triggered` | `{runId, repository, workflow, branch, userId}` | `phase2-endpoints.js:1810` on `POST /pipelines/trigger` |
| `pipeline:started` | `pipelines:pipeline:started` | `{pipelineId, execution, repository, trigger}` | `phase2-endpoints.js:689` when a pipeline run begins |
| `pipeline:progress` | `pipelines:pipeline:progress` | `{pipelineId, executionId, stage, percentComplete}` | `phase2-endpoints.js:703` on stage-level progress |

## Orchestration

Channel: `orchestration`.

| Event | Wire type | Payload | Emitted by |
|---|---|---|---|
| `progress` | `orchestration:progress` | `{orchestrationId, stage, percentComplete, timestamp}` | `routes/orchestration.js` during profile execution (stage transitions) |
| `completed` | `orchestration:completed` | `{orchestrationId, status, results, timestamp}` | `routes/orchestration.js` when an orchestration terminates (success or failure) |

## Metrics

Channel: `metrics`.

| Event | Wire type | Payload | Emitted by |
|---|---|---|---|
| `updated` | `metrics:updated` | `{totalRuns, successRate, averageDuration, timestamp}` | `phase2-endpoints.js` `/pipelines/metrics` handler on each metrics refresh |

## Other Channels

`templates`, `dependencies`, `quality`, `operations` — existing channels used for lower-volume admin events; see `phase2-websocket.js:21` for the authoritative allowed-events list.

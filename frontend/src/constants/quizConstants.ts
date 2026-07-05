export const QUIZ_STATUS_LABELS = {
  draft: 'DRAFT',
  waiting: 'WAITING',
  active: 'ACTIVE',
  finished: 'FINISHED'
} as const;

export const QUIZ_ACTION_LABELS = {
  DRAFT: 'PUBLISH',
  WAITING: 'START',
  ACTIVE: 'STOP',
  FINISHED: 'START',
  CONTINUE: 'CONTINUE',
  JOIN: 'JOIN'
} as const;

export const EDITABLE_STATUSES = new Set(['draft', 'finished']);
export const NON_EDITABLE_STATUSES = new Set(['active', 'waiting']);
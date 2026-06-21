# np-config

The project's **declarative settings** layer (`@shared/np-config`): the single source of truth for
tunable data, with no live state and no behavior.

- **Domain model types** — `model/` (resources, run-context).
- **Balance / difficulty tuning** — `balance/` (`Balance`, sector & duel params, sector order, pet
  growth, …).
- **Text styles** — `text/` (semantic `TEXT` registry + palette) consumed by the generic text helpers
  in `@shared/np-phaser`.
- **Animation timings** — project-specific durations passed into np-phaser's generic tween helpers.

Rule of thumb: if it's a *number, type, or token you tweak*, it lives here. If it's *state you mutate*
or *rules that run*, it lives in `@shared/np-state` (which imports this lib). np-config never imports
np-state.

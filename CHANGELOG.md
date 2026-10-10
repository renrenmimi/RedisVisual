# Changelog

## 2026-10-09 — audit fixes

An audit of the site covered bugs, UI and UX, accessibility, performance and
the teaching content in both languages. Each fix below is its own pull request,
and all are merged into `main`. The unit tests went from 11 to 16 and the
browser tests from 2 to 23.

### Bugs

- A browser that blocks site storage no longer gets Next's "Application error"
  screen, and cold loads no longer fail to hydrate now and then: the two
  pre-paint scripts moved from `<head>` to the top of `<body>`, and the theme,
  language and rail settings come back from storage after any client
  re-render ([#7]). On production, 7 of 200 cold loads hit React error #418
  before.
- The simulator's LRU eviction keeps the hot key. In the "not enough memory"
  preset it used to evict it on almost every tick, so the hit rate (15%) fell
  below the hot key's own share of the traffic ([#8]).
- `/simulator` hydrates in browsers whose number format is not English, such
  as German or French; Reset cancels a scenario's fault that has not gone in
  yet; faults pressed within one tick all happen ([#13]).
- Stop 6's copy button says so when copying fails ([#12]).

### Accessibility

- The phone drawer and the command palette manage focus, and the closed
  drawer's links leave the tab order ([#9]).
- Text meets 4.5:1 contrast in both themes, including on the dark code cards;
  collapsed answers leave the tab order; glossary definitions close with Esc
  or a press outside, one at a time, and stay on screen; with reduced motion
  the Hash animation shows one value and smooth scrolling is off; step dots
  and sliders are finger-sized, and the sliders have their focus ring
  back ([#11]).
- One `<main>` per page, named buttons and groups, a pressed-state view switch
  on Stop 4 and a translated category label on Stop 7 ([#10]).

### Layout

- Each stop has its own title, unknown addresses get a bilingual 404 page that
  marks no stop as current, and the phone breadcrumb shows the stop's
  name ([#10]).
- Stop 6 stays inside a phone screen on every step ([#12]).
- Auto-play on Stops 1 and 3 stays on each step long enough to read it ([#15]).

### Performance

- The rail no longer prefetches every stop: on production a page load
  transfers about 150–190 kB instead of 317–327 kB ([#14]).
- Stop 1's glow loops play three times and rest instead of repainting for as
  long as a scene is open ([#14]).

### Teaching content

- Glossary: atomicity, persistence defaults, I/O multiplexing and
  streams ([#16]).
- Stop 1: persistence is on by default, how one thread serves many
  connections, and a log-scale latency ladder ([#17]).
- Stop 2: Hash fields can expire since Redis 7.4, the List-as-queue pattern,
  the current ZRANGE forms and the ZSet diagram ([#18]).
- Stop 3: the carrier latencies are given as an order of magnitude ([#19]).
- Stop 4: the lock key and `redis-cli --bigkeys` ([#20]).
- Stop 5: Sentinel failover, RDB defaults, Redis 7's multi-part AOF, Lua
  rollback and fencing tokens ([#21]).
- Stop 6: `docker stop` keeps the data, and a warning before the demo empties
  the database ([#22]).
- Stop 7: the model answers no longer describe an unmeasured 40%; I/O
  multiplexing; register ([#23]).
- Stop 8: the presets and the outage are described the way the engine
  measures them ([#24]).
- Stops 2, 3 and 7 again say that WeShipItNow uses Redis in all three places.
  [#18], [#19] and [#23] had limited the claim to the rate cache; the owner has
  since confirmed that all three were built ([#27]); the README's Stop 3 line
  says so again too ([#31]).

### Tests

- The TTL-jitter browser test runs the simulator's tick interval on
  Playwright's fake clock, so both runs replay exactly the same ticks. On real
  time the number of ticks between clicks varied, and the two peaks once tied
  in CI ([#30]).

### Not changed

- English is the default language and readers switch to Chinese by hand; a
  reader who chose Chinese briefly sees English on first paint.
- Stop 2's String demo and the demos on Stops 3–5 still loop while they are
  on screen.
- The tab bars on Stops 2, 3, 5 and 7 have no arrow-key movement or tab
  panels; they work with Tab and Enter.
- The current scene or step is not kept across a reload.

[#7]: https://github.com/renrenmimi/RedisVisual/pull/7
[#8]: https://github.com/renrenmimi/RedisVisual/pull/8
[#9]: https://github.com/renrenmimi/RedisVisual/pull/9
[#10]: https://github.com/renrenmimi/RedisVisual/pull/10
[#11]: https://github.com/renrenmimi/RedisVisual/pull/11
[#12]: https://github.com/renrenmimi/RedisVisual/pull/12
[#13]: https://github.com/renrenmimi/RedisVisual/pull/13
[#14]: https://github.com/renrenmimi/RedisVisual/pull/14
[#15]: https://github.com/renrenmimi/RedisVisual/pull/15
[#16]: https://github.com/renrenmimi/RedisVisual/pull/16
[#17]: https://github.com/renrenmimi/RedisVisual/pull/17
[#18]: https://github.com/renrenmimi/RedisVisual/pull/18
[#19]: https://github.com/renrenmimi/RedisVisual/pull/19
[#20]: https://github.com/renrenmimi/RedisVisual/pull/20
[#21]: https://github.com/renrenmimi/RedisVisual/pull/21
[#22]: https://github.com/renrenmimi/RedisVisual/pull/22
[#23]: https://github.com/renrenmimi/RedisVisual/pull/23
[#24]: https://github.com/renrenmimi/RedisVisual/pull/24
[#27]: https://github.com/renrenmimi/RedisVisual/pull/27
[#30]: https://github.com/renrenmimi/RedisVisual/pull/30
[#31]: https://github.com/renrenmimi/RedisVisual/pull/31

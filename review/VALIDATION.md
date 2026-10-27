# Forgotten Kana City — local review

- Original PNG sources and design bundle preserved. Only optimized derivative WebPs are bundled in the application.
- 16/16 Node tests passed, covering both syllabaries, scoring, mistakes, long vowels, SRS and separate progress.
- Vite production build and standalone HTML export passed.
- Chromium browser flows passed: both alphabets; correct/incorrect Enter submissions; automatic advance only after success; weak filter; dialog open/Escape close; progress after reload; JSON export; reset scoped to the active alphabet.
- Responsive checks passed at 320, 390, 768 and 1440 CSS pixels; no horizontal overflow. Mobile uses its portrait asset and hides foreground/particles.
- Effects toggle preserves typed input and persists after reload. OS reduced-motion overrides enabled preference. Scene is hidden from accessibility and cannot intercept pointer events.
- Eight alphabet switches retained the same document listener counts and exactly one backdrop. A burst of 20 pointer events scheduled one rAF. Simulated document visibility change canceled pending rAF and disabled decorative movement.
- Daily-goal celebration fires on crossing the threshold and does not replay after reload.
- axe-core WCAG 2 A/AA and 2.1 AA scan reported no violations in initial, incorrect-answer, SRS-modal and mobile states after transition completion. Transparent/image-backed elements generate incomplete automatic contrast results; those need visual/manual assessment. The text palette uses bright foregrounds on 94–97% opaque dark surfaces; screenshots were visually inspected. This is not a full accessibility certification.
- Tested with Chromium on Linux; Safari/iOS hardware and low-end-device performance have not been measured. Visibility was simulated by overriding document.hidden and dispatching visibilitychange in the test.
- Screenshots: city-desktop.png and city-mobile.png. Full-page capture shows the fixed background only within its initial viewport; the live background stays fixed during scrolling.
- This validation was completed locally before the GitHub release. Public Vercel deployment status must be checked in the Vercel dashboard.

## Hover and scroll update

- Cards brighten on mouse hover; secondary cards lift 3 px and scale to 1.012. Quiz, chart and kana retain stable dimensions.
- Below-fold sections start hidden without an initial fade-out and reveal once near the viewport. Above-fold content remains visible from the start.
- Dedicated production-browser checks passed for hover color/scale, scroll entry, no replay after alphabet changes, observer cleanup, keyboard focus, reduced motion and effects-toggle behavior. Mobile reveal checked at 320/390/768 px.
- `tests/city-reveal-browser.cjs` instruments IntersectionObserver and confirms at most one observer retains targets after repeated renders; all targets are disconnected when effects are disabled.
- Screenshots now scroll through the page before capture, showing the revealed final state. Use the standalone HTML to experience hover and scroll transitions.

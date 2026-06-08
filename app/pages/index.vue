<script setup lang="ts">
// ---- transparent hero nav ----
const heroNav = useHeroNav()
let scrollHandler: (() => void) | null = null

onMounted(() => {
  const hero = document.querySelector<HTMLElement>('.hero')
  if (!hero) return
  scrollHandler = () => {
    heroNav.value = window.scrollY < hero.offsetHeight - 80
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  scrollHandler() // set correct state immediately on mount
})

onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  heroNav.value = false // revert when navigating away
})

</script>

<template>
  <!-- ===================== HERO ===================== -->
  <header class="hero">

    <!-- full-bleed background image -->
    <div class="hero__bg">
      <img
        src="/images/scenery/room.jpg"
        alt="The room — RE:FORM, 3 Upper Main Street"
        loading="eager"
      />
    </div>

    <div class="hero__top">
      <div class="meta">
        <div class="stack">
          <div class="label">Est<span class="colon">:</span> 2026</div>
          <div class="sub-meta">Formerly Two Brothers</div>
        </div>
        <div class="stack">
          <div class="label">Location</div>
          <div class="sub-meta loc">Larne, N. Ireland</div>
        </div>
      </div>
      <div class="stack right">
        <div class="label">Vol<span class="colon">:</span> 01</div>
        <div class="sub-meta muted">A new chapter</div>
      </div>
    </div>

    <div class="hero__center">
      <div class="hero__copy">
        <div class="hero__eyebrow">
          <span class="dot" />
          <span class="label"
            >Now Open <span class="colon">·</span> 3 Upper Main Street</span
          >
        </div>
        <h1>
          RE<span class="colon">:</span>FINED.<br />
          RE<span class="colon">:</span>LOCATED.
        </h1>
        <p class="hero__sub">
          A barbershop reset. Same hands, sharper room. The work that earned
          five hundred reviews — now under a name that fits the craft.
        </p>
        <div class="hero__cta-row">
          <NuxtLink class="btn btn--solid" to="/book"
            >Book Now <span class="arrow">→</span></NuxtLink
          >
          <a class="btn" href="#services">The Work</a>
        </div>
      </div>
    </div>

    <div class="hero__bottom">
      <div class="stack">
        <div class="label">Address</div>
        <div class="big">3 Upper Main Street<br />Larne, BT40</div>
      </div>
      <div class="stack">
        <div class="label">This Week</div>
        <div class="big">
          Open Today<br /><span class="open-sub">until 16:30</span>
        </div>
      </div>
      <div class="actions">
        <a class="btn" href="#services">The Work</a>
        <NuxtLink class="btn btn--solid" to="/book"
          >Book Now <span class="arrow">→</span></NuxtLink
        >
      </div>
    </div>
  </header>

  <!-- ===================== ABOUT / TEAM ===================== -->
  <section id="about">
    <div class="sec-head">
      <div>
        <div class="num">— 01 / The Room</div>
        <h2>Same team.<br />New <em>direction</em>.</h2>
      </div>
      <div class="lede">
        Two Brothers built a name on consistency — five hundred-plus reviews,
        regulars across three towns. RE<span class="colon">:</span>FORM is the
        same hands working in a room that finally matches the work.
      </div>
    </div>

    <p class="about-statement">
      A barbershop is a room, a chair, and a half hour of attention. We
      <em>kept the half hour</em>. Everything else, we re<span class="colon"
        >:</span
      >built.
    </p>

    <div class="sec-head team-head">
      <div>
        <div class="num">— 02 / The Chairs</div>
        <h2>Behind<br />the chair.</h2>
      </div>
      <div class="lede">
        Three barbers. One standard. Book by name or by the next available chair
        — the cut is the same.
      </div>
    </div>

    <BarberGrid />
  </section>

  <!-- ===================== SERVICES ===================== -->
  <section class="services" id="services">
    <div class="sec-head">
      <div>
        <div class="num">— 03 / The Work</div>
        <h2>Six cuts.<br />One standard.</h2>
      </div>
      <div class="lede">
        A short menu, walked through carefully. Every booking includes the
        consultation, the cut, and a finish — no upsell, no hidden tier.
      </div>
    </div>

    <ServiceMenu />
  </section>

  <!-- ===================== VISIT ===================== -->
  <section class="visit">
    <div>
      <div class="label" style="margin-bottom: 16px">— 04 / The Room</div>
      <h3>Find<span class="colon">:</span><br />the chair.</h3>
      <p class="visit__lede">
        First door past the square, ground floor. Walk-ins welcome when the
        chair allows; the booking sheet has the right of way.
      </p>
      <NuxtLink class="btn btn--solid" to="/book"
        >Book Now <span class="arrow">→</span></NuxtLink
      >
    </div>

    <div class="info-block">
      <div class="info-row">
        <span class="k">Address</span>
        <span class="v">
          <span class="line">3 Upper Main Street</span>
          <span class="line">Larne, Co. Antrim</span>
          <span class="line">BT40, Northern Ireland</span>
        </span>
      </div>
      <div class="info-row">
        <span class="k">Hours</span>
        <span class="v">
          <div class="hours-grid">
            <span class="d">Mon</span><span>09:30 — 16:30</span>
            <span class="d">Tue–Wed</span><span>09:00 — 16:30</span>
            <span class="d">Thu</span><span>09:30 — 19:00</span>
            <span class="d">Fri</span><span>09:00 — 16:30</span>
            <span class="d">Sat</span><span>07:30 — 14:30</span>
            <span class="d">Sun</span><span class="closed">Closed</span>
          </div>
        </span>
      </div>
      <div class="info-row">
        <span class="k">Contact</span>
        <span class="v"><span class="line">Info@reformbarber.co.uk</span></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ---- hero ---- */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 110px 36px 36px;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  /* hero is always a dark-overlay photo surface — force light text */
  color: #f4efe6;
}

/* all in-flow hero children sit above the scrim (z-index 1) */
.hero > * {
  position: relative;
  z-index: 2;
}

/* legibility scrim — fixed dark overlay so the photo recedes in both themes.
   Left (text) area lands ~0.55 effective; image centre ~0.40; bottom strip ~0.85. */
.hero::before {
  content: "";
  position: absolute; inset: 0;
  z-index: 1;
  background:
    linear-gradient(to right,  rgba(0,0,0,0.65) 0%,  rgba(0,0,0,0.48) 38%, rgba(0,0,0,0.28) 68%, rgba(0,0,0,0.48) 100%),
    linear-gradient(to bottom, rgba(0,0,0,0.48) 0%,  rgba(0,0,0,0.20) 28%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.74) 100%);
  pointer-events: none;
}

/* ---- full-bleed static hero background image ---- */
.hero__bg {
  position: absolute; inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--ink);
}
.hero__bg img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center;
  filter: grayscale(0.1) contrast(1.03) brightness(0.92);
}

/* ---- hero top metadata strip ---- */
.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 24px;
}
.hero__top .meta {
  display: flex;
  gap: 60px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stack.right {
  text-align: right;
}

.sub-meta {
  font-size: 13px;
  color: rgba(244,239,230,0.62);
}
.sub-meta.loc {
  color: #f4efe6;
}
.muted {
  color: rgba(244,239,230,0.62);
}

/* ---- hero center copy (single column) ---- */
.hero__center {
  display: grid;
  grid-template-columns: minmax(0, 720px);
  align-items: center;
  padding: 40px 0;
}
.hero__copy {
  display: flex;
  flex-direction: column;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.hero__eyebrow .dot {
  width: 6px;
  height: 6px;
  background: var(--brass);
  border-radius: 50%;
  display: inline-block;
}

.hero h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(40px, 6.4vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin-top: 28px;
  max-width: 460px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(244,239,230,0.85);
}
.hero__cta-row {
  margin-top: 36px;
  display: flex;
  gap: 12px;
}
/* outline CTAs need a visible border + text on the dark overlay */
.hero .btn:not(.btn--solid) {
  color: #f4efe6;
  border-color: rgba(244,239,230,0.5);
}
.hero .btn:not(.btn--solid):hover {
  background: rgba(244,239,230,0.1);
  border-color: rgba(244,239,230,0.8);
}

/* ---- hero bottom info strip ---- */
.hero__bottom {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  align-items: end;
  padding-top: 32px;
  border-top: 1px solid var(--rule);
}
.big {
  font-family: var(--serif);
  font-size: 22px;
  line-height: 1.2;
}
.open-sub {
  font-size: 14px;
  font-family: var(--grot);
  color: rgba(244,239,230,0.62);
}
.actions {
  justify-self: end;
  display: flex;
  gap: 12px;
}

/* ---- about ---- */
.about-statement {
  font-family: var(--serif);
  font-size: clamp(28px, 3.6vw, 52px);
  line-height: 1.15;
  letter-spacing: -0.01em;
  max-width: 1100px;
  margin-bottom: 100px;
}
.about-statement em {
  font-style: italic;
  color: var(--brass);
}
.team-head {
  margin-bottom: 60px;
}

/* ---- services ---- */
.services {
  background: #060606;
}

/* ---- visit ---- */
.visit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  padding: 120px 36px;
  border-top: 1px solid var(--rule);
}
.visit h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 0.95;
  letter-spacing: -0.015em;
  margin-bottom: 32px;
}
.visit__lede {
  color: var(--bone-dim);
  max-width: 42ch;
  margin-bottom: 32px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.info-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 24px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
}
.info-row:last-child {
  border-bottom: 0;
}
.info-row .k {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding-top: 3px;
}
.info-row .v {
  font-size: 15px;
  line-height: 1.5;
}
.info-row .v .line {
  display: block;
}

.hours-grid {
  display: grid;
  grid-template-columns: 70px 1fr;
  column-gap: 28px;
  row-gap: 6px;
  font-size: 15px;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}
.hours-grid .d {
  color: var(--bone-dim);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  align-self: center;
}
.hours-grid .closed {
  color: var(--bone-dim);
  font-style: italic;
}

.colon {
  color: var(--brass);
}
.num {
  font-family: var(--grot);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--bone-dim);
}

@media (max-width: 900px) {
  .hero {
    padding: 100px 22px 28px;
  }
  .hero__top {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }
  .hero__top .meta {
    gap: 36px;
  }
  .hero__center {
    grid-template-columns: 1fr;
    padding: 28px 0;
  }
  .hero__bottom {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .actions {
    justify-self: start;
  }
  .visit {
    grid-template-columns: 1fr;
    gap: 48px;
    padding: 80px 22px;
  }
}
</style>

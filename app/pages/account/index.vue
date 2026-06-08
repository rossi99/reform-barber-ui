<script setup lang="ts">
definePageMeta({ accountRole: undefined })
useHead({ title: 'Account — RE:FORM Hair & Culture' })

const activePane = ref<'signin' | 'register'>('signin')

const roles = [
  {
    id: 'customer',
    num: '01',
    label: 'Customer',
    title: 'The ledger',
    blurb: 'Your appointments, fees, and the house rules — kept tidy.',
    href: '/account/customer',
  },
  {
    id: 'barber',
    num: '02',
    label: 'Barber',
    title: 'The chair',
    blurb: 'Today\'s diary, your register, and the late book.',
    href: '/account/barber',
  },
  {
    id: 'founder',
    num: '03',
    label: 'Founder',
    title: 'The house',
    blurb: 'Every chair. Hours, services, gallery — yours to set.',
    href: '/account/founder',
  },
] as const

function handleSubmit(e: Event, kind: 'signin' | 'register') {
  e.preventDefault()
  const btn = (e.currentTarget as HTMLFormElement).querySelector('button[type=submit]') as HTMLButtonElement | null
  if (!btn) return
  btn.textContent = kind === 'signin' ? 'Welcome back →' : 'Account opened ✓'
}
</script>

<template>
  <main class="account-hub">
    <!-- Role switcher header -->
    <section class="hub-head">
      <div class="hub-head__inner">
        <div class="topline">
          <div class="label">— Vol<span class="colon">:</span> 00 / The Door</div>
          <div class="label">Pick a view <span class="colon">·</span> sign in below</div>
        </div>
        <h1>Open the <em>door.</em></h1>
        <p class="lede">Three doors, one shop. Pick the chair you sit in, or sign in with email to skip the picker.</p>
      </div>
    </section>

    <!-- Role cards -->
    <section class="roles">
      <div class="roles__inner">
        <NuxtLink
          v-for="r in roles"
          :key="r.id"
          :to="r.href"
          class="role-card"
        >
          <div class="role-card__head">
            <span class="role-card__num">/ {{ r.num }}</span>
            <span class="role-card__role">{{ r.label }}</span>
          </div>
          <h2 class="role-card__title">{{ r.title }}<span class="colon">.</span></h2>
          <p class="role-card__blurb">{{ r.blurb }}</p>
          <span class="role-card__cta">Open <span class="arrow">→</span></span>
        </NuxtLink>
      </div>
    </section>

    <!-- Sign-in / register form -->
    <section class="signin-strip">
      <div class="signin-strip__inner">
        <aside class="ledger">
          <div class="ledger__head">
            <div class="label-sm">— Vol<span class="colon">:</span> 01 / The Ledger</div>
            <h2>Or sign in<br /><em>by email.</em></h2>
            <p>One account holds your bookings, the chair you prefer, and the work we've done together.</p>
          </div>

          <div class="ledger__lines">
            <div class="row"><span class="k">Held by</span><span class="v">RE<span class="colon">:</span>FORM</span><span class="meta">Larne</span></div>
            <div class="row"><span class="k">Booking</span><span class="v">In-house</span><span class="meta">Direct</span></div>
            <div class="row"><span class="k">Privacy</span><span class="v">Email only</span><span class="meta">No spam</span></div>
          </div>

          <div class="ledger__foot">
            <span>3 Upper Main St <span class="colon">·</span> Larne</span>
            <span>Est<span class="colon">:</span> 2026</span>
          </div>

          <span class="ledger__mono" aria-hidden="true">:</span>
        </aside>

        <section class="form-side">
          <div class="tabs">
            <button :class="{ active: activePane === 'signin' }" @click="activePane = 'signin'">Sign In</button>
            <button :class="{ active: activePane === 'register' }" @click="activePane = 'register'">Open Account</button>
          </div>

          <div v-show="activePane === 'signin'" class="pane">
            <h3>Sign in.</h3>
            <p class="sub">Email and password. Nothing else.</p>

            <form @submit="(e) => handleSubmit(e, 'signin')">
              <div class="field">
                <label for="email-in">Email</label>
                <input id="email-in" type="email" placeholder="you@domain.com" autocomplete="email" />
              </div>
              <div class="field">
                <label for="pw-in">Password <a href="#" class="forgot">Forgot?</a></label>
                <input id="pw-in" type="password" placeholder="••••••••" autocomplete="current-password" />
              </div>
              <label class="check">
                <input type="checkbox" checked />
                <span>Keep me signed in on this device.</span>
              </label>
              <button type="submit" class="btn btn--solid btn--full">Log In <span class="arrow">→</span></button>
            </form>

            <div class="switch-line">
              New here? <a href="#" @click.prevent="activePane = 'register'">Open an account</a>
            </div>
          </div>

          <div v-show="activePane === 'register'" class="pane">
            <h3>Open an account.</h3>
            <p class="sub">For booking, history, and the chair you prefer.</p>

            <form @submit="(e) => handleSubmit(e, 'register')">
              <div class="row-2">
                <div class="field">
                  <label for="first">First name</label>
                  <input id="first" type="text" autocomplete="given-name" />
                </div>
                <div class="field">
                  <label for="last">Last name</label>
                  <input id="last" type="text" autocomplete="family-name" />
                </div>
              </div>
              <div class="field">
                <label for="email-up">Email</label>
                <input id="email-up" type="email" placeholder="you@domain.com" autocomplete="email" />
              </div>
              <div class="field">
                <label for="pw-up">Password <span class="opt">8+ characters</span></label>
                <input id="pw-up" type="password" placeholder="••••••••" autocomplete="new-password" />
              </div>
              <label class="check">
                <input type="checkbox" />
                <span>Send me appointment reminders. No marketing — only the chair.</span>
              </label>
              <button type="submit" class="btn btn--solid btn--full">Create Account <span class="arrow">→</span></button>
            </form>

            <div class="switch-line">
              Already a regular? <a href="#" @click.prevent="activePane = 'signin'">Sign in</a>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.account-hub { flex: 1; padding-top: 110px; }

.hub-head { padding: 0 36px; }
.hub-head__inner { max-width: 1320px; margin: 0 auto; padding-bottom: 32px; border-bottom: 1px solid var(--rule); }
.topline { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
.label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.hub-head h1 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(48px, 6vw, 96px); line-height: 0.95; letter-spacing: -0.02em;
}
.hub-head h1 em { font-style: italic; color: var(--brass); }
.hub-head .lede { color: var(--bone-dim); font-size: 16px; margin-top: 18px; max-width: 56ch; line-height: 1.55; }

/* role cards */
.roles { padding: 48px 36px 0; }
.roles__inner {
  max-width: 1320px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;
}
.role-card {
  display: flex; flex-direction: column;
  border: 1px solid var(--rule);
  background: transparent;
  padding: 36px 32px 32px;
  text-align: left; color: inherit;
  position: relative;
  transition: border-color .3s ease, background .3s ease, padding .3s ease;
  border-left: 2px solid var(--brass);
}
.role-card:hover {
  border-color: var(--brass);
  background: rgba(var(--brass-rgb), 0.06);
}
.role-card__head { display: flex; justify-content: space-between; margin-bottom: 28px; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.role-card__role { color: var(--brass); }
.role-card__title {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(34px, 3.6vw, 52px); line-height: 1; letter-spacing: -0.015em;
  margin-bottom: 18px;
}
.role-card__blurb { color: var(--bone-dim); font-size: 14px; line-height: 1.55; max-width: 32ch; margin-bottom: 32px; flex: 1; }
.role-card__cta {
  display: inline-flex; align-items: center; gap: 12px;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; font-weight: 600;
  color: var(--bone);
  padding-top: 18px;
  border-top: 1px solid var(--rule);
}
.role-card__cta .arrow { color: var(--brass); transition: transform .25s ease; }
.role-card:hover .role-card__cta .arrow { transform: translateX(4px); }

/* sign-in strip */
.signin-strip { margin-top: 64px; border-top: 1px solid var(--rule); padding: 0; }
.signin-strip__inner {
  max-width: 1320px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  min-height: 560px;
}

.ledger {
  border-right: 1px solid var(--rule);
  padding: 64px 60px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative;
}
.label-sm { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); }
.ledger__head h2 {
  font-family: var(--serif); font-weight: 400;
  font-size: clamp(44px, 5vw, 72px); line-height: 0.95; letter-spacing: -0.02em;
  margin-top: 20px;
}
.ledger__head h2 em { font-style: italic; color: var(--brass); }
.ledger__head p { color: var(--bone-dim); margin-top: 20px; max-width: 38ch; line-height: 1.55; }
.ledger__lines { margin-top: 48px; display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.row {
  display: grid; grid-template-columns: 80px 1fr auto; gap: 24px;
  padding: 18px 0; border-bottom: 1px solid var(--rule); font-size: 13px;
}
.row .k { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim); padding-top: 2px; }
.row .v { font-family: var(--serif); font-size: 18px; }
.row .meta { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim); align-self: center; }
.ledger__foot { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bone-dim); display: flex; justify-content: space-between; padding-top: 48px; }
.ledger__mono {
  position: absolute; right: -40px; bottom: -40px;
  font-family: var(--serif); font-size: 320px; line-height: 1;
  color: rgba(var(--brass-rgb), 0.04);
  pointer-events: none; letter-spacing: -0.04em;
}

.form-side {
  padding: 64px 60px;
  display: flex; flex-direction: column; justify-content: center;
  max-width: 560px; width: 100%; margin: 0 auto;
}
.tabs { display: flex; margin-bottom: 36px; border-bottom: 1px solid var(--rule); }
.tabs button {
  flex: 1; background: transparent; border: 0; color: var(--bone-dim);
  font: inherit; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600;
  padding: 16px 0; cursor: pointer;
  border-bottom: 1px solid transparent; margin-bottom: -1px;
  transition: all .25s ease;
}
.tabs button:hover { color: var(--bone); }
.tabs button.active { color: var(--bone); border-bottom-color: var(--brass); }

.pane h3 {
  font-family: var(--serif); font-weight: 400;
  font-size: 32px; line-height: 1.05; letter-spacing: -0.01em; margin-bottom: 8px;
}
.pane .sub { color: var(--bone-dim); font-size: 14px; margin-bottom: 32px; }

.field { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.field label {
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--bone-dim);
  display: flex; justify-content: space-between;
}
.forgot {
  font-size: 10px; letter-spacing: 0.06em; text-transform: none;
  color: var(--bone-dim); border-bottom: 1px solid transparent;
}
.forgot:hover { color: var(--bone); border-bottom-color: var(--brass); }
.opt { color: var(--bone-dim); opacity: 0.6; }
.field input {
  background: transparent; border: 0; border-bottom: 1px solid var(--rule);
  color: var(--bone); font: inherit; font-size: 16px; padding: 10px 0;
  outline: none; transition: border-color .25s ease;
}
.field input::placeholder { color: rgba(var(--bone-rgb), 0.35); }
.field input:focus { border-bottom-color: var(--brass); }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.check {
  display: flex; align-items: flex-start; gap: 12px;
  font-size: 12px; color: var(--bone-dim); margin-bottom: 24px; cursor: pointer;
}
.check input {
  appearance: none; width: 14px; height: 14px;
  border: 1px solid var(--rule); background: transparent;
  cursor: pointer; flex-shrink: 0; margin-top: 2px; position: relative;
}
.check input:checked { background: var(--brass); border-color: var(--brass); }
.check input:checked::after {
  content: "✓"; position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink); font-size: 10px; font-weight: 700;
}

.switch-line {
  margin-top: 24px; text-align: center;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--bone-dim);
}
.switch-line a { color: var(--bone); border-bottom: 1px solid var(--brass); padding-bottom: 2px; }

.colon { color: var(--brass); }

@media (max-width: 1100px) {
  .roles__inner { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .account-hub { padding-top: 90px; }
  .hub-head { padding: 0 22px; }
  .roles { padding: 32px 22px 0; }
  .signin-strip__inner { grid-template-columns: 1fr; }
  .ledger { padding: 48px 22px; border-right: 0; border-bottom: 1px solid var(--rule); }
  .ledger__mono { display: none; }
  .form-side { padding: 48px 22px; }
  .row-2 { grid-template-columns: 1fr; gap: 0; }
}
</style>

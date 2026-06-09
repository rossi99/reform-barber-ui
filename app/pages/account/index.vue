<script setup lang="ts">
definePageMeta({ accountRole: undefined });
useHead({ title: "Account — RE:FORM Hair & Culture" });

const activePane = ref<"signin" | "register">("signin");

function handleSubmit(e: Event, kind: "signin" | "register") {
  e.preventDefault();
  const btn = (e.currentTarget as HTMLFormElement).querySelector(
    "button[type=submit]",
  ) as HTMLButtonElement | null;
  if (!btn) return;
  btn.textContent = kind === "signin" ? "Welcome back →" : "Account opened ✓";
}
</script>

<template>
  <main class="account-hub">
    <!-- Header -->
    <section class="hub-head">
      <div class="hub-head__inner">
        <div class="topline">
          <div class="label">
            — Vol<span class="colon">:</span> 00 / The Ledger
          </div>
          <div class="label">
            Account <span class="colon">·</span> sign in below
          </div>
        </div>
        <h1>Your <em>chair.</em></h1>
        <p class="lede">
          One account holds your bookings, the chair you prefer, and the work
          we've done together.
        </p>
      </div>
    </section>

    <!-- Sign-in / register form -->
    <section class="signin-strip">
      <div class="signin-strip__inner">
        <section class="form-side">
          <div class="tabs">
            <button
              :class="{ active: activePane === 'signin' }"
              @click="activePane = 'signin'"
            >
              Sign In
            </button>
            <button
              :class="{ active: activePane === 'register' }"
              @click="activePane = 'register'"
            >
              Open Account
            </button>
          </div>

          <div v-show="activePane === 'signin'" class="pane">
            <h3>Sign in.</h3>
            <p class="sub">Email and password. Nothing else.</p>

            <form @submit="(e) => handleSubmit(e, 'signin')">
              <div class="field">
                <label for="email-in">Email</label>
                <input
                  id="email-in"
                  type="email"
                  placeholder="you@domain.com"
                  autocomplete="email"
                />
              </div>
              <div class="field">
                <label for="pw-in">
                  Password <a href="#" class="forgot">Forgot?</a>
                </label>
                <input
                  id="pw-in"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>
              <label class="check">
                <input type="checkbox" checked />
                <span>Keep me signed in on this device.</span>
              </label>
              <button type="submit" class="btn btn--solid btn--full">
                Log In <span class="arrow">→</span>
              </button>
            </form>

            <div class="switch-line">
              New here?
              <a href="#" @click.prevent="activePane = 'register'"
                >Open an account</a
              >
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
                <input
                  id="email-up"
                  type="email"
                  placeholder="you@domain.com"
                  autocomplete="email"
                />
              </div>
              <div class="field">
                <label for="pw-up"
                  >Password <span class="opt">8+ characters</span></label
                >
                <input
                  id="pw-up"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
              </div>
              <label class="check">
                <input type="checkbox" />
                <span
                  >Send me appointment reminders. No marketing — only the
                  chair.</span
                >
              </label>
              <button type="submit" class="btn btn--solid btn--full">
                Create Account <span class="arrow">→</span>
              </button>
            </form>

            <div class="switch-line">
              Already a regular?
              <a href="#" @click.prevent="activePane = 'signin'">Sign in</a>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.account-hub {
  flex: 1;
  padding-top: 110px;
}

.hub-head {
  padding: 0 36px;
}
.hub-head__inner {
  max-width: 1320px;
  margin: 0 auto;
  padding-bottom: 32px;
}
.topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}
.label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.hub-head h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(48px, 6vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.02em;
}
.hub-head h1 em {
  font-style: italic;
  color: var(--brass);
}
.hub-head .lede {
  color: var(--bone-dim);
  font-size: 16px;
  margin-top: 18px;
  max-width: 56ch;
  line-height: 1.55;
}

/* sign-in strip — full-bleed bg so the ledger colour extends to viewport edges on wide screens */
.signin-strip {
  border-top: 1px solid var(--rule);
  padding: 0;
  background: var(--ink-2);
}
.signin-strip__inner {
  max-width: 1320px;
  margin: 0 auto;
  /* display: grid; */
  grid-template-columns: 1fr 1fr;
  min-height: 560px;
}

.ledger {
  border-right: 1px solid var(--rule);
  padding: 64px 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}
.label-sm {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.ledger__head h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(44px, 5vw, 72px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-top: 20px;
}
.ledger__head h2 em {
  font-style: italic;
  color: var(--brass);
}
.ledger__head p {
  color: var(--bone-dim);
  margin-top: 20px;
  max-width: 38ch;
  line-height: 1.55;
}
.ledger__lines {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--rule);
}
.row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 13px;
}
.row .k {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  padding-top: 2px;
}
.row .v {
  font-family: var(--serif);
  font-size: 18px;
}
.row .meta {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
  align-self: center;
}
.ledger__foot {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--bone-dim);
  display: flex;
  justify-content: space-between;
  padding-top: 48px;
}
.ledger__mono {
  position: absolute;
  right: -40px;
  bottom: -40px;
  font-family: var(--serif);
  font-size: 320px;
  line-height: 1;
  color: rgba(var(--brass-rgb), 0.04);
  pointer-events: none;
  letter-spacing: -0.04em;
}

.form-side {
  padding: 64px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
}
.tabs {
  display: flex;
  margin-bottom: 36px;
  border-bottom: 1px solid var(--rule);
}
.tabs button {
  flex: 1;
  background: transparent;
  border: 0;
  color: var(--bone-dim);
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 16px 0;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  margin-bottom: -1px;
  transition: all 0.25s ease;
}
.tabs button:hover {
  color: var(--bone);
}
.tabs button.active {
  color: var(--bone);
  border-bottom-color: var(--brass);
}

.pane h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 32px;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin-bottom: 8px;
}
.pane .sub {
  color: var(--bone-dim);
  font-size: 14px;
  margin-bottom: 32px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.field label {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  display: flex;
  justify-content: space-between;
}
.forgot {
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: none;
  color: var(--bone-dim);
  border-bottom: 1px solid transparent;
}
.forgot:hover {
  color: var(--bone);
  border-bottom-color: var(--brass);
}
.opt {
  color: var(--bone-dim);
  opacity: 0.6;
}
.field input {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--rule);
  color: var(--bone);
  font: inherit;
  font-size: 16px;
  padding: 10px 0;
  outline: none;
  transition: border-color 0.25s ease;
}
.field input::placeholder {
  color: rgba(var(--bone-rgb), 0.35);
}
.field input:focus {
  border-bottom-color: var(--brass);
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.check {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 12px;
  color: var(--bone-dim);
  margin-bottom: 24px;
  cursor: pointer;
}
.check input {
  appearance: none;
  width: 14px;
  height: 14px;
  border: 1px solid var(--rule);
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
}
.check input:checked {
  background: var(--brass);
  border-color: var(--brass);
}
.check input:checked::after {
  content: "✓";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  font-size: 10px;
  font-weight: 700;
}

.switch-line {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.switch-line a {
  color: var(--bone);
  border-bottom: 1px solid var(--brass);
  padding-bottom: 2px;
}

.colon {
  color: var(--brass);
}

@media (max-width: 900px) {
  .account-hub {
    padding-top: 90px;
  }
  .hub-head {
    padding: 0 22px;
  }
  .signin-strip__inner {
    grid-template-columns: 1fr;
  }
  .ledger {
    padding: 48px 22px;
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
  .ledger__mono {
    display: none;
  }
  .form-side {
    padding: 48px 22px;
  }
  .row-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>

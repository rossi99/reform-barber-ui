<template>
  <footer class="site-footer">
    <div class="col">
      <span class="mark">RE<span class="colon">:</span>FORM</span>
      <span class="sub">Hair &amp; Culture · Larne</span>
    </div>

    <div class="col">
      <span class="h">Pages</span>
      <NuxtLink to="/">Home</NuxtLink>
      <a href="/#services">Services</a>
      <NuxtLink to="/gallery">Gallery</NuxtLink>
      <NuxtLink to="/account">Account</NuxtLink>
      <NuxtLink to="/book">Book</NuxtLink>
    </div>

    <div class="col">
      <span class="h">Elsewhere</span>
      <a href="https://www.facebook.com/264832963628377" target="_blank" rel="noopener">Facebook ↗</a>
      <a href="mailto:Info@reformbarber.co.uk">Info@reformbarber.co.uk</a>
      <NuxtLink to="/book">Booking</NuxtLink>
    </div>

    <div class="legal">
      <span>© 2026 RE<span class="colon">:</span>FORM Hair &amp; Culture</span>
      <span>Formerly Two Brothers Barber Co.</span>
      <span>Larne <span class="colon">·</span> N. Ireland</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 36px;
  border-top: 1px solid var(--rule);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  align-items: end;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--bone-dim);
}

.mark {
  font-family: var(--serif);
  font-size: 28px;
  color: var(--bone);
  letter-spacing: 0.02em;
}
.mark .colon { color: var(--brass); }

.sub {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--bone-dim);
}

.col { display: flex; flex-direction: column; gap: 8px; }
.col .h { color: var(--bone); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 6px; }
.col a:hover { color: var(--bone); }

.legal {
  grid-column: 1 / -1;
  padding-top: 32px;
  border-top: 1px solid var(--rule);
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.colon { color: var(--brass); }

@media (max-width: 900px) {
  .site-footer { grid-template-columns: 1fr; padding: 28px 22px; gap: 28px; }
  .legal { flex-direction: column; gap: 12px; }
}
</style>

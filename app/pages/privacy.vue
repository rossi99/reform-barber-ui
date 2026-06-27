<script setup lang="ts">
useHead({ title: 'Privacy & Cookies — RE:FORM Hair & Culture' })
</script>

<template>
  <header class="page-head">
    <div>
      <div class="page-label">— Legal<span class="colon">:</span> Disclosure</div>
      <h1>Privacy<br /><em>&amp; Cookies.</em></h1>
    </div>
  </header>

  <section class="content">
    <div class="block">
      <h2>Cookies we use</h2>
      <p>
        This site uses a single, strictly necessary cookie to keep you signed in.
        No tracking cookies, no advertising cookies.
      </p>
      <table class="cookie-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Type</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>rb_refresh</code></td>
            <td>Keeps you signed in between visits</td>
            <td>Strictly necessary — HttpOnly, Secure</td>
            <td>When your session expires or you log out</td>
          </tr>
        </tbody>
      </table>
      <p class="note">
        Strictly necessary cookies do not require your consent under UK PECR / GDPR.
        You can delete this cookie at any time by signing out or clearing your browser's cookies.
      </p>
    </div>

    <div class="block">
      <h2>A fuller policy is coming</h2>
      <p>
        RE<span class="colon">:</span>FORM is in early access. A complete privacy policy covering data storage,
        booking information, and your rights under UK GDPR will be published before public launch.
      </p>
      <p>
        In the meantime, if you have any questions email
        <a href="mailto:Info@reformbarber.co.uk">Info@reformbarber.co.uk</a>.
      </p>
    </div>
  </section>
</template>

<style scoped>
.page-head {
  padding: 160px 36px 80px;
  border-bottom: 1px solid var(--rule);
}
.page-label {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--bone-dim);
  margin-bottom: 24px;
}
.page-head h1 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(48px, 8vw, 120px);
  line-height: 0.95;
  letter-spacing: -0.02em;
}
.page-head h1 em { font-style: italic; }

.content {
  padding: 80px 36px 140px;
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 72px;
}

.block h2 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 28px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rule);
}

.block p {
  font-size: 15px;
  color: var(--bone-dim);
  line-height: 1.65;
  margin-bottom: 16px;
}
.block p:last-child { margin-bottom: 0; }

.block a { color: var(--brass); text-decoration: underline; }

.cookie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 20px 0;
}
.cookie-table th,
.cookie-table td {
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--rule);
}
.cookie-table th {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bone-dim);
  background: var(--ink-2);
}
.cookie-table td { color: var(--bone); vertical-align: top; }
.cookie-table code {
  font-family: monospace;
  font-size: 12px;
  color: var(--brass);
}

.note {
  font-size: 13px !important;
  color: var(--bone-dim);
  font-style: italic;
}

.colon { color: var(--brass); }

@media (max-width: 900px) {
  .page-head { padding: 120px 22px 56px; }
  .content { padding: 56px 22px 100px; }
  .cookie-table { font-size: 12px; }
  .cookie-table th, .cookie-table td { padding: 10px 10px; }
}
</style>

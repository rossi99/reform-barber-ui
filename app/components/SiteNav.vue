<script setup lang="ts">
const route = useRoute();

const isHome = computed(() => route.path === "/");
const activeLink = computed(() => {
  if (route.path === "/book") return "/book";
  if (route.path === "/gallery") return "/gallery";
  if (route.path === "/account" || route.path.startsWith("/account/"))
    return "/account";
  if (route.hash === "#services") return "#services";
  return "/";
});

const accountRole = computed<string | undefined>(() => {
  const r = route.meta.accountRole;
  return typeof r === "string" && r.length > 0 ? r : undefined;
});

// true while the home-page hero is the primary viewport content
const heroActive = useHeroNav();
</script>

<template>
  <nav class="site-nav" :class="{ 'is-hero': heroActive }">
    <NuxtLink to="/" class="brand">
      <span class="mark">
        <span>R</span><span>E</span><span class="colon">:</span><span>F</span
        ><span>O</span><span>R</span><span>M</span>
      </span>
      <span class="tag">
        <span>H</span><span>A</span><span>I</span><span>R</span
        ><span>&amp;</span><span>C</span><span>U</span><span>L</span
        ><span>T</span><span>U</span><span>R</span><span>E</span>
      </span>
    </NuxtLink>

    <div class="links">
      <NuxtLink to="/" :class="{ active: activeLink === '/' }">Home</NuxtLink>
      <a href="/#services" :class="{ active: activeLink === '#services' }"
        >Services</a
      >
      <NuxtLink to="/gallery" :class="{ active: activeLink === '/gallery' }"
        >Gallery</NuxtLink
      >
      <NuxtLink to="/account" :class="{ active: activeLink === '/account' }"
        >Account</NuxtLink
      >
    </div>

    <div class="cta-wrap">
      <span v-if="accountRole" class="role-badge"
        >{{ accountRole.split(" · ")[0] }} <span class="colon">·</span>
        {{ accountRole.split(" · ").slice(1).join(" · ") }}</span
      >
      <NuxtLink v-else class="btn btn--solid" to="/book"
        >Book Now <span class="arrow">→</span></NuxtLink
      >
      <button class="menu-btn" aria-label="Menu">Menu</button>
    </div>
  </nav>
</template>

<style scoped>
.site-nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 22px 36px;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 10, 0.95) 0%,
    rgba(10, 10, 10, 0.85) 70%,
    rgba(10, 10, 10, 0) 100%
  );
  backdrop-filter: blur(6px);
  /* smooth transition between hero-transparent and solid-background states */
  transition:
    background 0.4s ease,
    backdrop-filter 0.4s ease;
}

/* ---- transparent hero nav ---- */
/* Zero-alpha gradient of the same structure — lets the browser interpolate smoothly */
.site-nav.is-hero {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.85) 70%,
    rgba(0, 0, 0, 0) 100%
  ) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Force light text/logo when sitting on the dark hero overlay */
.site-nav.is-hero {
  color: #f4efe6;
}

.site-nav.is-hero .brand .tag {
  color: rgba(244, 239, 230, 0.55);
}

.site-nav.is-hero .links a {
  color: rgba(244, 239, 230, 0.72);
}
.site-nav.is-hero .links a:hover,
.site-nav.is-hero .links a.active {
  color: #f4efe6;
}

.site-nav.is-hero .menu-btn {
  color: #f4efe6;
}

/* Ghost "Book Now" button against the hero image */
.site-nav.is-hero .btn--solid {
  background: transparent;
  border: 1px solid rgba(244, 239, 230, 0.55);
  color: #f4efe6;
}
.site-nav.is-hero .btn--solid:hover {
  background: #f4efe6;
  color: #0a0a0a;
  border-color: #f4efe6;
}

/* ---- base nav styles ---- */
.brand {
  font-family: var(--serif);
  line-height: 1;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  width: 150px;
}
.brand .mark {
  font-size: 22px;
  letter-spacing: 0.02em;
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.brand .mark .colon {
  color: var(--brass);
}
.brand .tag {
  font-family: var(--grot);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--bone-dim);
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.links {
  display: flex;
  gap: 36px;
  justify-self: center;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 500;
}
.links a {
  position: relative;
  padding: 6px 0;
  color: var(--bone-dim);
  transition: color 0.25s ease;
}
.links a:hover,
.links a.active {
  color: var(--bone);
}
.links a.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--brass);
}

.cta-wrap {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 18px;
}

.role-badge {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brass);
  padding: 5px 10px;
  border: 1px solid rgba(var(--brass-rgb), 0.4);
  background: rgba(var(--brass-rgb), 0.06);
}

.menu-btn {
  display: none;
  background: none;
  border: 0;
  color: var(--bone);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .site-nav {
    padding: 18px 22px;
    grid-template-columns: 1fr auto;
  }
  .links {
    display: none;
  }
  .menu-btn {
    display: inline-block;
  }
  .cta-wrap .btn {
    display: none;
  }
  .brand {
    width: 120px;
  }
  .brand .mark {
    font-size: 18px;
  }
  .brand .tag {
    font-size: 8px;
    letter-spacing: 0.24em;
  }
}
</style>

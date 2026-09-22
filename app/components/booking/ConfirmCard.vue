<script setup lang="ts">
import {
  useBookingStore,
  priceFmt,
  dateFmtShort,
  isoDay,
  type BookingBarber,
  type BookingService,
  type BookingState,
} from "~/composables/useBookingStore";
import type { Product } from "~/types/api";

const { total, toggleProduct, adjustQty } = useBookingStore();
const { user } = useAuth();
const api = useApiFetch();
const toast = useToast();

const props = defineProps<{
  barber: BookingBarber | null;
  service: BookingService | null;
  date: Date | null;
  time: string | null;
  products: BookingState["products"];
}>();

const emit = defineEmits<{ confirmed: [id: string] }>();

const { data: shelf } = await useFetch<Product[]>("/api/products", {
  default: () => [],
});

const isConfirming = ref(false);
const confirmedId = ref<string | null>(null);

// Booking as a guest opens an account from these, which is why the email has
// to be one that works: the confirmation and every later sign-in code go there.
const guest = reactive({ firstName: "", lastName: "", email: "", phone: "" });
const guestReady = computed(() => /\S+@\S+\.\S+/.test(guest.email.trim()));
const canConfirm = computed(
  () => !isConfirming.value && isComplete.value && (!!user.value || guestReady.value),
);

const headline = computed(() => {
  if (!props.barber || !props.date || !props.time) return "The chair is yours.";
  return `${props.barber.name} · ${dateFmtShort(props.date)} at ${props.time}`;
});

const breakdown = computed(() => {
  const parts: string[] = [];
  if (props.service) parts.push(`Cut ${priceFmt(props.service.price)}`);
  Object.values(props.products).forEach((p) => {
    const suffix = p.qty > 1 ? ` ×${p.qty}` : "";
    parts.push(`${p.name}${suffix} ${priceFmt(p.price * p.qty)}`);
  });
  return parts.join(" · ");
});

const isComplete = computed(
  () => !!(props.barber && props.service && props.date && props.time),
);

async function confirm() {
  if (!canConfirm.value || !props.barber || !props.service || !props.date || !props.time)
    return;
  isConfirming.value = true;
  try {
    const { reference } = await api<{ reference: string }>("/api/bookings", {
      method: "POST",
      body: {
        barberId: props.barber.id,
        serviceId: props.service.id,
        date: isoDay(props.date),
        time: props.time,
        products: Object.fromEntries(
          Object.entries(props.products).map(([k, v]) => [k, v.qty]),
        ),
        ...(user.value ? {} : guest),
      },
    });
    confirmedId.value = reference;
    emit("confirmed", reference);
  } catch (err) {
    toast.error(
      (err as { data?: { error?: string } })?.data?.error ??
        "That booking did not go through. Please try again.",
    );
  } finally {
    isConfirming.value = false;
  }
}
</script>

<template>
  <div class="confirm-card">
    <div class="confirm-card__head">
      <div>
        <div class="card-label">Ready to <em>book</em></div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <h3
          v-html="
            confirmedId
              ? `Booked <em>·</em> ${confirmedId}`
              : headline.replace(/ · /, ' <em>·</em> ')
          "
        />
      </div>
      <div class="summary">
        <div>
          <span class="v">{{ service?.name ?? "-" }}</span>
        </div>
        <div>
          {{
            service
              ? `${service.duration} min · ${priceFmt(service.price)}`
              : ""
          }}
        </div>
      </div>
    </div>

    <!-- upsell -->
    <div v-if="!confirmedId && shelf.length" class="upsell">
      <div class="upsell__head">
        <div class="k">
          Add to <em>booking</em> <span class="shelf">- from the shelf</span>
        </div>
        <div class="sub">
          Optional <span class="colon">·</span> pay on the day
        </div>
      </div>
      <div class="upsell__grid">
        <div
          v-for="(p, i) in shelf"
          :key="p.id"
          class="product"
          :class="{ 'is-added': !!products[p.id] }"
          role="button"
          tabindex="0"
          @click="toggleProduct(p.id, p.name, p.price)"
          @keydown.enter.space.prevent="toggleProduct(p.id, p.name, p.price)"
        >
          <div class="product__img">
            <span class="product__num">/ {{ String(i + 1).padStart(2, "0") }}</span>
            <span v-if="products[p.id]" class="product__qty">{{
              products[p.id]?.qty
            }}</span>
            <picture v-if="p.image_url" class="product__photo">
              <img :src="p.image_url" :alt="p.name" />
            </picture>
            <span v-else class="product__glyph">{{ p.name.charAt(0) }}</span>
          </div>
          <div class="product__body">
            <div class="product__row">
              <span class="product__name">{{ p.name }}</span>
              <span class="product__price">{{ priceFmt(p.price) }}</span>
            </div>
            <div class="product__add">
              <span v-if="!products[p.id]" class="add-label"
                >Add <span class="plus">+</span></span
              >
              <span v-else class="qty-ctrl" @click.stop>
                <button
                  type="button"
                  aria-label="Remove one"
                  :disabled="(products[p.id]?.qty ?? 0) <= 1"
                  @click.stop="adjustQty(p.id, -1)"
                >
                  −
                </button>
                <span class="qty-stack">
                  <span class="qty-num">{{ products[p.id]?.qty ?? 1 }}</span>
                  <span class="qty-meta">in cart</span>
                </span>
                <button
                  type="button"
                  aria-label="Add one"
                  :disabled="(products[p.id]?.qty ?? 0) >= 3"
                  @click.stop="adjustQty(p.id, 1)"
                >
                  +
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- your details -->
    <div v-if="!confirmedId && !user" class="details">
      <div class="details__head">
        <div class="k">Your <em>details</em></div>
        <div class="sub">Where the confirmation goes</div>
      </div>
      <div class="details__grid">
        <label>
          <span>First name</span>
          <input v-model="guest.firstName" type="text" autocomplete="given-name" />
        </label>
        <label>
          <span>Last name</span>
          <input v-model="guest.lastName" type="text" autocomplete="family-name" />
        </label>
        <label>
          <span>Email</span>
          <input v-model="guest.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Phone</span>
          <input v-model="guest.phone" type="tel" autocomplete="tel" />
        </label>
      </div>
    </div>

    <!-- footer -->
    <div class="confirm-card__foot">
      <div class="confirm-card__total">
        <span class="lbl"
          >Total <span class="colon">·</span> pay on the day</span
        >
        <span class="val">{{ priceFmt(total) }}</span>
        <span class="breakdown">{{ breakdown }}</span>
      </div>
      <button
        v-if="!confirmedId"
        type="button"
        class="btn btn--solid"
        :disabled="!canConfirm"
        @click="confirm"
      >
        {{ isConfirming ? "Booking…" : "Confirm booking" }}
        <span class="arrow">{{ isConfirming ? "" : "→" }}</span>
      </button>
      <span v-else class="confirmed-badge">Booked ✓</span>
      <p>
        We'll send a confirmation to your email and a reminder the morning of.
        No password to set - signing in is a code we email you.
      </p>
    </div>
  </div>
</template>

<style scoped>
.confirm-card {
  border: 1px solid var(--brass);
  background: rgba(176, 141, 87, 0.06);
  padding: 32px;
  margin-top: 24px;
}

.confirm-card__head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: end;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(176, 141, 87, 0.25);
}
.card-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brass);
  margin-bottom: 12px;
}
h3 {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 32px;
  letter-spacing: -0.01em;
  line-height: 1.05;
}
:deep(em) {
  font-style: italic;
  color: var(--brass);
}

.summary {
  text-align: right;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--bone-dim);
  line-height: 1.6;
}
.summary .v {
  color: var(--bone);
}

/* upsell */
.upsell {
  padding: 28px 0;
}
.upsell__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}
.upsell__head .k {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.upsell__head .k em {
  font-style: italic;
  color: var(--brass);
}
.shelf {
  color: var(--bone-dim);
  margin-left: 8px;
}
.upsell__head .sub {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.upsell__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.product {
  border: 1px solid var(--rule);
  background: transparent;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: border-color 0.25s ease;
  position: relative;
}
.product:hover {
  border-color: var(--bone);
}
.product.is-added {
  border-color: var(--brass);
  background: rgba(176, 141, 87, 0.06);
}

.product__img {
  aspect-ratio: 4/5;
  background: var(--ink-2);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product__glyph {
  font-family: var(--serif);
  font-size: 84px;
  line-height: 1;
  color: rgba(244, 239, 230, 0.14);
  letter-spacing: -0.02em;
  z-index: 1;
}
.product__photo {
  width: 100%;
  height: 100%;
  display: block;
}
.product__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product__num {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  z-index: 2;
}
.product__qty {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 22px;
  height: 22px;
  background: var(--brass);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  padding: 0 6px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.product__body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.product__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.product__name {
  font-family: var(--serif);
  font-size: 18px;
  letter-spacing: -0.005em;
}
.product__price {
  font-family: var(--serif);
  font-size: 16px;
  color: var(--bone);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.product__add {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--rule);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
  min-height: 34px;
}
.add-label .plus {
  color: var(--brass);
  margin-left: 6px;
  font-size: 12px;
}

.qty-ctrl {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  color: var(--brass);
}
.qty-num {
  font-family: var(--serif);
  font-size: 20px;
  line-height: 1;
  color: var(--bone);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0;
  text-transform: none;
  padding-right: 5px;
}
.qty-meta {
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.qty-ctrl button {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--bone);
  cursor: pointer;
  font: inherit;
  font-family: var(--grot);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.qty-ctrl button:hover:not(:disabled) {
  background: var(--bone);
  color: var(--ink);
  border-color: var(--bone);
}
.qty-ctrl button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* your details */
.details {
  padding: 4px 0 28px;
}
.details__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
}
.details__head .k {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.details__head .k em {
  font-style: italic;
  color: var(--brass);
}
.details__head .sub {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.details__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.details label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.details label span {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.details input {
  background: transparent;
  border: 1px solid var(--rule);
  color: var(--bone);
  font: inherit;
  padding: 10px 12px;
  transition: border-color 0.25s ease;
}
.details input:focus {
  outline: none;
  border-color: var(--brass);
}

/* footer */
.confirm-card__foot {
  padding-top: 24px;
  border-top: 1px solid rgba(176, 141, 87, 0.25);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 32px;
  align-items: center;
}
.confirm-card__total {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lbl {
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.val {
  font-family: var(--serif);
  font-size: 36px;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.breakdown {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bone-dim);
}
.confirm-card__foot p {
  grid-column: 1 / -1;
  color: var(--bone-dim);
  font-size: 12px;
  max-width: 56ch;
  margin-top: 8px;
}

.confirmed-badge {
  font-family: var(--serif);
  font-size: 24px;
  color: var(--brass);
}

@media (max-width: 900px) {
  .confirm-card {
    padding: 24px;
  }
  .confirm-card__head {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .summary {
    text-align: left;
  }
  .upsell__grid {
    grid-template-columns: 1fr;
  }
  .details__grid {
    grid-template-columns: 1fr;
  }
  .confirm-card__foot {
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }
}
</style>

// Modmila — site-wide store information.
// Change values here once and they update across the whole site.
// NOTE: Contact and legal details below are placeholders. Replace before launch.

const storeInfo = {
  businessName: "Modmila",
  legalName: "Modmila LLC",
  domain: "modmila.com",
  website: "https://modmila.com",
  tagline: "Modern bedroom & bedding textiles",
  description:
    "Modmila designs modern bedding textiles — duvet cover sets, quilts, coverlets, sheet sets, pillow shams and bed skirts — made to layer into a calm, considered bedroom.",

  email: "support@modmila.com",
  phoneDisplay: "+1 (555) 010-2040",
  phoneHref: "+15550102040", // digits only; components add "tel:"

  addressLine1: "123 Placeholder Street, Suite 100",
  addressLine2: "New York, NY 10001",
  country: "United States",

  businessDays: "Monday – Friday",
  supportHours: "9:00 AM – 5:00 PM",
  timeZone: "Eastern Time (ET)",

  currency: "USD",
  currencySymbol: "$",

  // Policy pages show this date as "Last updated".
  policyLastUpdated: "October 8, 2026",
};

export const getFullAddress = () =>
  [storeInfo.addressLine1, storeInfo.addressLine2, storeInfo.country]
    .filter(Boolean)
    .join(", ");

// Browser storage keys (one place, so old-brand keys never come back).
export const STORAGE_KEYS = {
  cart: "modmila_cart",
  user: "modmila_user",
  token: "modmila_token",
  adminToken: "modmila_admin_token",
  rememberedEmail: "modmila_remembered_email",
  wishlist: "modmila_wishlist",
  recentOrders: "modmila_recent_orders",
};

// Shop categories. `name` must match the category saved on products in the backend.
// Images live in /public with these exact file names.
export const CATEGORIES = [
  {
    id: "01",
    name: "Duvet Cover Sets",
    slug: "duvet-cover-sets",
    image: "/Duvet Cover Sets.png",
    blurb: "The top layer that sets the mood of the room.",
  },
  {
    id: "02",
    name: "Quilts & Coverlets",
    slug: "quilts-coverlets",
    image: "/Quilts & Coverlets.png",
    blurb: "Light, stitched layers for every season.",
  },
  {
    id: "03",
    name: "Sheet Sets",
    slug: "sheet-sets",
    image: "/Sheet Sets.png",
    blurb: "Cool, smooth foundations for better sleep.",
  },
  {
    id: "04",
    name: "Shams & Bed Skirts",
    slug: "shams-bed-skirts",
    image: "/Shams & Bed Skirts.png",
    blurb: "Tailored finishing pieces that complete the bed.",
  },
];

export const BUSINESS_INFO = storeInfo;
export default storeInfo;
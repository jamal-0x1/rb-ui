export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "facebook" | "twitter" | "instagram" | "linkedin";
};

export type ContactInfo = {
  address?: string;
  phone?: string;
  email?: string;
};

export const CONTACT: ContactInfo = {
  address: "685 Market Street, Las Vegas, LA 95820, United States.",
  phone: "(+099) 532-786-9843",
  email: "support@example.com",
};

export const SOCIAL_LINKS: SocialLink[] = [];

export const ACCOUNT_LINKS: FooterLink[] = [
  { label: "My Account", href: "/my-account" },
  { label: "Sign In", href: "/signin" },
  { label: "Register", href: "/signup" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Shop", href: "/shop" },
];

export const QUICK_LINKS: FooterLink[] = [
  { label: "Contact", href: "/contact" },
];

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
  address: "House 12, Road 7, Dhanmondi, Dhaka 1205, Bangladesh.",
  phone: "+880 1872-570727",
  email: "support@orbitalmind.xyz",
};

export const SOCIAL_LINKS: SocialLink[] = [];

export const ACCOUNT_LINKS: FooterLink[] = [
  { label: "My Account", href: "/my-account" },
  { label: "Orders", href: "/my-account?tab=orders" },
  { label: "Addresses", href: "/my-account?tab=addresses" },
  { label: "Sign In", href: "/signin" },
  { label: "Register", href: "/signup" },
];

export const QUICK_LINKS: FooterLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Checkout", href: "/checkout" },
  { label: "Contact", href: "/contact" },
];

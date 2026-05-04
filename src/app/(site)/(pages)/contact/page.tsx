import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with RB Accessories — Dhanmondi, Dhaka. Cash on delivery across Bangladesh. Call +880 1872-570727 or email support@orbitalmind.xyz.",
  alternates: { canonical: "/contact" },
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;

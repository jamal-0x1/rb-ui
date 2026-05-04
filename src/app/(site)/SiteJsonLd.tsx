const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://riyad-bhai.orbitalmind.xyz"
).replace(/\/$/, "");

const SITE_NAME = "RB Accessories";

export default function SiteJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/logo.svg`,
    areaServed: { "@type": "Country", name: "Bangladesh" },
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash on Delivery",
    address: {
      "@type": "PostalAddress",
      streetAddress: "House 12, Road 7, Dhanmondi",
      addressLocality: "Dhaka",
      postalCode: "1205",
      addressCountry: "BD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+880-1872-570727",
      contactType: "customer support",
      email: "support@orbitalmind.xyz",
      areaServed: "BD",
      availableLanguage: ["en", "bn"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

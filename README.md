# RB — Accessories Storefront (Next.js)

> **Domain:** Consumer accessories ecommerce (BDT, Bangladesh market). Catalog skews toward small electronics + lifestyle accessories — mobile/tablet, watches, peripherals, gamepads, networking. Product-functionality decisions (filters, variants, attributes, image flows) optimize for that domain. Bulk apparel/sizing affordances are de-prioritized; brand/color/price/tag/in-stock are primary.

## Environment

Single env var, read by `src/lib/publicApi.ts`:

| Var | Local default (`.env.local`) | Prod (`.env`) |
|-----|------------------------------|---------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | `https://rb-api.orbitalmind.xyz/api` |

Must include the `/api` suffix. `.env` is committed (prod default); `.env.local` overrides locally and is gitignored. Browser-exposed → must keep the `NEXT_PUBLIC_` prefix per Next.js convention. Image hosts are pinned in `next.config.js#images.remotePatterns` — add new prod hosts there too.

Run dev: `npm run dev` (port `5173`).

---

# Free eCommerce Template for Next.js - NextMerce

The free Next.js eCommerce template is a lite version of the NextMerce Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![NextMerce](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)


While NextMerce Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### NextMerce Free VS NextMerce Pro

| ✨ Features                         | 🎁 NextMerce Free                 | 🔥 NextMerce Pro                        |
|----------------------------------|--------------------------------|--------------------------------------|
| Next.js Pages                    | Static                         | Dynamic Boilerplate Template         |
| Components                       | Limited                        | All According to Demo                |
| eCommerce Functionality          | Included                       | Included                             |
| Integrations (DB, Auth, etc.)    | Not Included                   | Included                             |
| Community Support                | Included                       | Included                             |
| Premium Email Support            | Not Included                   | Included                             |
| Lifetime Free Updates            | Included                       | Included                             |


#### [🚀 Live Demo](https://demo.nextmerce.com/)

#### [🌐 Visit Website](https://nextmerce.com/)

## Update Logs

Version 0.1.2 - [Mar 16, 2026]
- Update Next.js, React, and React DOM dependencies, add baseline-browser-mapping
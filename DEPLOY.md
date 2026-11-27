# Fast Food Dibra – si ta nxjerrësh live

## Struktura e faqes

| Skedari | Çfarë është |
|---|---|
| `index.html` | Kreu |
| `menu.html` | Menuja + shporta (porosia në WhatsApp) |
| `rreth-nesh.html` | Rreth nesh + galeria |
| `kontakt.html` | Adresa, harta, orari, pyetjet (FAQ) |
| `404.html` | Faqja "nuk u gjet" |
| `contact.html`, `locations.html` | Linke të vjetra, të çojnë te `kontakt.html` |
| `sitemap.xml`, `robots.txt` | Për Google |
| `_headers` | Header-a sigurie (vetëm në Cloudflare Pages / Netlify) |
| `fonts/` | Fontet, të hostuara këtu, jo te Google |

Header-i dhe footer-i janë të njëjtë në 4 faqet: nëse ndryshon një link, ndryshoje në të katërta.

## 1. Para se ta tregosh: kontrollo këto

- [x] **Orari** 08:00 – 23:00 është te Kreu, Kontakt, footer dhe te të dhënat për Google (`openingHoursSpecification`).
      Nëse ndryshon, ndryshoje në të gjitha këto vende (kërko `08:00`).
- [ ] **Fotot e menusë** (`images/menu/`): disa janë e njëjta foto (sufllaqe = gyro, nuggets = mix-platter, …).
      Zëvendësoji me foto të vërteta, me të njëjtin emër skedari.
- [ ] **Çmimet**: kontrolloji te `menu.html` (`<span class="dm-price">`).

## 2. Kur të blini domain-in

Tani kudo është adresa aktuale **`https://frenksayswassup.github.io/FastFoodDibra`**.
Kur domain-i të jetë gati, bëj *Find & Replace* të saj me domain-in (p.sh. `https://fastfooddibra.al`, pa `/` në fund) në:
`index.html`, `menu.html`, `rreth-nesh.html`, `kontakt.html`, `404.html`, `contact.html`, `locations.html`,
`sitemap.xml`, `robots.txt`. Pastaj vazhdo me hapin 3.

## 3. Lidhja me GitHub Pages

1. GitHub → repo → **Settings → Pages** → *Custom domain*: shkruaj `fastfooddibra.al` → **Save**.
   (Bëje KËTË para DNS-it.)
2. Te paneli i regjistruesit të domain-it (p.sh. host.al), shto:

   | Lloji | Emri | Vlera |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | frenksayswassup.github.io |

   Fshi çdo rekord tjetër A ose CNAME për `@` dhe `www` (p.sh. "parking page" e regjistruesit).
3. Prit (deri në 24 orë) → kthehu te Settings → Pages → shëno **Enforce HTTPS**.
4. Siguria: GitHub → foto e profilit → **Settings → Pages → Add a domain** → verifikoje domain-in (rekord TXT).
5. Aktivizo **2FA** në GitHub dhe te regjistruesi, dhe **rinovimin automatik** të domain-it.

## 4. Google

1. https://search.google.com/search-console → *Add property* → **Domain** → verifiko me rekord TXT.
2. *Sitemaps* → shkruaj `sitemap.xml` → Submit.
3. *URL inspection* → për çdo faqe → *Request indexing*.
4. Pronari krijon/verifikon **Google Business Profile** dhe vendos linkun e faqes.

## 5. Opsionale: Cloudflare Pages në vend të GitHub Pages

Lejon përdorim komercial dhe lexon skedarin `_headers` (header-a sigurie si `frame-ancestors`, HSTS).
Cloudflare → Workers & Pages → Create → Pages → lidh repo-n → *Framework: None*, *Build command:* bosh,
*Output directory:* `/` → Deploy → *Custom domains* → shto domain-in.

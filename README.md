# Seyed Mohammad Salehi — Engineering and Research Portfolio

This repository contains the source for the official personal website of **Seyed Mohammad Salehi**, a robotics engineer, AI/ML engineer and researcher, electrical/electronics engineer, and University of Surrey M.Sc. graduate working across computer vision, motion forecasting, control and embedded systems.

- Website: [madvidd.github.io/madvid](https://madvidd.github.io/madvid/)
- Research: [Streaming motion forecasting dissertation and results](https://madvidd.github.io/madvid/research.html)
- Projects: [Engineering case studies](https://madvidd.github.io/madvid/projects.html)
- Education: [Qualifications, publications and certificates](https://madvidd.github.io/madvid/education.html)
- Experience: [Engineering, teaching and community roles](https://madvidd.github.io/madvid/experience.html)
- Skills: [Technical, research and creative skills](https://madvidd.github.io/madvid/skills.html)
- References: [Academic and professional contacts](https://madvidd.github.io/madvid/references.html)
- Media: [Credentials, certificates and public links](https://madvidd.github.io/madvid/media.html)
- Music: [Madvid — DJ and music producer](https://madvidd.github.io/madvid/media/music.html)
- Contact: [Get in touch](https://madvidd.github.io/madvid/contact.html)
- LinkedIn: [linkedin.com/in/madvid](https://www.linkedin.com/in/madvid)
- GitHub: [github.com/madvidd](https://github.com/madvidd)

Featured work includes human-motion prediction for autonomous navigation, the Rhizo PTX integrated control dashboard, the IMechE UAS Challenge 2026 and deep-learning-based battery SOC/SOH estimation.

The Research page presents **Uncertainty-Aware Attention, Geometry and State-Space Modelling for Streaming Motion Forecasting**, supervised by Professor Saber Fallah and Professor Kevin Wells. Its six interactive comparisons use selected validation minADE6 and recorded training duration, with study-specific controls and checkpoint caveats. Source provenance is recorded in `assets/research/SOURCES.md`.

The site is static HTML, CSS and JavaScript, hosted by GitHub Pages. Research tables, project cards and navigation remain available without JavaScript. JavaScript adds an accessible mobile menu, project filters, result tabs/charts and copy controls. Respect reduced-motion preferences and preserve natural image proportions when extending the design.

Motion enhancements include progressive page and section transitions, card and text hover highlights, keyboard-focus feedback and a reading-progress indicator. Animations respect reduced-motion settings and never make content depend on an animation completing.

The homepage is an overview linking to dedicated Research, Projects, Education, Experience, Skills, References, Media, Music and Contact pages. The header keeps the primary links visible and groups Education, Skills, References, Media and Music in an accessible native More disclosure.

Education contains qualifications, publications and certificates, with courses and language/test scores at their compatible `media/courses.html` and `media/profile.html` URLs. The confirmed PGCert Electronic Engineering and PGDip Computer Vision, Robotics and Machine Learning are listed as subsidiary awards beneath the MSc, alongside 90 ECTS, rather than in the degree heading. The final MSc grade is 72.1% with Distinction; the dissertation mark is 75/100, authorised for publication by the owner and included in Education, Research and the MSc module table. Keep the homepage badge as “M.Sc. Distinction”.

The Media page is a directory for certificates, experience media, galleries, documents, posts and public links. Music has a dedicated `media/music.html` page for DJ performances, production, listening platforms and the electronic-music certificate. Explicit legacy fragment redirects preserve saved links to moved homepage sections, former single-page media sections, and the music certificate.

The media collection retains credential records, full-resolution image galleries, public links and attributed reposts from the owner's LinkedIn profile. Existing image redactions are preserved. Third-party posts remain attributed to their original authors; the IGNITE video uses LinkedIn's official embed with an original-post fallback link. Keep source images uncropped and all gallery items visible without opening a disclosure.

Course grades are presented out of 100 and distinguish MSc module marks from coursework marks.

Each page has a distinct, low-opacity SVG background composition and continuous gentle transform-only motion. There is no motion selector or stored motion preference. Background motion slows to 40% speed under the system reduced-motion preference and pauses in hidden tabs; other interface motion follows the reduced-motion setting. Decorative layers are hidden from assistive technology, disappear in print and never capture pointer input.

Keep visible update timestamps off the pages. Modification dates belong only in structured metadata and the sitemap.

Run `node scripts/check-site.cjs` before publishing. It checks local links and fragments, image alt text, shared navigation, canonical URLs, JSON-LD, and page/image sitemap coverage.

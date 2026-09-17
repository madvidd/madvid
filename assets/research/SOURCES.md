# Research page evidence

Author: Seyed Mohammad Salehi. Dissertation: *Uncertainty-Aware Attention, Geometry and State-Space Modelling for Streaming Motion Forecasting* (University of Surrey, 2026).

- Public research repository: https://github.com/madvidd/Salehi-MSc-Thesis
- Inspected repository revision: `2a170f60f2e8da2d975c9cc9a0e60c48aa5088eb`
- Dissertation PDF: `Documentation/Dissertation/Salehi_MSc_Dissertation.pdf`, copied without alteration to this folder.
- Result sources: dissertation Tables 4.2–4.5 and 4.7–4.14; study packages under `Studies/SEAM` and `Studies/SHARP`; `Results/README.md` and study summaries.
- Comparison tables show selected validation minADE6 only. Full vectors from different checkpoints are not substituted into these values. Relative error differences are computed from six-decimal displayed scores.
- Training hours for SEAM context and SHARP composition derive from exact recorded seconds. Other training durations follow the dissertation's rounded hour/minute records. These are not inference-latency measurements.
- SHARP placement uses scene-token Mamba as its displayed comparator; the separate local baseline is identified in the panel note.

## Figure provenance

Original dissertation SVG masters are reproduced unchanged, with descriptive web filenames:

| Website file | Dissertation master |
| --- | --- |
| graphical-abstract.svg / .png | images/graphical_abstract.svg / .png |
| streaming-overview.svg | images/sharp_streaming_overview.svg |
| seam-interventions.svg | images/seam_mamba_placements.svg |
| sharp-architecture.svg | images/sharp_architecture_detailed.svg |

The public repository contains the complete figure gallery at `Results/Figures/Gallery.md`. The website highlights the completed dissertation studies; later implementation-only extensions are not reported as evaluated improvements.

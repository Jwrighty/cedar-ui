# Chromatic for visual regression and a hosted Storybook

Visual regression uses **Chromatic** (hosted, Storybook-native) rather than self-hosted Playwright screenshot tests. This accepts a SaaS dependency in exchange for: a **public hosted-Storybook URL that is the portfolio's primary showcase artifact** (a reviewer sees themed, documented, interactive components from one link), a built-in visual review workflow, and lower delivery risk than hand-rolling a screenshot pipeline. The free tier covers portfolio-scale snapshot volume.

Reversible if needed — stories remain tool-agnostic, so swapping to Playwright snapshots later would not touch component code. Recorded mainly to capture *why* a hosted SaaS was chosen over the free self-hosted route: the public showcase URL is the deciding factor, not the regression testing alone.

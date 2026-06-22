# System scope: own primitives and select composed components; delegate data grids

The design system owns **primitives**, **layout primitives**, and a small, explicitly-stretch set of **composed components** (e.g. FormField, Toast, a Stat/Metric card). It deliberately does **not** build a data grid, complex data table, or heavy data-visualisation components.

Consuming apps bring robust specialised libraries for those needs — **TanStack Table** for data grids being the expected choice — and, where useful, the design system supplies styled cells / typography / tokens rather than a grid abstraction.

## Why

A data grid is a multi-week implementation sink that fights the project's "complete over broad" delivery priority, and specialised libraries do it better than a portfolio reimplementation would. The ownership value this project demonstrates lives in the token architecture, theming, and primitive/composition design — not in re-implementing a grid. Recording the explicit *no* so the catalog isn't later expanded into territory that specialised libraries already own.

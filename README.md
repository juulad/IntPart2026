# Real Estate JV Feasibility App

Static GitHub-runnable app for modeling the U.S. real estate JV feasibility study.

## Run locally

Open `index.html` in a browser.

No build step, package install, or backend is required.

## Run from GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, open **Pages**.
3. Set the Pages source to the repository root on the main branch.
4. Open the generated GitHub Pages URL.

The app links to the research documents in `research/real-estate-jv-tax-2026-06-03/`, so keep that folder in the repository.

## What the calculator supports

- Capital base and net-profit target percentage.
- Jason, Adam, Ben, and Abraham profit split percentages.
- Straight legal split vs. tax-equalized net split.
- State corporate tax, federal corporate tax, U.S. dividend withholding, and Dubai/UAE corporate tax.
- Whether state corporate tax is deductible before federal tax.
- Whether Dubai/UAE corporate tax is applied before or after U.S. withholding.
- Acquisition, renovation, closing, holding, admin, and selling costs.
- Separate 8% Dubai holding company scenario where Jason owns 87%, Adam owns 5%, and the holding company funds the U.S. C corp through a mix of equity and documented debt.
- Debt scenario variables including holding company cash infusion, debt percentage, fixed interest rate, loan term, months outstanding, amortization style, interest withholding, dividend withholding, UAE corporate tax, and Section 163(j)-style interest limitation.
- Debt-form checks for fixed principal, signed note, fixed maturity, creditor remedies, non-contingent interest, and scheduled payment intent.

This is a feasibility model only. It does not replace U.S., UAE, Belgian, U.K., or state tax counsel.

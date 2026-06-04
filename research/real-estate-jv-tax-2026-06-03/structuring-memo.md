# Corporate Structuring Memo - U.S. Midwest Real Estate Flip JV

Date: 2026-06-03

## Executive Summary

The most defensible baseline is a U.S. C corporation blocker that directly owns the flipping business, possibly through state-specific disregarded LLC title companies for liability segregation. This should generally move U.S. real estate operating income and property-sale reporting to the U.S. corporation instead of requiring the foreign investors to file as direct U.S. trade-or-business participants.

The blocker does not eliminate tax. It changes the tax stack:

| Issue | Baseline Result | Risk |
|---|---:|---|
| U.S. federal corporate tax | U.S. C corporation pays corporate income tax on flipping profit. | Medium |
| FIRPTA gross withholding at property sale | Buyer generally should not withhold under FIRPTA when seller is a domestic corporation, subject to proper non-foreign status documentation. | Low/Medium |
| Foreign partner individual filing insulation | Stronger than direct partnership ownership, if foreign partners only receive dividends/interest subject to withholding/reporting. | Medium |
| Dividend repatriation | U.S.-source dividends to foreign investors default to 30% withholding unless treaty applies. | Medium/High |
| Interest repatriation | Can be efficient, but shareholder debt has portfolio-interest, debt/equity, 163(j), treaty, and documentation traps. | High |
| Estate tax | Direct ownership of U.S. corporation stock by NRAs is U.S.-situs property. A domestic blocker alone does not solve estate tax on shares. | High |
| Form 5472 | Likely required if any foreign person directly or indirectly owns 25% and there are reportable transactions. Penalty risk is material. | High |

Primary conclusion: do not rely on an aggressive portfolio debt strategy as the main solution if the foreign investors each own 25% of the borrowing corporation. IRS Publication 515 states that interest paid to a foreign person owning 10% or more of the total combined voting power of the issuing corporation is not portfolio interest. The model may need either treaty-qualified debt, nonvoting equity design, third-party or non-10% lender economics, or foreign holding-company planning.

## Facts Provided

| Fact | Status |
|---|---|
| Venture activity | Acquire and flip Midwest U.S. properties, $100k to $1M, all cash, target gross margins 20% to 40%. |
| Partners | Two U.S. citizens, one U.K. national NRA, one Belgian national NRA. |
| Foreign capital path A | U.K. and Belgian capital originates from Dubai/UAE. |
| Foreign capital path B | U.K. capital originates from Dubai/UAE; Belgian partner deploys capital from existing U.S. bank account. |
| Desired entity | U.S. blocker C corporation. |
| Desired outcomes | Avoid foreign individual filing, avoid 15% FIRPTA gross withholding trap, mitigate U.S. estate tax exposure, optimize repatriation. |

## Missing Facts That Drive the Answer

| Needed Fact | Why It Matters |
|---|---|
| Tax residence of U.K. and Belgian investors | Nationality is not enough for treaty benefits. Treaty residence, beneficial ownership, and limitation-on-benefits must be verified. |
| Whether foreign investors invest personally or through entities | Estate tax, treaty rates, LOB, Form 5472, beneficial ownership, and withholding documentation change significantly. |
| Ownership percentages and voting rights | Portfolio interest has a 10% shareholder exclusion measured by voting power for corporations. |
| Whether capital advances are proportional to equity | Proportional shareholder debt is more vulnerable to debt/equity recharacterization. |
| Expected annual gross receipts and taxable income | Section 163(j), small business exception, state tax, and corporate cash-tax modeling depend on this. |
| Holding period and inventory treatment | Flip property is usually inventory/dealer property, not capital investment property. |
| State footprint | Midwest state tax, withholding, franchise, transfer tax, and sales/use tax vary by state. |
| Belgian/U.K./UAE personal tax positions | Repatriation efficiency depends on home-country taxation, foreign tax credits, and reporting. |

## Baseline Structure

Recommended starting architecture:

| Layer | Entity | Purpose |
|---|---|---|
| Operating parent | U.S. C corporation | Tax blocker, receives partner capital, earns flip income, files Form 1120. |
| Property title cells | State LLCs disregarded to U.S. C corporation | Liability segregation by property or state; should not create foreign partner passthrough exposure if disregarded to U.S. corporation. |
| Foreign investor holding layer | To be determined | Direct individual ownership is simple but leaves U.S.-situs stock estate exposure. |

The U.S. corporation should issue a Form W-9 or non-foreign certification at property closings. FIRPTA withholding under section 1445 is aimed at dispositions by foreign transferors of U.S. real property interests. If the seller is a domestic C corporation, the buyer should generally not apply the 15% foreign-transferor gross withholding regime.

## Scenario A - U.K. and Belgian Funds Sourced From Dubai/UAE

Dubai/UAE source of funds does not itself create a U.S. treaty benefit. There is no U.S.-UAE income tax treaty located in the IRS treaty-document list. The relevant treaty analysis is based on the beneficial owner tax residence and entitlement to benefits, not merely where funds were banked.

Risk level for portfolio debt: High.

Portfolio interest can be exempt from U.S. chapter 3 withholding if the debt is properly documented, in registered form, paid to a foreign beneficial owner, and not disqualified. However:

| Requirement / Trap | Impact |
|---|---|
| Registered-form debt and W-8 documentation | Required for modern obligations. |
| No contingent interest | Interest tied to debtor receipts, profits, property appreciation, dividends, or distributions generally fails portfolio interest. |
| 10% owner exclusion | Interest paid to a foreign person owning 10% or more of the voting power of the issuing corporation is not portfolio interest. |
| Debt/equity doctrine | Shareholder notes that look like equity may be recharacterized. |
| Section 163(j) | Deduction may be limited to 30% of adjusted taxable income unless an exception/election applies. |
| Treaty anti-conduit rules | Treaty interest benefits can fail if the arrangement is a conduit. |

If the foreign partners each hold 25% voting stock, direct shareholder notes from them to the U.S. C corporation are not a clean portfolio interest structure. A safer model would treat treaty-qualified interest separately from portfolio interest, or redesign voting ownership and debt economics before relying on the exemption.

If the U.K. investor is a U.K. treaty resident and beneficial owner, U.S.-source interest is generally taxable only in the U.K. under Article 11, subject to special rules for contingent/special relationship/conduit arrangements. U.S.-source dividends generally cap at 15% for individuals, or 5% for qualifying corporate shareholders owning at least 10% voting power.

If the Belgian investor is a Belgian treaty resident and beneficial owner, U.S.-source interest is generally taxable only in Belgium under Article 11, but certain contingent interest may be taxed by the U.S. up to 15%. Dividends generally cap at 15% for individuals, or 5% for qualifying corporate shareholders owning directly at least 10% voting stock.

Treaty reliance requires valid W-8BEN or W-8BEN-E forms, beneficial ownership, treaty residence, and LOB analysis.

## Scenario B - Belgian Funds From Existing U.S. Bank Account

Risk level: Medium.

The existing U.S. bank account changes cash logistics but usually not the core U.S. tax character of the investment. It does not make the Belgian investor a U.S. tax resident, and it does not automatically convert dividends or interest into domestic-owner payments.

| Issue | Analysis |
|---|---|
| Capital contribution from U.S. bank | Still treated based on the investor and instrument: equity contribution, shareholder loan, or hybrid. |
| Belgian equity/debt split | Should be set by commercial terms, capitalization needs, voting/control design, Section 163(j), treaty position, and debt/equity substance, not simply bank location. |
| Repatriation to Belgium | After U.S. corporate tax, cash can leave as dividends, interest, loan principal repayment, return of capital/liquidation proceeds, or sale redemption proceeds. Each has different U.S. withholding and Belgian tax treatment. |
| U.S. bank deposit interest | NRA bank deposit interest can be excluded under U.S. rules, but once cash becomes U.S. corporate stock, direct stock ownership is U.S.-situs for estate tax. |

For the Belgian partner, treaty-qualified interest may be more robust than portfolio interest if he remains a Belgian treaty resident and beneficial owner, but related-party/special relationship and transfer-pricing support are still required.

## Repatriation Waterfall

| Payment Type | U.S. Treatment | Planning Notes | Risk |
|---|---|---|---|
| Salary/fees to foreign partner | U.S. ECI risk if services performed in U.S.; may create filings. | Avoid unless planned carefully. | High |
| Interest on valid debt | Deductible subject to 163(j), 267, capitalization, transfer pricing; withholding default 30% unless portfolio interest or treaty. | Best tax lever, but must be real debt. | High |
| Return of loan principal | Generally no withholding if true principal repayment. | Must track principal separately from interest. | Medium |
| Dividends | Not deductible; default 30% withholding, treaty may reduce to 15%/5%/0% depending facts. | Simple but double-taxed. | Medium |
| Return of capital / liquidation | Can trigger section 897/FIRPTA-style issues if stock is USRPHC stock, and requires detailed basis/E&P analysis. | Needs counsel before use. | High |
| Sale of U.S. corporation shares | Foreign sale of U.S. real property holding corporation stock can trigger FIRPTA. | Avoid casual exit without tax modeling. | High |

## Section 163(j)

The business interest deduction limitation generally limits deductible business interest to business interest income plus 30% of adjusted taxable income, with complex exceptions. The real property trade or business election can avoid 163(j), but it is irrevocable and requires ADS depreciation for certain real property and qualified improvement property.

For a flipping business, the practical impact may be less about building depreciation and more about inventory/property capitalization, shareholder debt as the main leverage, related-party rates, and annual taxable income support.

## Estate Tax

Risk level: High if foreign investors directly own U.S. corporation stock.

The Form 706-NA instructions state that stock of corporations organized in or under U.S. law is property located in the United States. Therefore, a domestic C corporation blocker does not by itself mitigate U.S. estate tax exposure on shares held directly by NRAs.

Potential estate-tax mitigants to discuss with counsel:

| Mitigant | Concept | Tradeoff |
|---|---|---|
| Foreign holding corporation above U.S. blocker for each NRA | NRA owns foreign corporation stock, which is generally non-U.S.-situs; foreign corporation owns U.S. blocker stock. | May worsen dividend withholding if treaty benefits are lost; LOB and local tax must be modeled. |
| Treaty-resident corporate holding company | Potentially improves treaty dividend/interest rates if LOB satisfied. | Substance, management, beneficial ownership, anti-conduit, and home-country tax required. |
| Debt-heavy investment | Portfolio debt obligations can be non-U.S.-situs for estate tax if they meet requirements. | Portfolio-interest 10% owner and debt/equity issues remain. |
| Life insurance / estate planning | Non-tax structuring layer. | Does not fix income-tax withholding. |

## Compliance Checklist

| Item | Owner | Timing |
|---|---|---|
| Form 1120 | U.S. C corporation | Annual. |
| Form 5472 | U.S. corporation if 25% foreign-owned and reportable transactions occur | Attach to Form 1120; $25,000 penalty risk per failure. |
| Forms W-8BEN / W-8BEN-E | Foreign investors/entities | Before payments; refresh as required. |
| Forms 1042 / 1042-S | U.S. withholding agent | Annual for withholdable payments to foreign persons. |
| FIRPTA closing package | U.S. corporation / title company | Each property disposition. |
| Form 8990 | U.S. corporation if 163(j) applies | Annual with return. |
| State registrations and returns | U.S. corporation and property LLCs | State-by-state. |
| BOI / CTA review | Counsel | Check current injunction/enforcement status before filing decisions. |
| Transfer pricing / debt memo | Tax counsel | Before related-party debt is funded. |

## Preliminary Recommendation

Use the U.S. C corporation blocker for the flipping operations, but do not let the foreign partners directly own U.S. corporation shares until estate tax planning is resolved.

Recommended next modeling structure:

| Option | Description | Risk |
|---|---|---|
| 1. Simple U.S. C corp with direct foreign individual shareholders | Operationally simple; treaty dividends/interest may apply. | High estate tax risk. |
| 2. U.S. C corp with each NRA investing through separate foreign holding company | Better estate-tax posture. | Medium/High treaty, LOB, local tax complexity. |
| 3. U.S. C corp with carefully documented shareholder debt plus limited equity | Tax-efficient if respected. | High debt/equity, 10% owner, 163(j), treaty documentation risk. |
| 4. U.S. C corp with third-party/non-10% portfolio lenders and equity separately | Cleaner portfolio-interest posture. | May not match partner economics unless independently structured. |

For feasibility modeling, compare corporate taxable income after property costs, federal and state tax, withholding on interest, withholding on dividends, home-country tax and credits, estate tax exposure, compliance cost, and audit defensibility.

## Specific Questions for the Partners

1. Are the U.K. and Belgian investors tax residents of the U.K. and Belgium, respectively, or are either UAE tax residents?
2. Will the foreign partners invest personally, through existing companies, through trusts, or through newly formed holding companies?
3. What exact ownership percentages, voting rights, preferred returns, and management rights are intended?
4. Will debt be proportional to ownership, or will some partners be lenders only?
5. What annual acquisition volume and expected annual gross receipts are projected?
6. Which Midwest states will be active first?
7. Will any foreign partner perform services in the United States?
8. Is the desired exit a sale of properties, sale of company stock, redemption, or liquidation?

## Source Notes

- IRS Publication 515: portfolio interest rules, withholding documentation, 10% owner exclusion.
- IRS Publication 519: NRA interest income, FIRPTA withholding certificate overview.
- U.S.-Belgium income tax treaty: Articles 10 and 11 for dividends and interest; Article 13 for gains; Article 21 for LOB.
- U.S.-U.K. income tax treaty: Articles 10 and 11 for dividends and interest; Article 13 for gains; Article 23 for LOB.
- Form 706-NA instructions: U.S.-situs status of domestic corporation stock and treatment of portfolio debt obligations.
- Form 8990 instructions: 163(j) 30% ATI framework and real property trade/business election.
- Form 5472 instructions: 25% foreign-owned U.S. corporation reporting and $25,000 penalty framework.

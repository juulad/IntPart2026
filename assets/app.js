const defaults = {
  mode: "legal",
  capital: 2000000,
  targetNetPct: 30,
  stateTax: 7.9,
  federalTax: 21,
  withholdingTax: 30,
  uaeTax: 9,
  stateDeductible: true,
  uaeTaxBase: "afterWithholding",
  acquisitionCost: 1490000,
  renovationCost: 350000,
  closingCost: 30000,
  holdingCost: 70000,
  adminCost: 30000,
  sellingCost: 169628,
  owners: [
    { id: "jason", name: "Jason", status: "U.S. citizen #1", share: 20, foreign: false },
    { id: "adam", name: "Adam", status: "U.S. citizen #2", share: 5, foreign: false },
    { id: "ben", name: "Ben", status: "Belgian citizen, Dubai tax resident", share: 37.5, foreign: true },
    { id: "abraham", name: "Abraham", status: "U.K. citizen, Dubai tax resident", share: 37.5, foreign: true }
  ]
};

const ids = [
  "mode",
  "capital",
  "targetNetPct",
  "stateTax",
  "federalTax",
  "withholdingTax",
  "uaeTax",
  "stateDeductible",
  "uaeTaxBase",
  "acquisitionCost",
  "renovationCost",
  "closingCost",
  "holdingCost",
  "adminCost",
  "sellingCost"
];

const debtDefaults = {
  debtJasonEquity: 87,
  debtAdamEquity: 5,
  debtHoldcoEquity: 8,
  holdcoInfusion: 1500000,
  debtFundingPct: 90,
  interestRate: 8,
  monthsOutstanding: 18,
  loanTermMonths: 24,
  repaymentType: "bullet",
  debtOperatingProfitPct: 30,
  interestWithholdingRate: 30,
  debtDividendWithholdingRate: 30,
  debtUaeTaxRate: 9,
  preferredReturnRate: 8,
  preferredParticipationPct: 75,
  interestLimitPct: 30,
  debtStateDeductible: "yes",
  applyInterestLimit: true,
  portfolioInterestExemption: true,
  fixedPrincipal: true,
  fixedMaturity: true,
  creditorRights: true,
  nonContingentInterest: true,
  actualPaymentIntent: true
};

const debtIds = Object.keys(debtDefaults);

const ownerContainer = document.getElementById("owners");
const ownerRows = document.getElementById("ownerRows");
const debtRows = document.getElementById("debtRows");
let owners = JSON.parse(JSON.stringify(defaults.owners));

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});

function byId(id) {
  return document.getElementById(id);
}

function readNumber(id) {
  const value = Number(byId(id).value);
  return Number.isFinite(value) ? value : 0;
}

function pct(value) {
  return value / 100;
}

function renderOwnerInputs() {
  ownerContainer.innerHTML = "";
  owners.forEach(function(owner) {
    const card = document.createElement("article");
    card.className = "owner-card";
    card.innerHTML =
      "<h3>" + owner.name + "</h3>" +
      "<p>" + owner.status + "</p>" +
      "<label>" +
      "<span>Profit split %</span>" +
      "<input type=\"number\" min=\"0\" step=\"0.1\" value=\"" + owner.share + "\" data-owner-share=\"" + owner.id + "\">" +
      "</label>";
    ownerContainer.appendChild(card);
  });

  ownerContainer.querySelectorAll("[data-owner-share]").forEach(function(input) {
    input.addEventListener("input", function(event) {
      const id = event.currentTarget.dataset.ownerShare;
      const owner = owners.find(function(item) {
        return item.id === id;
      });
      owner.share = Number(event.currentTarget.value) || 0;
      calculateAndRender();
    });
  });
}

function getInputs() {
  return {
    mode: byId("mode").value,
    capital: readNumber("capital"),
    targetNetPct: readNumber("targetNetPct"),
    stateTax: pct(readNumber("stateTax")),
    federalTax: pct(readNumber("federalTax")),
    withholdingTax: pct(readNumber("withholdingTax")),
    uaeTax: pct(readNumber("uaeTax")),
    stateDeductible: byId("stateDeductible").checked,
    uaeTaxBase: byId("uaeTaxBase").value,
    costs: {
      acquisition: readNumber("acquisitionCost"),
      renovation: readNumber("renovationCost"),
      closing: readNumber("closingCost"),
      holding: readNumber("holdingCost"),
      admin: readNumber("adminCost"),
      selling: readNumber("sellingCost")
    }
  };
}

function effectiveCorpTax(input) {
  if (input.stateDeductible) {
    return input.stateTax + input.federalTax * (1 - input.stateTax);
  }
  return input.stateTax + input.federalTax;
}

function ownerNetMultiplier(owner, input) {
  if (!owner.foreign) {
    return 1;
  }
  if (input.uaeTaxBase === "beforeWithholding") {
    return Math.max(0, 1 - input.withholdingTax - input.uaeTax);
  }
  return (1 - input.withholdingTax) * (1 - input.uaeTax);
}

function ownerTaxes(distribution, owner, input) {
  if (!owner.foreign) {
    return { withholding: 0, uae: 0, net: distribution };
  }
  const withholding = distribution * input.withholdingTax;
  const uaeBase = input.uaeTaxBase === "beforeWithholding" ? distribution : distribution - withholding;
  const uae = uaeBase * input.uaeTax;
  return { withholding: withholding, uae: uae, net: distribution - withholding - uae };
}

function calculate(modeOverride) {
  const input = getInputs();
  const mode = modeOverride || input.mode;
  const targetNet = input.capital * pct(input.targetNetPct);
  const corpRate = effectiveCorpTax(input);
  const projectCost = Object.values(input.costs).reduce(function(sum, value) {
    return sum + value;
  }, 0);
  const splitTotal = owners.reduce(function(sum, owner) {
    return sum + owner.share;
  }, 0);
  const normalizedOwners = owners.map(function(owner) {
    return Object.assign({}, owner, {
      shareRatio: splitTotal > 0 ? owner.share / splitTotal : 0
    });
  });

  let distributable;
  let rows;

  if (mode === "equalized") {
    rows = normalizedOwners.map(function(owner) {
      const targetOwnerNet = targetNet * owner.shareRatio;
      const multiplier = ownerNetMultiplier(owner, input);
      const distribution = multiplier > 0 ? targetOwnerNet / multiplier : 0;
      const taxes = ownerTaxes(distribution, owner, input);
      return Object.assign({ owner: owner, distribution: distribution }, taxes);
    });
    distributable = rows.reduce(function(sum, row) {
      return sum + row.distribution;
    }, 0);
  } else {
    const netFactor = normalizedOwners.reduce(function(sum, owner) {
      return sum + owner.shareRatio * ownerNetMultiplier(owner, input);
    }, 0);
    distributable = netFactor > 0 ? targetNet / netFactor : 0;
    rows = normalizedOwners.map(function(owner) {
      const distribution = distributable * owner.shareRatio;
      const taxes = ownerTaxes(distribution, owner, input);
      return Object.assign({ owner: owner, distribution: distribution }, taxes);
    });
  }

  const preTaxProfit = corpRate < 1 ? distributable / (1 - corpRate) : 0;
  const stateTax = preTaxProfit * input.stateTax;
  const federalBase = input.stateDeductible ? preTaxProfit - stateTax : preTaxProfit;
  const federalTax = federalBase * input.federalTax;
  const corpTax = stateTax + federalTax;
  const grossSaleProceeds = projectCost + preTaxProfit;
  const modeledNet = rows.reduce(function(sum, row) {
    return sum + row.net;
  }, 0);
  const withholding = rows.reduce(function(sum, row) {
    return sum + row.withholding;
  }, 0);
  const uae = rows.reduce(function(sum, row) {
    return sum + row.uae;
  }, 0);

  return {
    mode: mode,
    targetNet: targetNet,
    corpRate: corpRate,
    projectCost: projectCost,
    splitTotal: splitTotal,
    distributable: distributable,
    preTaxProfit: preTaxProfit,
    grossSaleProceeds: grossSaleProceeds,
    stateTax: stateTax,
    federalTax: federalTax,
    corpTax: corpTax,
    withholding: withholding,
    uae: uae,
    modeledNet: modeledNet,
    rows: rows
  };
}

function renderSummaryList(elementId, result) {
  const dl = byId(elementId);
  dl.innerHTML =
    "<dt>Required pre-tax profit</dt><dd>" + money.format(result.preTaxProfit) + "</dd>" +
    "<dt>Gross sale proceeds</dt><dd>" + money.format(result.grossSaleProceeds) + "</dd>" +
    "<dt>Distributable profit</dt><dd>" + money.format(result.distributable) + "</dd>" +
    "<dt>Modeled net profit</dt><dd>" + money.format(result.modeledNet) + "</dd>" +
    "<dt>Foreign withholding</dt><dd>" + money.format(result.withholding) + "</dd>" +
    "<dt>Dubai tax</dt><dd>" + money.format(result.uae) + "</dd>";
}

function readDebtInputs() {
  return {
    jasonEquity: readNumber("debtJasonEquity"),
    adamEquity: readNumber("debtAdamEquity"),
    holdcoEquity: readNumber("debtHoldcoEquity"),
    holdcoInfusion: readNumber("holdcoInfusion"),
    debtFundingPct: pct(readNumber("debtFundingPct")),
    interestRate: pct(readNumber("interestRate")),
    monthsOutstanding: readNumber("monthsOutstanding"),
    loanTermMonths: readNumber("loanTermMonths"),
    repaymentType: byId("repaymentType").value,
    operatingProfitPct: pct(readNumber("debtOperatingProfitPct")),
    interestWithholdingRate: pct(readNumber("interestWithholdingRate")),
    dividendWithholdingRate: pct(readNumber("debtDividendWithholdingRate")),
    uaeTaxRate: pct(readNumber("debtUaeTaxRate")),
    preferredReturnRate: pct(readNumber("preferredReturnRate")),
    preferredParticipationPct: pct(readNumber("preferredParticipationPct")),
    interestLimitPct: pct(readNumber("interestLimitPct")),
    stateDeductible: byId("debtStateDeductible").value === "yes",
    applyInterestLimit: byId("applyInterestLimit").checked,
    portfolioInterestExemption: byId("portfolioInterestExemption").checked,
    fixedPrincipal: byId("fixedPrincipal").checked,
    fixedMaturity: byId("fixedMaturity").checked,
    creditorRights: byId("creditorRights").checked,
    nonContingentInterest: byId("nonContingentInterest").checked,
    actualPaymentIntent: byId("actualPaymentIntent").checked
  };
}

function calculateDebtScenario() {
  const input = readDebtInputs();
  const baseInput = getInputs();
  const corpRate = effectiveCorpTax({
    stateTax: baseInput.stateTax,
    federalTax: baseInput.federalTax,
    stateDeductible: input.stateDeductible
  });
  const capital = readNumber("capital");
  const ownershipTotal = input.jasonEquity + input.adamEquity + input.holdcoEquity;
  const ownershipFactor = ownershipTotal > 0 ? ownershipTotal : 100;
  const jasonRatio = input.jasonEquity / ownershipFactor;
  const adamRatio = input.adamEquity / ownershipFactor;
  const holdcoRatio = input.holdcoEquity / ownershipFactor;
  const debtPrincipal = input.holdcoInfusion * input.debtFundingPct;
  const equityContribution = input.holdcoInfusion - debtPrincipal;
  const months = Math.max(0, Math.min(input.monthsOutstanding, input.loanTermMonths));
  const averagePrincipal = input.repaymentType === "amortizing"
    ? debtPrincipal * Math.max(0, 1 - months / Math.max(input.loanTermMonths, 1) / 2)
    : debtPrincipal;
  const interestExpense = averagePrincipal * input.interestRate * months / 12;
  const operatingProfit = capital * input.operatingProfitPct;
  const interestCap = input.applyInterestLimit ? operatingProfit * input.interestLimitPct : interestExpense;
  const deductibleInterest = Math.min(interestExpense, interestCap);
  const nondeductibleInterest = Math.max(0, interestExpense - deductibleInterest);
  const taxableIncome = Math.max(0, operatingProfit - deductibleInterest);
  const stateTax = taxableIncome * baseInput.stateTax;
  const federalBase = input.stateDeductible ? taxableIncome - stateTax : taxableIncome;
  const federalTax = Math.max(0, federalBase) * baseInput.federalTax;
  const corpTax = stateTax + federalTax;
  const distributableProfit = Math.max(0, operatingProfit - interestExpense - corpTax);
  const taxWithoutDebt = operatingProfit * corpRate;
  const taxShield = Math.max(0, taxWithoutDebt - corpTax);
  const debtFormQualified = input.fixedPrincipal &&
    input.fixedMaturity &&
    input.creditorRights &&
    input.nonContingentInterest &&
    input.actualPaymentIntent;
  const portfolioInterestApplies = input.portfolioInterestExemption &&
    debtFormQualified &&
    input.holdcoEquity < 10;
  const interestWithholdingRate = portfolioInterestApplies ? 0 : input.interestWithholdingRate;
  const interestWithholding = interestExpense * interestWithholdingRate;
  const preferredBase = equityContribution;
  const preferredReturn = preferredBase * input.preferredReturnRate * months / 12;
  const preferredPaid = Math.min(distributableProfit, preferredReturn);
  const residualDividendPool = Math.max(0, distributableProfit - preferredPaid);
  const holdcoParticipatingDividend = residualDividendPool * input.preferredParticipationPct;
  const commonDividendPool = Math.max(0, residualDividendPool - holdcoParticipatingDividend);
  const commonOwnership = jasonRatio + adamRatio;
  const jasonCommonShare = commonOwnership > 0 ? jasonRatio / commonOwnership : 0;
  const adamCommonShare = commonOwnership > 0 ? adamRatio / commonOwnership : 0;
  const holdcoDividend = preferredPaid + holdcoParticipatingDividend;
  const holdcoDividendWithholding = holdcoDividend * input.dividendWithholdingRate;
  const holdcoUaeBase = Math.max(0, interestExpense - interestWithholding + holdcoDividend - holdcoDividendWithholding);
  const holdcoUaeTax = holdcoUaeBase * input.uaeTaxRate;
  const jasonDividend = commonDividendPool * jasonCommonShare;
  const adamDividend = commonDividendPool * adamCommonShare;
  const rows = [
    {
      party: "Jason",
      role: "U.S. citizen shareholder",
      equity: jasonRatio,
      interest: 0,
      dividend: jasonDividend,
      withholding: 0,
      uae: 0,
      net: jasonDividend
    },
    {
      party: "Adam",
      role: "U.S. citizen shareholder",
      equity: adamRatio,
      interest: 0,
      dividend: adamDividend,
      withholding: 0,
      uae: 0,
      net: adamDividend
    },
    {
      party: "Dubai holding company",
      role: "8% voting holder, lender, participating preferred",
      equity: holdcoRatio,
      interest: interestExpense,
      dividend: holdcoDividend,
      withholding: interestWithholding + holdcoDividendWithholding,
      uae: holdcoUaeTax,
      net: interestExpense + holdcoDividend - interestWithholding - holdcoDividendWithholding - holdcoUaeTax
    }
  ];

  return {
    input: input,
    ownershipTotal: ownershipTotal,
    debtPrincipal: debtPrincipal,
    equityContribution: equityContribution,
    operatingProfit: operatingProfit,
    interestExpense: interestExpense,
    deductibleInterest: deductibleInterest,
    nondeductibleInterest: nondeductibleInterest,
    taxableIncome: taxableIncome,
    corpTax: corpTax,
    stateTax: stateTax,
    federalTax: federalTax,
    distributableProfit: distributableProfit,
    preferredBase: preferredBase,
    preferredReturn: preferredReturn,
    preferredPaid: preferredPaid,
    holdcoParticipatingDividend: holdcoParticipatingDividend,
    commonDividendPool: commonDividendPool,
    taxShield: taxShield,
    portfolioInterestApplies: portfolioInterestApplies,
    debtFormQualified: debtFormQualified,
    interestCap: interestCap,
    rows: rows,
    modeledNet: rows.reduce(function(sum, row) {
      return sum + row.net;
    }, 0)
  };
}

function renderDebtSummary(result) {
  byId("debtOwnershipTotal").textContent = result.ownershipTotal.toFixed(1) + "%";
  byId("debtWarning").textContent = Math.abs(result.ownershipTotal - 100) > 0.05
    ? "Ownership percentages are normalized for calculation because they do not total 100%."
    : "";
  byId("debtPrincipal").textContent = money.format(result.debtPrincipal);
  byId("interestExpense").textContent = money.format(result.interestExpense);
  byId("taxShield").textContent = money.format(result.taxShield);
  byId("debtModeledNet").textContent = money.format(result.modeledNet);

  debtRows.innerHTML = result.rows.map(function(row) {
    return "<tr>" +
      "<td>" + row.party + "</td>" +
      "<td>" + row.role + "</td>" +
      "<td class=\"num\">" + percent.format(row.equity) + "</td>" +
      "<td class=\"num\">" + money.format(row.interest) + "</td>" +
      "<td class=\"num\">" + money.format(row.dividend) + "</td>" +
      "<td class=\"num\">" + money.format(row.withholding) + "</td>" +
      "<td class=\"num\">" + money.format(row.uae) + "</td>" +
      "<td class=\"num\">" + money.format(row.net) + "</td>" +
      "</tr>";
  }).join("");

  byId("debtCorpSummary").innerHTML =
    "<dt>Operating profit before interest</dt><dd>" + money.format(result.operatingProfit) + "</dd>" +
    "<dt>Deductible interest</dt><dd>" + money.format(result.deductibleInterest) + "</dd>" +
    "<dt>Nondeductible / carried interest</dt><dd>" + money.format(result.nondeductibleInterest) + "</dd>" +
    "<dt>Taxable income after interest</dt><dd>" + money.format(result.taxableIncome) + "</dd>" +
    "<dt>U.S. corporate tax</dt><dd>" + money.format(result.corpTax) + "</dd>" +
    "<dt>After-tax dividend pool</dt><dd>" + money.format(result.distributableProfit) + "</dd>" +
    "<dt>Preferred return paid</dt><dd>" + money.format(result.preferredPaid) + "</dd>" +
    "<dt>Holdco participating dividend</dt><dd>" + money.format(result.holdcoParticipatingDividend) + "</dd>" +
    "<dt>Common dividend pool</dt><dd>" + money.format(result.commonDividendPool) + "</dd>" +
    "<dt>Holding company equity contribution</dt><dd>" + money.format(result.equityContribution) + "</dd>";

  const quality = [
    {
      ok: result.debtFormQualified,
      text: result.debtFormQualified
        ? "Core debt-form terms are selected: principal, maturity, remedies, fixed interest, and scheduled payments."
        : "Missing one or more debt-form terms. Recharacterization risk increases materially."
    },
    {
      ok: result.portfolioInterestApplies,
      text: result.portfolioInterestApplies
        ? "Interest withholding is modeled at 0% under the portfolio interest assumption."
        : "Interest withholding uses the stated withholding rate because the exemption is off or debt terms do not qualify."
    },
    {
      ok: result.input.holdcoEquity < 10,
      text: result.input.holdcoEquity < 10
        ? "Holding company equity is below 10%, supporting the portfolio-interest ownership requirement."
        : "Holding company equity is 10% or higher, which is a major portfolio-interest problem."
    },
    {
      ok: result.input.preferredParticipationPct <= 0.75,
      text: result.input.preferredParticipationPct <= 0.75
        ? "Participating preferred economics are modeled separately from voting control; counsel should draft the preferred class carefully."
        : "Participating preferred share is above the foreign investors' 75% target economics and may be harder to support commercially."
    },
    {
      ok: result.nondeductibleInterest <= 0,
      text: result.nondeductibleInterest <= 0
        ? "The selected interest amount fits within the modeled interest limitation."
        : "Some interest is modeled as nondeductible or carried because of the selected limitation."
    }
  ];

  byId("debtQualityList").innerHTML = quality.map(function(item) {
    return "<li class=\"" + (item.ok ? "ok" : "risk") + "\">" + item.text + "</li>";
  }).join("");
}

function calculateAndRender() {
  const active = calculate();
  const legal = calculate("legal");
  const equalized = calculate("equalized");
  const capital = readNumber("capital");

  byId("heroPretax").textContent = money.format(active.preTaxProfit);
  byId("heroProceeds").textContent = money.format(active.grossSaleProceeds);
  byId("heroNet").textContent = money.format(active.modeledNet);
  byId("targetNet").textContent = money.format(active.targetNet);
  byId("distributableProfit").textContent = money.format(active.distributable);
  byId("corpTaxTotal").textContent = money.format(active.corpTax);
  byId("pretaxPct").textContent = capital > 0 ? percent.format(active.preTaxProfit / capital) : "0.0%";
  byId("splitTotal").textContent = active.splitTotal.toFixed(1) + "%";
  byId("splitWarning").textContent = Math.abs(active.splitTotal - 100) > 0.05
    ? "Splits are normalized for calculation because they do not total 100%."
    : "";

  ownerRows.innerHTML = active.rows.map(function(row) {
    return "<tr>" +
      "<td>" + row.owner.name + "</td>" +
      "<td>" + row.owner.status + "</td>" +
      "<td class=\"num\">" + percent.format(row.owner.shareRatio) + "</td>" +
      "<td class=\"num\">" + money.format(row.distribution) + "</td>" +
      "<td class=\"num\">" + money.format(row.withholding) + "</td>" +
      "<td class=\"num\">" + money.format(row.uae) + "</td>" +
      "<td class=\"num\">" + money.format(row.net) + "</td>" +
      "</tr>";
  }).join("");

  renderSummaryList("legalSummary", legal);
  renderSummaryList("equalizedSummary", equalized);
  renderDebtSummary(calculateDebtScenario());
}

function reset() {
  owners = JSON.parse(JSON.stringify(defaults.owners));
  ids.forEach(function(id) {
    const element = byId(id);
    if (element.type === "checkbox") {
      element.checked = defaults[id];
    } else {
      element.value = defaults[id];
    }
  });
  renderOwnerInputs();
  calculateAndRender();
}

function resetDebtScenario() {
  debtIds.forEach(function(id) {
    const element = byId(id);
    if (element.type === "checkbox") {
      element.checked = debtDefaults[id];
    } else {
      element.value = debtDefaults[id];
    }
  });
  calculateAndRender();
}

ids.forEach(function(id) {
  byId(id).addEventListener("input", calculateAndRender);
  byId(id).addEventListener("change", calculateAndRender);
});

byId("resetBtn").addEventListener("click", reset);
byId("debtResetBtn").addEventListener("click", resetDebtScenario);

debtIds.forEach(function(id) {
  byId(id).addEventListener("input", calculateAndRender);
  byId(id).addEventListener("change", calculateAndRender);
});

renderOwnerInputs();
calculateAndRender();

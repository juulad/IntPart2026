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

const ownerContainer = document.getElementById("owners");
const ownerRows = document.getElementById("ownerRows");
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

ids.forEach(function(id) {
  byId(id).addEventListener("input", calculateAndRender);
  byId(id).addEventListener("change", calculateAndRender);
});

byId("resetBtn").addEventListener("click", reset);

renderOwnerInputs();
calculateAndRender();

// A small, source-authored teaching example. The one-hot vectors below are
// illustrative stand-ins for AF3's learned MSA projections, not model output.

export function summarizeMsaPair(sequences, firstColumn, secondColumn) {
  if (!Array.isArray(sequences) || sequences.length < 2) {
    throw new Error("an MSA pair example needs at least two rows");
  }
  const width = sequences[0]?.length;
  if (!Number.isInteger(width) || width < 2 || sequences.some((sequence) => sequence.length !== width)) {
    throw new Error("MSA rows must have the same length");
  }
  if (![firstColumn, secondColumn].every((column) => Number.isInteger(column) && column >= 1 && column <= width)
      || firstColumn === secondColumn) {
    throw new Error("select two distinct MSA columns");
  }

  const columns = Array.from({ length: width }, (_, index) => {
    const residues = sequences.map((sequence) => sequence[index]);
    const counts = new Map();
    for (const residue of residues) counts.set(residue, (counts.get(residue) || 0) + 1);
    return {
      residues: [...counts.keys()],
      conservation: Math.max(...counts.values()) / sequences.length,
    };
  });
  const firstResidues = columns[firstColumn - 1].residues;
  const secondResidues = columns[secondColumn - 1].residues;
  const counts = firstResidues.map((first) => secondResidues.map((second) =>
    sequences.filter((sequence) => sequence[firstColumn - 1] === first && sequence[secondColumn - 1] === second).length
  ));
  const oneToOne = firstResidues.length > 1 && secondResidues.length > 1
    && counts.every((row) => row.filter((count) => count > 0).length === 1)
    && counts[0].every((_, column) => counts.filter((row) => row[column] > 0).length === 1);

  return {
    width,
    rowCount: sequences.length,
    columns,
    firstResidues,
    secondResidues,
    counts,
    oneToOne,
    observedCombinations: counts.flat().filter((count) => count > 0).length,
    possibleCombinations: firstResidues.length * secondResidues.length,
  };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function createMsaPairWorkedExample(example) {
  const panel = element("section", "worked-example msa-pair-example");
  panel.dataset.workedExampleId = example.id;
  panel.append(
    element("span", "worked-example-eyebrow", "Synthetic worked example"),
    element("h3", "worked-example-title", example.title),
    element("p", "worked-example-caption", example.caption),
  );

  const instructions = element("p", "msa-example-instructions");
  const takeaway = element("p", "msa-example-takeaway");
  takeaway.setAttribute("role", "status");
  takeaway.setAttribute("aria-live", "polite");
  const legend = element("p", "msa-example-legend", "Green: conserved in all rows. Pale: variable. Outlines: selected i and j.");
  const alignment = element("div", "msa-example-alignment");
  alignment.setAttribute("role", "group");
  alignment.setAttribute("aria-label", "Synthetic multiple sequence alignment");
  const result = element("div", "msa-example-result");
  panel.append(instructions, takeaway, legend, alignment, result);

  let [firstColumn, secondColumn] = example.initial_pair;
  let nextSlot = "i";

  function selectColumn(column) {
    if (nextSlot === "i") {
      if (column === secondColumn) {
        [firstColumn, secondColumn] = [secondColumn, firstColumn];
      } else {
        firstColumn = column;
      }
      nextSlot = "j";
    } else if (column !== firstColumn) {
      secondColumn = column;
      nextSlot = "i";
    }
    render();
  }

  function render() {
    const summary = summarizeMsaPair(example.sequences, firstColumn, secondColumn);
    instructions.textContent = `Select column ${nextSlot} next.`;
    alignment.style.setProperty("--msa-example-residue-columns", String(summary.width));
    alignment.replaceChildren();
    alignment.appendChild(element("span", "msa-example-corner", "row"));
    for (let column = 1; column <= summary.width; column += 1) {
      const role = column === firstColumn ? "i" : (column === secondColumn ? "j" : "");
      const header = element("button", `msa-example-column ${role ? `is-${role}` : ""}`, `${column}${role ? ` · ${role}` : ""}`);
      header.type = "button";
      header.dataset.column = String(column);
      header.setAttribute("aria-label", `Column ${column}${role ? `, selected as ${role}` : ""}; ${summary.columns[column - 1].conservation === 1 ? "conserved" : "variable"}`);
      header.setAttribute("aria-pressed", String(Boolean(role)));
      header.addEventListener("click", () => selectColumn(column));
      alignment.appendChild(header);
    }
    example.sequences.forEach((sequence, row) => {
      alignment.appendChild(element("span", "msa-example-row-label", `S${row + 1}`));
      [...sequence].forEach((residue, index) => {
        const column = index + 1;
        const conservationClass = summary.columns[index].conservation === 1 ? "is-conserved" : "is-variable";
        const roleClass = column === firstColumn ? "is-i" : (column === secondColumn ? "is-j" : "");
        const cell = element("span", `msa-example-residue ${conservationClass} ${roleClass}`, residue);
        cell.title = `Sequence ${row + 1}, column ${column}: ${residue}`;
        alignment.appendChild(cell);
      });
    });

    result.replaceChildren();
    result.appendChild(element("h4", "msa-example-result-title", `Columns ${firstColumn} and ${secondColumn}: toy pair feature`));
    const table = element("table", "msa-example-matrix");
    const caption = element("caption", "", `Mean outer product of one-hot residues at columns ${firstColumn} and ${secondColumn}`);
    table.appendChild(caption);
    const head = element("thead");
    const headRow = element("tr");
    headRow.appendChild(element("th", "", "i / j"));
    summary.secondResidues.forEach((residue) => headRow.appendChild(element("th", "", residue)));
    head.appendChild(headRow);
    table.appendChild(head);
    const body = element("tbody");
    summary.firstResidues.forEach((residue, row) => {
      const tr = element("tr");
      tr.appendChild(element("th", "", residue));
      summary.secondResidues.forEach((_, column) => {
        const count = summary.counts[row][column];
        const cell = element("td", count ? "has-count" : "", `${count}/${summary.rowCount}`);
        cell.setAttribute("aria-label", `${count} of ${summary.rowCount} rows`);
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
    table.appendChild(body);
    result.appendChild(table);
    if (summary.oneToOne) {
      takeaway.textContent = "Each choice at i pairs with one choice at j in these toy rows. The columns vary together.";
    } else if (summary.observedCombinations === summary.possibleCombinations) {
      takeaway.textContent = "Every residue combination appears in these toy rows. This pair lacks the one-to-one pattern shown by columns 2 and 3.";
    } else {
      takeaway.textContent = "The selected columns have a partial pairing pattern in these toy rows. Compare their joint counts below.";
    }
    result.appendChild(element("p", "msa-example-observation",
      `${summary.observedCombinations} of ${summary.possibleCombinations} possible residue combinations appear in these ${summary.rowCount} synthetic rows.`));
    result.appendChild(element("p", "msa-example-caveat",
      "AF3 instead uses learned 32-channel projections and projects their mean outer product into 128 pair channels. This toy matrix is not a contact score or an AF3 output."));
  }

  render();
  return panel;
}

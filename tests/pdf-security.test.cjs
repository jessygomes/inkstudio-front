/* eslint-disable @typescript-eslint/no-require-imports -- Node tests execute the real application PDF generators. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const semver = require("semver");
const { jsPDF } = require("jspdf");
const { createRequire } = require("node:module");
const sharp = createRequire(require.resolve("next/package.json"))("sharp");

test("PDF compression uses the patched fflate version and emits compressed content", () => {
  assert.ok(semver.gte(require("fflate/package.json").version, "0.8.3"));
  const document = new jsPDF({ compress: true });
  document.text("Compression regression test ".repeat(8), 10, 10);
  assert.match(validPdf(document), /\/FlateDecode\b/);
});

function execute(source, constructor = jsPDF) {
  const testModule = { exports: {} };
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(output, {
    module: testModule, exports: testModule.exports, Date, Intl,
    require(name) {
      assert.equal(name, "jspdf", "The pure generator must not import browser/UI dependencies");
      return { __esModule: true, default: constructor };
    },
  });
  return testModule.exports;
}

const root = path.join(__dirname, "..");
const invoiceSource = fs.readFileSync(path.join(root, "lib/utils/pdfGenerator.ts"), "utf8");
const consentPath = path.join(root, "components/Application/Clients/ConsentFormModal.tsx");
const consentSource = fs.readFileSync(consentPath, "utf8");
const consentAst = ts.createSourceFile(consentPath, consentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
// Expose the existing pure function only inside this test harness; the UI is not mounted.
const consentNodes = consentAst.statements.filter(node =>
  (ts.isFunctionDeclaration(node) && node.name?.text === "buildConsentPdf") ||
  (ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(consentAst) === "CONSENT_ITEMS"))
);
assert.equal(consentNodes.length, 2, "Consent generator and its content must be found in the application source");
const consent = execute('import jsPDF from "jspdf";\n' + consentNodes.map(node => node.getText(consentAst)).join("\n") + "\nexport { buildConsentPdf };");

function invoice(data, salonName = "Test Studio") {
  let document;
  let filename;
  // Only intercept browser download I/O. PDF layout, content and serialization are real.
  function CapturePdf(options) {
    document = new jsPDF(options);
    document.save = name => { filename = name; return document; };
    return document;
  }
  execute(invoiceSource, CapturePdf).generateFacturePDF(data, salonName);
  return { document, filename };
}

const client = {
  firstName: "Alice", lastName: "Example", birthDate: "1990-01-01", phone: "0102030405",
  email: "alice@example.test", address: "Test address", isMinor: false, guardianName: "", guardianPhone: "",
};
const facture = {
  id: "invoice-test-12345678", client, dateRdv: "2026-11-02T10:00:00Z", duration: 60,
  estimatedPrice: 125.5, isPayed: false, prestation: "TATTOO", price: 125.5,
  tatoueur: "Test Artist", title: "Test appointment",
  prestationDetails: { size: "medium", zone: "arm", colorStyle: "black", description: "Test artwork" },
};
const signature = async () => "data:image/png;base64," + (await sharp({
  create: { width: 80, height: 24, channels: 3, background: "#123456" },
}).png().toBuffer()).toString("base64");

function validPdf(document) {
  const raw = document.output();
  assert.ok(raw.startsWith("%PDF-"));
  assert.ok(raw.trimEnd().endsWith("%%EOF"));
  assert.ok(document.getNumberOfPages() >= 1);
  assert.doesNotMatch(raw, /\/JavaScript\b|\/JS\b/);
  return raw;
}

test("the installed PDF library meets the DEP-03 security baseline", () => {
  assert.ok(semver.gte(jsPDF.version, "4.2.1"));
  const manifest = require("../package.json");
  assert.equal(manifest.dependencies["@types/jspdf"], undefined);
  assert.equal(manifest.devDependencies?.["@types/jspdf"], undefined);
});

test("a real invoice keeps client, artist, amount and download output", () => {
  const result = invoice(facture);
  const raw = validPdf(result.document);
  for (const expected of ["FACTURE", "Alice Example", "Test Artist", "TATTOO", "125,50", "TOTAL:", "EN ATTENTE"]) {
    assert.ok(raw.includes(expected), `Missing invoice content: ${expected}`);
  }
  assert.equal(result.filename, "Facture_12345678_Alice_Example.pdf");
});

test("paid invoices and piercing details are still generated", () => {
  const result = invoice({ ...facture, isPayed: true, prestation: "PIERCING", prestationDetails: {
    size: "small", zone: "ear", piercingDetails: { zoneOreille: "Lobe" },
  } });
  const raw = validPdf(result.document);
  assert.ok(raw.includes("PIERCING"));
  assert.ok(raw.includes("Lobe"));
  assert.ok(raw.includes("PAY"));
  assert.ok(!raw.includes("EN ATTENTE"));
});

test("optional invoice details can be absent", () => {
  const result = invoice({ ...facture, client: { ...client, email: "", phone: "" }, prestationDetails: undefined });
  validPdf(result.document);
});

test("a signed adult consent embeds a real PNG and produces an uploadable PDF Blob", async () => {
  const document = consent.buildConsentPdf(client, "Test Studio", await signature(), true, false);
  const raw = validPdf(document);
  assert.ok(raw.includes("Alice"));
  assert.ok(raw.includes("Example"));
  assert.ok(raw.includes("Signature du client"));
  assert.match(raw, /\/Subtype \/Image\b/);
  const blob = document.output("blob");
  assert.equal(blob.type, "application/pdf");
  assert.ok(blob.size > 1000);
  assert.ok((await blob.text()).startsWith("%PDF-"));
});

test("minor consent retains legal representative information", async () => {
  const document = consent.buildConsentPdf({ ...client, isMinor: true, guardianName: "Guardian Example", guardianPhone: "0504030201" }, "Test Studio", await signature(), false, true);
  const raw = validPdf(document);
  assert.ok(raw.includes("Guardian Example"));
  assert.ok(raw.includes("0504030201"));
});

test("HTML-shaped client input stays PDF text and does not add JavaScript actions", async () => {
  const marker = '<script>alert("pdf-test")</script>';
  const invoiceResult = invoice({ ...facture, client: { ...client, firstName: marker } });
  assert.ok(validPdf(invoiceResult.document).includes("<script>"));
  const document = consent.buildConsentPdf({ ...client, firstName: marker }, "Test Studio", await signature(), true, true);
  assert.ok(validPdf(document).includes("<script>"));
});

test("malformed signature PNG data is refused", () => {
  assert.throws(() => consent.buildConsentPdf(client, "Test Studio", "data:image/png;base64,bm90LWFuLWltYWdl", true, false));
});

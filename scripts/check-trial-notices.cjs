const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file) {
  const context = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports;
}
const { getTrialNotice } = load('lib/trial-reminders.ts');
const { isInkeraTrialEligible } = load('lib/offers.ts');
const now = Date.parse('2026-10-23T10:00:00Z');
const trial = (days, extra={}) => ({ planStatus: 'TRIAL', currentPlan: 'BUSINESS', hasStripeSubscription: false, trialEndDate: new Date(now+days*86400000).toISOString(), ...extra });
for(const days of [7,3,1,0.5]) assert.equal(getTrialNotice(trial(days),now).daysLeft,Math.ceil(days));
for(const data of [trial(8),trial(0),trial(-1),trial(3,{planStatus:'ACTIVE'}),trial(3,{hasStripeSubscription:true}),trial(3,{trialEndDate:'invalid'}),trial(3,{currentPlan:'FREE'})]) assert.equal(getTrialNotice(data,now),null);
assert.equal(getTrialNotice(trial(3,{currentPlan:'PRO'}),now).plan,'PRO');
assert.equal(isInkeraTrialEligible('user_salon','BUSINESS'),true);
assert.equal(isInkeraTrialEligible('user_tatoueur','PRO'),true);
assert.equal(isInkeraTrialEligible('user_salon','PRO'),false);
assert.equal(isInkeraTrialEligible('user_tatoueur','BUSINESS'),false);
console.log('16 checks passed: trial notice thresholds, expiry, subscription suppression and role eligibility.');

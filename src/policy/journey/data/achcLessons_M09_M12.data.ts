import type { Lesson } from './achcContentTypes';

const IMG = {
  M09: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
  M10: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=600&auto=format&fit=crop',
  M11: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
  M12: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
};

export const achcLessons_M09_M12: Lesson[] = [

  /* ══════════════════════ M09 Corporate Compliance ══════════════════════ */

  {
    lesson_id: 'achc_m09_l0', topic_id: 'ACHC-ART-M09', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m09_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'A coworker tells you during lunch: "I always round up my visit time to the next 15-minute increment. Everyone does it — it\'s only a few minutes. The company bills more and we look more productive. Nobody checks." You know the Agency bills Medicare per visit documentation.\n\nThis practice MOST accurately represents:',
        narration_script: 'Pre-assessment. A coworker tells you she always rounds up visit time to the next 15-minute increment. She says everyone does it, it\'s only a few minutes, and nobody checks. You know the Agency bills Medicare based on visit documentation. What does this practice most accurately represent?',
        audio_path: '/training-audio/ACHC-ART-M09/l0/hook.wav', image_url: IMG.M09, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'A harmless time-saving shortcut that everyone uses', isCorrect: false, rationale: '"Everyone does it" is never a legal defense. Falsifying time records that support billing = federal fraud exposure.' },
          { id: 'B', label: 'Potential federal healthcare fraud — falsifying documentation supporting Medicare billing, triggering False Claims Act penalties for the individual AND the Agency', isCorrect: true, rationale: 'Correct — documentation supports billing claims. Inaccurate documentation = potentially false claims with individual criminal liability.' },
          { id: 'C', label: 'A minor policy violation that only HR would care about', isCorrect: false, rationale: 'Federal fraud charges are not HR matters. The False Claims Act creates individual and organizational liability.' },
          { id: 'D', label: 'Acceptable because the patient still received care', isCorrect: false, rationale: 'Medical necessity of the care does not authorize falsifying the time of service. Billing accuracy is independent of care delivery.' },
        ],
      },
      {
        card_id: 'achc_m09_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define corporate compliance and explain why healthcare organizations require compliance programs.\n2. Identify the 7 minimum elements of an effective compliance program.\n3. Describe the penalties organizations and individuals face for non-compliance.\n4. Explain the Whistleblower Protection Act and how to report fraud, waste, and abuse.\n5. Recognize common compliance risks in daily clinical activities (documentation, billing, referrals).\n6. Describe the role of the Compliance Officer and the internal reporting process.',
        narration_script: 'Learning objectives. One: define corporate compliance and explain why healthcare organizations need compliance programs. Two: identify the seven minimum elements of an effective compliance program. Three: describe penalties for non-compliance. Four: explain the Whistleblower Protection Act and how to report fraud, waste, and abuse. Five: recognize compliance risks in daily clinical activities. Six: describe the Compliance Officer\'s role and the internal reporting process.',
        audio_path: '/training-audio/ACHC-ART-M09/l0/objectives.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m09_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Corporate Compliance Program — System to detect and prevent law violations. Required for all healthcare organizations. Without one: mandatory corporate probation.\n\nFalse Claims Act — Federal law imposing liability for submitting false claims to government programs. Your documentation supports billing claims.\n\nWhistleblower Protection Act — Federal protection for employees who report fraud, waste, and abuse. Cannot be fired or demoted for reporting.\n\nOrganizational Sentencing Guidelines — Federal guidelines making penalties uniform; incentivize compliance programs.\n\nCompliance Officer — Designated person receiving complaints. Must be accessible DIRECTLY — not through management chain.\n\nOIG — Office of Inspector General. HHS office investigating fraud. Fraud hotline: 1-800-HHS-TIPS.\n\nKickback — Payment or benefit for patient referrals. Strictly illegal under Anti-Kickback Statute. No minimum threshold.',
        narration_script: 'Seven key terms. Corporate Compliance Program: required for all healthcare organizations — without one, mandatory corporate probation. False Claims Act: federal liability for false claims to government programs — your documentation supports billing. Whistleblower Protection Act: federal protection for employees reporting fraud — cannot be fired or demoted. Organizational Sentencing Guidelines: federal guidelines that incentivize compliance programs by reducing penalties when programs exist. Compliance Officer: directly accessible, not through the management chain. OIG: Office of Inspector General — HHS fraud hotline is 1-800-HHS-TIPS. Kickback: anything of value exchanged for patient referrals is illegal under the Anti-Kickback Statute — no minimum threshold.',
        audio_path: '/training-audio/ACHC-ART-M09/l0/concepts.wav', image_url: IMG.M09, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m09_l1', topic_id: 'ACHC-ART-M09', title: 'Lesson 1: Why Compliance Programs Exist', order: 1,
    cards: [
      {
        card_id: 'achc_m09_l1_s', type: 'summary', title: 'Unintentional Violations Still Carry Penalties',
        content: 'Compliance programs exist because UNINTENTIONAL violations of healthcare law still carry significant penalties. "I didn\'t know" is not a defense — the law requires due diligence. Having a program AND following it significantly reduces penalties if violations occur.',
        narration_script: 'Compliance programs exist because unintentional violations of healthcare law still carry significant penalties. "I didn\'t know" is not a defense — the law requires due diligence. Having a program AND following it significantly reduces penalties if violations do occur.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/summary.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m09_l1_c1', type: 'content', title: 'The Compliance Framework',
        content: 'The 1991 Organizational Sentencing Guidelines (Chapter 8) created the compliance program framework.\n\nPenalties for non-compliance: fines, imprisonment, restitution, sanctions, forfeiture, corporate probation.\n\nCorporate probation: intrusive federal monitoring + government-authored compliance program imposed on the organization (far more expensive and disruptive than maintaining your own).\n\nMitigating factors (reduce penalties): effective compliance program + cooperation with investigation.\nAggravating factors (increase penalties): no program, high-level management involvement, obstruction.\n\nApplies to ALL business forms — not just corporations.',
        narration_script: 'The 1991 Organizational Sentencing Guidelines created the compliance framework. Penalties for non-compliance include fines, imprisonment, restitution, sanctions, forfeiture, and corporate probation. Corporate probation means intrusive federal monitoring and a government-authored compliance program — far more expensive than maintaining your own. Mitigating factors that reduce penalties include an effective compliance program and cooperation with investigations. Aggravating factors include having no program, high-level management involvement, and obstruction. This applies to all business forms.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/content1.wav', image_url: IMG.M09, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m09_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Your documentation DIRECTLY supports billing claims — accuracy isn\'t optional\n• "I didn\'t know" and "everyone does it" are NEVER legal defenses\n• Having a compliance program AND following it = significantly reduced penalties if violations occur\n• NOT having a program = mandatory corporate probation (government takes over your compliance)\n• Internal audits happen — document accurately ALWAYS, not just when you think you\'re being watched\n• Your compliance obligation is PERSONAL — you are individually accountable',
        narration_script: 'Takeaways. Your documentation directly supports billing claims — accuracy is not optional. "I didn\'t know" and "everyone does it" are never legal defenses. Having and following a compliance program significantly reduces penalties. Not having a program means mandatory corporate probation. Internal audits happen — document accurately always. And your compliance obligation is personal — you are individually accountable.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/takeaways.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m09_l1_ch', type: 'challenge', title: 'Challenge: Pre-Audit Backdating Request',
        content: 'The Agency receives a Medicare audit letter requesting documentation for 30 patient visits from last quarter. Your supervisor tells you: "Some of those charts are missing signatures. Can you go back and sign them today so we can submit the audit response?" The visits were months ago.\n\nWhat is the CORRECT response?',
        narration_script: 'Challenge scenario. The Agency receives a Medicare audit letter for 30 patient visits. Your supervisor asks you to go back and sign charts that are missing signatures so they can be submitted in the audit response. The visits were months ago. What is the correct response?',
        audio_path: '/training-audio/ACHC-ART-M09/l1/challenge.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Sign the charts — they\'re your patients and you did provide the care', isCorrect: false, rationale: 'Adding signatures specifically in response to an audit creates appearance of documentation fraud, regardless of whether care was provided.' },
          { id: 'B', label: 'Refuse and report to the Compliance Officer; backdating to support an audit is potentially fraudulent regardless of whether care was actually provided', isCorrect: true, rationale: 'Correct — documentation integrity is foundational. The Compliance Officer determines appropriate response to the audit gap.' },
          { id: 'C', label: 'Sign them but add today\'s date so it\'s technically not backdating', isCorrect: false, rationale: 'Late signatures in response to an audit without Compliance Officer guidance may still constitute fraud.' },
          { id: 'D', label: 'Tell your supervisor to handle it — it\'s not your problem', isCorrect: false, rationale: 'You have a personal obligation to refuse potentially fraudulent requests. "Not my problem" does not shield you from liability.' },
        ],
      },
      {
        card_id: 'achc_m09_l1_deb', type: 'content', title: 'Operational Debrief: Audit Integrity',
        content: 'Documentation integrity is a cornerstone of compliance. Retroactively adding signatures specifically because of an audit = manipulating records to support billing.\n\nWhy the others fail:\n• A: Even if care was provided, retroactive signing to address an audit gap transforms a documentation deficiency into potential fraud\n• C: "Late signatures" added in response to an audit without Compliance Officer guidance are still potentially fraudulent\n• D: Personal obligation to refuse participation in potentially fraudulent activity — "not my problem" is not a defense\n\nLegal impact: False Claims Act = treble damages + $11,000+ per false claim. Individual criminal liability is possible.\n\nSurvey implication: ACHC reviews documentation integrity; patterns of late audit-response signatures = automatic red flag.',
        narration_script: 'Debrief. Documentation integrity is foundational. Adding signatures specifically because of an audit transforms a documentation deficiency into potential fraud. Option A fails because retroactive signing to support an audit gap is potentially fraudulent regardless of whether care occurred. Option C is still risky without Compliance Officer guidance. Option D fails because you have a personal obligation to refuse fraudulent requests. Legal impact: treble damages plus over $11,000 per false claim, with individual criminal liability possible. ACHC flags patterns of late audit-response signatures.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/debrief.wav', image_url: IMG.M09, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m09_l2', topic_id: 'ACHC-ART-M09', title: 'Lesson 2: Seven Elements of an Effective Program', order: 2,
    cards: [
      {
        card_id: 'achc_m09_l2_s', type: 'summary', title: 'Direct Access to Compliance Officer — Not Through Management',
        content: 'You must have DIRECT access to the Compliance Officer — not through your supervisor. This is non-negotiable. If the compliance concern involves your supervisor, you report directly to the Compliance Officer or, if necessary, directly to the OIG.',
        narration_script: 'You must have direct access to the Compliance Officer — not through your supervisor. This is non-negotiable. If the compliance concern involves your supervisor, you report directly to the Compliance Officer or, if the Compliance Officer is the problem, directly to the OIG.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/summary.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m09_l2_c1', type: 'content', title: 'The 7 Minimum Elements',
        content: '1. Written policies, procedures, and standards of conduct\n2. Designation of Compliance Officer and Compliance Committee\n3. Effective training and continuing education\n4. Open communication lines — receiving complaints, protecting reporters\n5. Internal auditing to monitor compliance\n6. Disciplinary guidelines for non-compliance (publicized, known to all)\n7. Prompt response to detected offenses with corrective action\n\nWhistleblower Protection:\n• Federal protection for employees reporting to OIG\n• Cannot be fired, demoted, or retaliated against\n• Whistleblower poster MUST be posted in the office (visible to all)',
        narration_script: 'The seven minimum elements. One: written policies, procedures, and standards of conduct. Two: designated Compliance Officer and Compliance Committee. Three: effective training and continuing education. Four: open communication lines protecting reporters from retaliation. Five: internal auditing. Six: publicized disciplinary guidelines for non-compliance. Seven: prompt response to detected offenses with corrective action. Whistleblower Protection: federal protection for employees reporting to the OIG — cannot be fired, demoted, or retaliated against. The whistleblower poster must be posted and visible to all employees.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/content1.wav', image_url: IMG.M09, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m09_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Direct access to Compliance Officer — not through management chain\n• Retaliation for compliance reporting is itself a federal crime\n• Disciplinary guidelines are publicized — you should know what happens if you violate\n• Internal audits happen — document accurately ALWAYS\n• Even UNINTENTIONAL errors must be promptly reported and corrected\n• Whistleblower protection is REAL — use the system before problems escalate',
        narration_script: 'Takeaways. Direct access to the Compliance Officer, not through the management chain. Retaliation for compliance reporting is a federal crime. Disciplinary guidelines are publicized — know them. Document accurately always because internal audits happen. Even unintentional errors must be promptly reported and corrected. Whistleblower protection is real — use the system before problems escalate.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/takeaways.wav', image_url: IMG.M09, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m09_l2_ch', type: 'challenge', title: 'Challenge: Colleague Billing Discrepancy',
        content: 'You discover a colleague has been documenting visits to a patient who was hospitalized for the past week. Most entries say "patient not available — rescheduled." But one entry says "visit completed" for a date the patient was confirmed in the hospital.\n\nWhat is your OBLIGATION?',
        narration_script: 'Challenge scenario. You discover a colleague has been documenting visits to a patient who was actually hospitalized for the past week. Most entries say the patient was not available, but one says "visit completed" for a date the patient was in the hospital. What is your obligation?',
        audio_path: '/training-audio/ACHC-ART-M09/l2/challenge.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Talk to the colleague first — it might be an honest mistake', isCorrect: false, rationale: 'Confronting the colleague may cause them to alter records or deny it, delaying formal investigation.' },
          { id: 'B', label: 'Report the discrepancy to the Compliance Officer — involves documentation that may support false billing regardless of intent', isCorrect: true, rationale: 'Correct — you are not the investigator. Report the discrepancy to the Compliance Officer who has authority and training to evaluate it.' },
          { id: 'C', label: 'Report only the "visit completed" entry since that\'s clearly wrong, and ignore the rescheduling entries', isCorrect: false, rationale: 'You are not qualified to determine which documentation errors are "clearly wrong" vs. "probably fine." Report all discrepancies.' },
          { id: 'D', label: 'Mind your own business — it\'s between the colleague and supervisor', isCorrect: false, rationale: 'Knowledge of potential fraud/waste/abuse creates a reporting duty. "Mind your own business" is not a legal defense.' },
        ],
      },
      {
        card_id: 'achc_m09_l2_deb', type: 'content', title: 'Operational Debrief: Compliance Reporting Duty',
        content: 'You are not the investigator. Your obligation is to report discrepancies that could affect billing integrity.\n\nWhy the others fail:\n• A: Confronting the colleague may cause record alteration or denial, plus delays formal investigation\n• C: You\'re not qualified to evaluate which discrepancies are "serious enough." Report all of them\n• D: Knowledge of potential fraud creates a reporting duty. "Mind your own business" is not a defense\n\nWhistleblower protection: if you fear internal reporting won\'t be handled properly, you can report directly to OIG (1-800-HHS-TIPS) with federal protection.\n\nPost-reporting: the Compliance Officer determines intent and appropriate response — your job ends at the report.',
        narration_script: 'Debrief. You are not the investigator. Report discrepancies to the Compliance Officer. Option A risks record alteration and delays formal investigation. Option C is wrong because you are not qualified to determine which discrepancies matter — report all of them. Option D fails because knowledge of potential fraud creates a reporting duty. If you fear internal reporting won\'t be handled properly, report directly to the OIG at 1-800-HHS-TIPS with federal protection. Your job ends at the report — the Compliance Officer takes it from there.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/debrief.wav', image_url: IMG.M09, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m09_l3', topic_id: 'ACHC-ART-M09', title: 'Lesson 3: Daily Compliance Risks for Field Workers', order: 3,
    cards: [
      {
        card_id: 'achc_m09_l3_s', type: 'summary', title: 'Your Documentation Directly Supports Billing Claims',
        content: 'Every note you write, every time you record, every signature you make directly supports a billing claim submitted to Medicare or Medicaid. Inaccurate documentation — even unintentional — can constitute a false claim with federal penalties. Compliance is not a back-office function; it lives in your clinical documentation.',
        narration_script: 'Every note you write, every visit time you record, every signature you make directly supports a billing claim submitted to Medicare or Medicaid. Inaccurate documentation — even unintentional — can constitute a false claim with federal penalties. Compliance is not a back-office function. It lives in your clinical documentation.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/summary.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m09_l3_c1', type: 'content', title: 'Common Compliance Risks in the Field',
        content: 'Documentation risks:\n• Rounding up visit time\n• Signing without reading (or signing blank forms)\n• Documenting what "should have" happened vs. what did happen\n• Late entries without indicating "late entry" and reason\n\nReferral/relationship risks:\n• Accepting gifts from DME companies, vendors, or referral sources\n• Giving patients inducements to choose a specific provider\n• Referring patients to entities where you have a financial interest\n\nScope of practice risks:\n• Performing tasks outside your licensure\n• Not following supervision requirements\n\nAll of the above can constitute compliance violations with individual liability.',
        narration_script: 'Common compliance risks in the field. Documentation: rounding up visit time, signing without reading, documenting what should have happened rather than what did, and late entries without indicating they are late. Referral and relationship risks: accepting gifts from DME companies or referral sources, inducing patients to choose a specific provider, and referring to entities where you have a financial interest. Scope of practice risks: performing tasks outside your licensure and not following supervision requirements. All of these constitute compliance violations with individual liability.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/content1.wav', image_url: IMG.M09, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m09_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Document what HAPPENED, not what should have happened\n• Never round up visit time — document actual start and end\n• Accepting gifts from vendors may violate the Anti-Kickback Statute — even low-value items when tied to referral expectations\n• Report even ACCIDENTAL billing errors immediately — prompt correction is a compliance mitigating factor\n• Scope of practice adherence is a compliance obligation, not just a clinical one\n• "Small" shortcuts become patterns that audits detect',
        narration_script: 'Takeaways. Document what happened, not what should have happened. Never round up visit time — document actual start and end. Accepting gifts from vendors may violate the Anti-Kickback Statute even for low-value items tied to referral expectations. Report even accidental billing errors immediately — prompt correction is a compliance mitigating factor. Scope of practice adherence is a compliance obligation, not just a clinical one. Small shortcuts become patterns that audits detect.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/takeaways.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m09_l3_ch', type: 'challenge', title: 'Challenge: DME Kickback Offer',
        content: 'A local DME company representative approaches you: "For every patient you refer to us for hospital beds and wheelchairs, we\'ll give your Agency a $50 gift card to the office supply store. We also have branded pens and notepads for your nursing bag."\n\nThis arrangement MOST accurately represents:',
        narration_script: 'Challenge scenario. A DME company representative offers a $50 office supply gift card for every patient you refer for hospital beds and wheelchairs, and offers branded pens and notepads for your nursing bag. What does this arrangement most accurately represent?',
        audio_path: '/training-audio/ACHC-ART-M09/l3/challenge.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Normal business relationship — gift cards for referrals are standard practice', isCorrect: false, rationale: 'This is not normal — it is illegal. Many people don\'t recognize kickbacks because they\'re disguised as "business incentives."' },
          { id: 'B', label: 'A potential Anti-Kickback Statute violation — offering anything of value in exchange for patient referrals to a Medicare/Medicaid-participating provider is illegal', isCorrect: true, rationale: 'Correct — the statute prohibits offering, paying, soliciting, or receiving anything of value to induce referrals. No minimum dollar threshold.' },
          { id: 'C', label: 'Acceptable as long as the patients actually need the equipment', isCorrect: false, rationale: 'Medical necessity of the referral is irrelevant to whether the kickback arrangement is illegal.' },
          { id: 'D', label: 'Only a problem if the gift cards are over $100', isCorrect: false, rationale: 'There is NO safe harbor amount in the Anti-Kickback Statute. Even branded pens can be problematic when tied to referral expectations.' },
        ],
      },
      {
        card_id: 'achc_m09_l3_deb', type: 'content', title: 'Operational Debrief: Recognizing Kickbacks',
        content: '"$50 per referral" is textbook kickback regardless of value and regardless of medical necessity.\n\nWhy the others fail:\n• A: "Normal business" framing is how kickbacks are disguised. The law applies regardless of how it\'s presented\n• C: You cannot pay for referrals even for legitimately needed services\n• D: There is no minimum safe harbor amount. Even a pen with an implied referral expectation can be problematic\n\nPenalty: Anti-Kickback Statute = up to $100,000 fine + 10 years imprisonment per violation + exclusion from all federal programs.\n\nYour action: Report the approach to your Compliance Officer immediately. Do not accept anything — including the pens.',
        narration_script: 'Debrief. "$50 per referral" is a textbook kickback regardless of the value or medical necessity. Option A is wrong — kickbacks are often disguised as normal business relationships. Option C is wrong — medical necessity doesn\'t legalize paying for referrals. Option D is wrong — there is no safe harbor amount. The Anti-Kickback Statute carries up to $100,000 per violation plus 10 years imprisonment, plus exclusion from federal programs. Your action: report to the Compliance Officer immediately and accept nothing — including the pens.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/debrief.wav', image_url: IMG.M09, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m09_l4', topic_id: 'ACHC-ART-M09', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m09_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Corporate compliance protects you AND the organization — it\'s not just bureaucracy\n2. Your documentation directly supports billing claims — inaccurate documentation = potential fraud\n3. You have DIRECT access to the Compliance Officer without going through your supervisor\n4. Whistleblower protection is FEDERAL LAW — retaliation is itself a violation\n5. Anti-Kickback: ANYTHING of value exchanged for referrals is illegal — no minimum threshold\n6. "I didn\'t know" and "everyone does it" are NEVER defenses\n\nOperational bridge: Your preceptor will evaluate documentation accuracy, understanding of billing implications, and knowledge of the compliance reporting process.',
        narration_script: 'Six takeaways. One: corporate compliance protects you and the organization. Two: your documentation directly supports billing claims — inaccuracy is potential fraud. Three: you have direct access to the Compliance Officer. Four: whistleblower protection is federal law. Five: anything of value for referrals is illegal — no minimum threshold. Six: "I didn\'t know" and "everyone does it" are never defenses. Your preceptor will evaluate documentation accuracy, your understanding of billing implications, and your knowledge of the compliance reporting process.',
        audio_path: '/training-audio/ACHC-ART-M09/l4/synthesis.wav', image_url: IMG.M09, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m09_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. Compliance is PERSONAL — you are individually liable for your documentation and actions\n2. "Everyone does it" has never successfully defended a federal fraud charge\n3. Small documentation shortcuts today become patterns that audits detect tomorrow\n4. The Compliance Officer is your ALLY, not the enemy — use the system before problems escalate\n5. Retaliation for reporting is a separate federal crime — you are PROTECTED when you report\n\nConfidence check: How confident are you in recognizing compliance risks in your daily field activities?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: compliance is personal — you are individually liable. Two: "everyone does it" has never defended a fraud charge. Three: small shortcuts become patterns that audits detect. Four: the Compliance Officer is your ally — use the system. Five: retaliation for reporting is a separate federal crime — you are protected. How confident are you in recognizing compliance risks in your daily field activities?',
        audio_path: '/training-audio/ACHC-ART-M09/l4/finaldebrief.wav', image_url: IMG.M09, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m09_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Documentation accuracy and completeness\n• Time recording practices\n• Understanding of how documentation supports billing\n• Knowledge of the compliance reporting pathway\n• Ability to recognize kickback or inducement situations\n\nResources:\n• Agency Corporate Compliance Plan (full document)\n• Compliance Officer contact information\n• OIG Fraud Hotline: 1-800-HHS-TIPS\n• Whistleblower Protection information poster\n• Anti-Kickback Statute quick reference',
        narration_script: 'Operational next steps. Your preceptor will evaluate: documentation accuracy, time recording practices, your understanding of how documentation supports billing, your knowledge of the compliance reporting pathway, and your ability to recognize kickbacks or inducements. Resources: Agency Corporate Compliance Plan, Compliance Officer contact, OIG Fraud Hotline 1-800-HHS-TIPS, whistleblower protection poster, and Anti-Kickback Statute quick reference.',
        audio_path: '/training-audio/ACHC-ART-M09/l4/nextsteps.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m09_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The module clarified my personal compliance responsibilities. (1–5)\n2. The fraud/abuse scenarios were realistic and helpful. (1–5)\n3. The reporting process was clearly explained. (1–5)\n4. I feel more prepared to identify compliance risks in my daily work. (1–5)\n5. What compliance topic would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the clarity of your personal compliance responsibilities, the realism of the fraud and abuse scenarios, the clarity of the reporting process, and your preparedness to identify compliance risks. Also share what compliance topic you want more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M09/l4/survey.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M10 Ethics ══════════════════════ */

  {
    lesson_id: 'achc_m10_l0', topic_id: 'ACHC-ART-M10', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m10_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You are caring for a terminally ill patient with a valid DNR order. During your visit, the patient goes into cardiac arrest. The patient\'s adult son arrives, sees you not performing CPR, and screams: "SAVE HIM! I don\'t care about that paper — he\'s my FATHER!" He begins pushing you toward the patient.\n\nWhat is the ETHICALLY and LEGALLY correct action?',
        narration_script: 'Pre-assessment. You are caring for a terminally ill patient with a valid DNR order. The patient goes into cardiac arrest. The son arrives and screams at you to save his father, saying he doesn\'t care about the paper. He begins pushing you. What is the ethically and legally correct action?',
        audio_path: '/training-audio/ACHC-ART-M10/l0/hook.wav', image_url: IMG.M10, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Begin CPR — the family member\'s distress overrides the DNR in the moment', isCorrect: false, rationale: 'A valid DNR is a legally binding document. Family distress — even extreme — does not override it.' },
          { id: 'B', label: 'Honor the DNR as legally binding; calmly explain the patient\'s wishes while ensuring your physical safety; contact supervisor/physician; support the family\'s grief without overriding the directive', isCorrect: true, rationale: 'Correct — the DNR is legally binding. Your job is to honor the patient\'s documented wishes while managing the family\'s distress and ensuring your own safety.' },
          { id: 'C', label: 'Leave immediately — this is above your pay grade', isCorrect: false, rationale: 'Abandoning a patient during cardiac arrest — even with a DNR — is not appropriate. You must stay and support the situation.' },
          { id: 'D', label: 'Ask the son to sign something overriding the DNR, then begin CPR', isCorrect: false, rationale: 'A family member cannot verbally or in writing override a valid, legal advance directive that the patient completed while competent.' },
        ],
      },
      {
        card_id: 'achc_m10_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define healthcare ethics and distinguish ethical obligations from legal requirements.\n2. Identify the major categories of ethical issues in home health.\n3. Apply the Agency\'s Code of Ethics across its 5 domains.\n4. Describe the Ethics Committee\'s role and how to initiate ethical consultation.\n5. Navigate situations where personal values conflict with professional duty.\n6. Document ethical decisions and their rationale defensibly.',
        narration_script: 'Learning objectives. One: define healthcare ethics and distinguish it from legal requirements. Two: identify major categories of ethical issues in home health. Three: apply the Agency\'s Code of Ethics across its five domains. Four: describe the Ethics Committee\'s role and how to initiate consultation. Five: navigate value conflicts without compromising patient care. Six: document ethical decisions and their rationale defensibly.',
        audio_path: '/training-audio/ACHC-ART-M10/l0/objectives.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m10_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Healthcare Ethics — Making decisions that consider patient beliefs, wishes, and welfare alongside medical best practices. For gray areas where law alone doesn\'t provide answers.\n\nEthics Committee — Ad Hoc committee of the Professional Advisory Committee. Consult for ANY genuine ethical dilemma.\n\nAdvance Directive — Legally binding. Overriding it = assault/battery. MUST be honored.\n\nPatient Autonomy — Patient\'s right to make their own decisions — even "bad" ones. Overridden only by court order.\n\nInformed Consent — Complete information before agreeing to treatment. Without it = legally battery.\n\nProfessional Boundaries — No sexual relationships, no financial entanglement, no dual relationships. Violations = termination + criminal charges.\n\nConscientious Objection — Staff right to decline specific procedures conflicting with beliefs. Does NOT apply to refusing entire categories of patients.',
        narration_script: 'Seven key terms. Healthcare Ethics: for gray areas where law alone doesn\'t provide answers. Ethics Committee: consult for any genuine ethical dilemma. Advance Directive: legally binding — overriding it is assault or battery. Patient Autonomy: the right to make decisions even bad ones — overridden only by court order. Informed Consent: without it, treatment is legally battery. Professional Boundaries: no sexual relationships, no financial entanglement — violations lead to termination and criminal charges. Conscientious Objection: staff right to decline specific procedures — does NOT apply to refusing entire patient categories.',
        audio_path: '/training-audio/ACHC-ART-M10/l0/concepts.wav', image_url: IMG.M10, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m10_l1', topic_id: 'ACHC-ART-M10', title: 'Lesson 1: Ethical Framework & Major Issues', order: 1,
    cards: [
      {
        card_id: 'achc_m10_l1_s', type: 'summary', title: 'Legal ≠ Ethical. Ethical ≠ Legal.',
        content: 'Something can be legal but not ethical, and ethical but not legal. Healthcare professionals navigate ethical decisions daily — not just in dramatic end-of-life situations. The Ethics Committee exists to help you navigate genuine dilemmas. Use it.',
        narration_script: 'Something can be legal but not ethical, and ethical but not legal. Healthcare professionals navigate ethical decisions daily — not just in dramatic end-of-life situations. The Ethics Committee exists to help you navigate genuine dilemmas. Use it.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/summary.wav', image_url: IMG.M10, estimated_duration: '0:35', completion_required: true,
      },
      {
        card_id: 'achc_m10_l1_c1', type: 'content', title: 'The Ethical Framework',
        content: 'Healthcare ethics definition: making well-researched, considerate decisions that account for patient beliefs, wishes, and welfare alongside medical best practices.\n\nMajor ethical issue categories: confidentiality, disease transmission risk, consent, patient welfare (especially vulnerable populations), advance directives, relationships, discrimination, honesty, and professional boundaries.\n\nAgency Code of Ethics — 5 domains:\n1. Patient Rights and Responsibilities\n2. Relationships to Other Providers\n3. Fiscal Responsibilities\n4. Marketing and Public Relations\n5. Personnel\n\nEthics Committee: composed of Medical Director, involved staff, and Advisory Committee members. Convened for any ethical dilemma.',
        narration_script: 'Healthcare ethics: making well-researched decisions accounting for patient beliefs, wishes, and welfare alongside medical best practices. Major ethical categories: confidentiality, consent, advance directives, patient welfare, discrimination, honesty, and professional boundaries. The Agency Code of Ethics covers five domains: patient rights, relationships with other providers, fiscal responsibilities, marketing and public relations, and personnel. The Ethics Committee includes the Medical Director, involved staff, and Advisory Committee members — convened for any ethical dilemma.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/content1.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m10_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Ethical issues arise DAILY — not just in end-of-life or dramatic scenarios\n• Patient welfare is the PRIMARY motive — personal beliefs do not override\n• The Ethics Committee is a STRENGTH to use, not a weakness to avoid\n• Confidentiality is BOTH an ethical AND legal obligation\n• You do not need to resolve ethical dilemmas alone — consultation is expected\n• Document your ethical reasoning, not just your actions',
        narration_script: 'Takeaways. Ethical issues arise daily, not just in dramatic scenarios. Patient welfare is the primary motive — personal beliefs do not override. The Ethics Committee is a strength to use, not a weakness to avoid. Confidentiality is both an ethical and legal obligation. You do not need to resolve ethical dilemmas alone — consultation is expected and appropriate. And document your ethical reasoning, not just your actions.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/takeaways.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m10_l1_ch', type: 'challenge', title: 'Challenge: Confidentiality vs. Safety — Domestic Violence',
        content: 'Your patient confides: "My husband has been hitting me, but if you tell anyone, he\'ll kill me. He checks my phone and monitors my appointments. Please just treat my injuries and don\'t say anything." You observe injuries consistent with intimate partner violence. The patient is competent.\n\nWhat is the ETHICAL course of action?',
        narration_script: 'Challenge scenario. Your patient confides that her husband has been hitting her but asks you not to tell anyone, saying he will kill her if you do. She is competent and has made a clear request for confidentiality. You observe injuries consistent with intimate partner violence. What is the ethical course of action?',
        audio_path: '/training-audio/ACHC-ART-M10/l1/challenge.wav', image_url: IMG.M10, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Respect confidentiality completely — the patient is competent and made a clear request', isCorrect: false, rationale: 'While autonomy is paramount, professional obligations and state-specific mandatory reporting requirements may require action beyond confidentiality.' },
          { id: 'B', label: 'Report to law enforcement immediately without discussing with the patient', isCorrect: false, rationale: 'Mandatory reporting laws for adult domestic violence vary by state. Unilateral reporting without patient awareness may increase danger.' },
          { id: 'C', label: 'Document objectively, provide safety resources discreetly, assess immediate danger, consult supervisor about state mandatory reporting requirements, and safety plan WITH the patient', isCorrect: true, rationale: 'Correct — honors autonomy while fulfilling professional obligations through nuanced, patient-centered action.' },
          { id: 'D', label: 'Refuse to provide care until the patient agrees to report', isCorrect: false, rationale: 'Conditioning care on reporting is coercion. You do not withhold treatment to force compliance with your preferred action.' },
        ],
      },
      {
        card_id: 'achc_m10_l1_deb', type: 'content', title: 'Operational Debrief: Nuanced Ethical Action',
        content: 'This is a genuine ethical dilemma where multiple principles conflict (autonomy vs. safety, confidentiality vs. harm prevention).\n\nWhy the others require nuance:\n• A: State law may MANDATE reporting for vulnerable adults; confidentiality has limits when safety is at immediate risk\n• B: Reporting without patient knowledge in a high-danger situation may increase risk if abuser discovers it\n• D: Coercing a patient by withholding care = abandonment + ethical violation\n\nThis is EXACTLY the type of situation for Ethics Committee consultation. You are not expected to resolve this alone.\n\nDocumentation: describe injuries objectively. Do NOT document "domestic violence" if not confirmed — records may be accessible to abuser.',
        narration_script: 'Debrief. This is a genuine ethical dilemma. Option A may be insufficient if state law mandates reporting for vulnerable adults or if immediate danger exists. Option B may increase danger if the abuser discovers the report. Option D is coercion — withholding treatment to force compliance is abandonment. This is exactly the situation the Ethics Committee exists for. You are not expected to resolve it alone. Documentation: describe injuries objectively. Do NOT document "domestic violence" if not confirmed — the abuser may access the records.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/debrief.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m10_l2', topic_id: 'ACHC-ART-M10', title: 'Lesson 2: Advance Directives & End-of-Life Ethics', order: 2,
    cards: [
      {
        card_id: 'achc_m10_l2_s', type: 'summary', title: 'Advance Directives Are Legally Binding — Full Stop',
        content: 'A valid advance directive (DNR, living will, healthcare proxy) is a legally binding document. Family members who disagree cannot override it verbally. A healthcare proxy\'s purpose is to ensure the PATIENT\'S wishes are followed when the patient cannot speak — not to substitute the proxy\'s own preferences.',
        narration_script: 'A valid advance directive — DNR, living will, or healthcare proxy — is legally binding. Family members who disagree cannot override it verbally. A healthcare proxy\'s purpose is to ensure the patient\'s wishes are followed when the patient cannot speak — not to substitute the proxy\'s own preferences.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/summary.wav', image_url: IMG.M10, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m10_l2_c1', type: 'content', title: 'Advance Directives and Proxy Authority',
        content: 'Advance Directive types: DNR (Do Not Resuscitate), DNI (Do Not Intubate), Living Will, Healthcare Proxy/Power of Attorney.\n\nKey principles:\n• Check for advance directives at ADMISSION — not during a crisis\n• Agency MUST honor advance directives (42 CFR 489)\n• Healthcare proxy activates when patient CANNOT speak — while competent, patient\'s own directive governs\n• Proxy must act in accordance with patient\'s KNOWN wishes — not substitute own preferences\n• Family conflict about advance directives → Ethics Committee consultation\n\nOnly a COURT can determine legal incompetence. Age or diagnosis alone does NOT establish incompetence.',
        narration_script: 'Advance directive types: DNR, Do Not Intubate, Living Will, and Healthcare Proxy or Power of Attorney. Key principles: check for advance directives at admission, not during a crisis. The Agency must honor advance directives per 42 CFR 489. The healthcare proxy activates when the patient cannot speak — while the patient is competent, their own directive governs. The proxy must follow the patient\'s known wishes, not substitute their own preferences. Family conflict about directives triggers Ethics Committee consultation. Only a court can determine legal incompetence — age and diagnosis alone do not establish it.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/content1.wav', image_url: IMG.M10, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m10_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Advance directives are LEGALLY BINDING — family members cannot override verbally\n• Check for existence at admission — ask: "Do you have a living will or advance directive?"\n• Patient can refuse PART of care while accepting another part — this is their right\n• Document conflict about advance directives; seek Ethics Committee + Physician + Legal counsel if proxy insists on overriding\n• Overriding a valid advance directive = legally assault/battery\n• Age alone ≠ incompetence',
        narration_script: 'Takeaways. Advance directives are legally binding — family cannot override them verbally. Check for existence at admission. Patients can refuse part of care while accepting another part. Document conflict about advance directives and seek Ethics Committee consultation if the proxy insists on overriding the patient\'s documented wishes. Overriding a valid advance directive is legally assault or battery. And age alone does not establish incompetence.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/takeaways.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m10_l2_ch', type: 'challenge', title: 'Challenge: Healthcare Proxy Overriding Living Will',
        content: 'Your patient is 88 years old with advanced COPD. He has a valid living will stating "no intubation, no mechanical ventilation." His daughter (healthcare proxy) calls: "I\'ve changed my mind. If Dad can\'t breathe, I want him on a ventilator. I\'m his proxy — I have the authority."\n\nWhat is the CORRECT understanding?',
        narration_script: 'Challenge scenario. Your 88-year-old patient with advanced COPD has a valid living will stating no intubation or mechanical ventilation. His daughter, who is the healthcare proxy, calls and says she has changed her mind and wants her father on a ventilator if he can\'t breathe. She says she has the authority as proxy. What is the correct understanding?',
        audio_path: '/training-audio/ACHC-ART-M10/l2/challenge.wav', image_url: IMG.M10, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'The daughter is correct — as healthcare proxy she can override the living will at any time', isCorrect: false, rationale: 'The proxy\'s role is to represent the patient\'s wishes, not to substitute her own. While the patient is competent, his directive governs.' },
          { id: 'B', label: 'The proxy\'s authority activates when the patient CANNOT speak; while competent, his living will represents HIS wishes — the proxy must act in accordance with his known wishes, not substitute her preferences', isCorrect: true, rationale: 'Correct — proxy authority has limits. The proxy speaks FOR the patient, not OVER the patient.' },
          { id: 'C', label: 'Call the physician and let them decide — this is above your scope', isCorrect: false, rationale: 'While physician involvement is appropriate, you should understand the ethical framework to accurately explain the situation and advocate for the patient.' },
          { id: 'D', label: 'Honor whichever document is more recent', isCorrect: false, rationale: '"More recent" is not the standard. The patient\'s own expressed competent wishes take precedence over proxy preferences.' },
        ],
      },
      {
        card_id: 'achc_m10_l2_deb', type: 'content', title: 'Operational Debrief: Proxy Authority Limits',
        content: 'The proxy\'s role is to represent the patient, not themselves. A proxy acting contrary to the patient\'s documented wishes may be acting outside their authority.\n\nWhy the others fail:\n• A: Proxy authority has limits. The proxy speaks FOR the patient, not OVER the patient\n• C: While physician involvement is appropriate, nurses need to understand the ethical framework to advocate accurately\n• D: "More recent" is not a standard. The patient\'s competent wishes take precedence\n\nEscalation path: Ethics Committee + Attending Physician + Legal counsel if proxy insists.\n\nDocumentation: document the conflict, note the patient\'s directive, note the proxy\'s request, document that consultation was sought.',
        narration_script: 'Debrief. The proxy represents the patient, not themselves. Option A is wrong — proxy authority has limits, and the proxy speaks for the patient, not over the patient. Option C is incomplete — nurses need to understand the framework to advocate accurately. Option D is wrong — more recent is not a standard. If the proxy insists on overriding the living will, escalate to the Ethics Committee, attending physician, and legal counsel. Documentation: note the conflict, the patient\'s directive, the proxy\'s request, and that consultation was sought.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/debrief.wav', image_url: IMG.M10, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m10_l3', topic_id: 'ACHC-ART-M10', title: 'Lesson 3: Staff Ethics & Professional Boundaries', order: 3,
    cards: [
      {
        card_id: 'achc_m10_l3_s', type: 'summary', title: 'Conscientious Objection = Refusing Procedures, Not Patients',
        content: 'You CAN decline participation in specific procedures that genuinely conflict with your religious or moral beliefs — provided patient care is not disrupted and the Agency provides an alternative. You CANNOT refuse to care for an entire category of patients based on who they are. The first is conscientious objection; the second is discrimination.',
        narration_script: 'You can decline participation in specific procedures that genuinely conflict with your religious or moral beliefs — provided patient care is not disrupted. You cannot refuse to care for an entire category of patients based on who they are. The first is conscientious objection. The second is discrimination.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/summary.wav', image_url: IMG.M10, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m10_l3_c1', type: 'content', title: 'Professional Boundaries and Value Conflicts',
        content: 'Professional boundary rules:\n• No sexual relationships with patients — EVER, including after discharge\n• No financial entanglement with patients or families\n• The therapeutic relationship is the only relationship\n• Violation = termination, loss of license, criminal charges\n\nValue conflicts — when staff beliefs intersect with care:\n• May decline SPECIFIC PROCEDURES conflicting with beliefs (e.g., blood products)\n• Cannot refuse PATIENTS based on their identity (orientation, beliefs, lifestyle)\n• Agency must have alternative care arrangements when staff exercise conscientious objection\n• Performance evaluations must not penalize value-based objection to specific procedures when properly handled',
        narration_script: 'Professional boundary rules. No sexual relationships with patients — ever, including after discharge. No financial entanglement. The therapeutic relationship is the only relationship. Violations lead to termination, license loss, and criminal charges. Value conflicts: you may decline specific procedures that conflict with your beliefs, such as administering blood products. You cannot refuse patients based on their identity — sexual orientation, religious beliefs, or lifestyle. The Agency must have alternative care when staff exercise conscientious objection. Performance evaluations may not penalize properly handled conscientious objection to specific procedures.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/content1.wav', image_url: IMG.M10, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m10_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Conscientious objection: refuse PROCEDURES, not PATIENTS\n• You can decline specific care acts — you cannot select which patients to care for based on their identity\n• Professional boundaries apply to ALL staff — not just physicians\n• Sharing unsolicited religious perspectives with patients = proselytizing = professional boundary violation\n• Documenting personal objections to a patient\'s identity in their medical record = discriminatory documentation\n• Patient who senses bias or judgment withholds information → care quality suffers → adverse events',
        narration_script: 'Takeaways. Conscientious objection means refusing procedures, not patients. You can decline specific care acts — you cannot select patients based on their identity. Professional boundaries apply to all staff. Sharing unsolicited religious perspectives with patients is proselytizing and a boundary violation. Documenting personal objections to a patient\'s identity in their medical record is discriminatory documentation. Patients who sense bias withhold information, which degrades care quality and increases adverse events.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/takeaways.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m10_l3_ch', type: 'challenge', title: 'Challenge: Personal Values and Patient Identity',
        content: 'You are assigned to a patient in a same-sex marriage. Your religious beliefs consider homosexuality sinful. The patient requires routine wound care — nothing about the care itself conflicts with your beliefs, only the patient\'s identity and lifestyle.\n\nWhat is the ETHICALLY and PROFESSIONALLY correct response?',
        narration_script: 'Challenge scenario. You are assigned to a patient in a same-sex marriage. Your religious beliefs consider homosexuality sinful. The patient requires routine wound care — nothing about the care itself conflicts with your beliefs, only the patient\'s identity. What is the ethically and professionally correct response?',
        audio_path: '/training-audio/ACHC-ART-M10/l3/challenge.wav', image_url: IMG.M10, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Request reassignment — your religious beliefs give you the right to refuse', isCorrect: false, rationale: 'Conscientious objection applies to specific procedures, not to patients as people. Refusing a patient based on identity = discrimination.' },
          { id: 'B', label: 'Provide the care professionally without discrimination — personal beliefs about a patient\'s identity do not justify refusing routine clinical care', isCorrect: true, rationale: 'Correct — wound care doesn\'t conflict with any religious belief. Only the patient\'s identity does. Refusing based on identity is discrimination.' },
          { id: 'C', label: 'Provide care but share your religious perspective with the patient', isCorrect: false, rationale: 'Sharing unsolicited religious perspectives with patients is proselytizing, a professional boundary violation, and violates the right to respectful treatment.' },
          { id: 'D', label: 'Provide care but document that you object to the patient\'s lifestyle', isCorrect: false, rationale: 'Documenting personal objections to a patient\'s identity in their medical record is discriminatory documentation that could be actionable.' },
        ],
      },
      {
        card_id: 'achc_m10_l3_deb', type: 'content', title: 'Operational Debrief: Identity vs. Procedure Objection',
        content: 'Conscientious objection protects you from performing specific acts that violate beliefs. It does NOT entitle you to refuse entire categories of people.\n\nWhy the others fail:\n• A: Wound care doesn\'t conflict with any religious belief — only the patient\'s identity does. That\'s discrimination, not conscientious objection\n• C: Proselytizing violates professional boundaries and the patient\'s right to respectful treatment\n• D: Discriminatory documentation is inappropriate and potentially actionable\n\nLegal reality: Refusing care based on sexual orientation = potential discrimination claim, termination, and licensure action.\n\nEthical principle: a patient who senses judgment from a clinician withholds information → inferior care → adverse events.',
        narration_script: 'Debrief. Conscientious objection protects you from specific acts that violate beliefs — it does not entitle you to refuse entire categories of people. Option A is wrong because wound care doesn\'t conflict with religious beliefs — only the patient\'s identity does, which makes it discrimination. Option C violates professional boundaries. Option D is discriminatory documentation. Legal reality: refusing care based on sexual orientation is a potential discrimination claim. Ethical principle: patients who sense judgment withhold information, which leads to inferior care and adverse events.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/debrief.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m10_l4', topic_id: 'ACHC-ART-M10', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m10_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Ethical ≠ Legal. You must meet BOTH standards, and sometimes they conflict\n2. Advance directives are legally binding — family emotion does not override documented patient wishes\n3. The Ethics Committee exists for YOU — use it when you face genuine dilemmas\n4. Conscientious objection = refusing specific PROCEDURES, not refusing PATIENTS\n5. Patient autonomy means you respect their decisions even when you disagree\n6. Document ethical reasoning, not just actions — your defensibility depends on showing you thought it through\n\nOperational bridge: Your preceptor will evaluate your ability to navigate advance directives, maintain professional boundaries, manage value conflicts without patient impact, and know when to escalate.',
        narration_script: 'Six takeaways. One: ethical and legal are not the same — you must meet both standards. Two: advance directives are legally binding — family emotion does not override them. Three: the Ethics Committee exists for you — use it. Four: conscientious objection means refusing procedures, not patients. Five: patient autonomy means respecting decisions even when you disagree. Six: document your ethical reasoning, not just your actions. Your preceptor will evaluate your advance directive handling, professional boundaries, value conflict management, and escalation decisions.',
        audio_path: '/training-audio/ACHC-ART-M10/l4/synthesis.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m10_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. Ethics are not just for dramatic situations — they govern every clinical interaction\n2. Your personal beliefs are VALID but they NEVER override patient rights or professional duty\n3. The Ethics Committee is a STRENGTH to use, not a weakness to avoid\n4. Advance directives represent the patient speaking — honor their voice even when others are louder\n5. Documentation of ethical reasoning is your defensibility — "I did the right thing" is not evidence\n\nConfidence check: How confident are you in navigating an ethical dilemma in the field without immediate supervisor access?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: ethics govern every clinical interaction. Two: personal beliefs are valid but never override patient rights or professional duty. Three: the Ethics Committee is a strength. Four: advance directives represent the patient speaking — honor their voice. Five: documentation of ethical reasoning is your defensibility. How confident are you in navigating an ethical dilemma without immediate supervisor access?',
        audio_path: '/training-audio/ACHC-ART-M10/l4/finaldebrief.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m10_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Understanding of advance directive locations and implications\n• Response to value-conflict scenarios\n• Professional boundary maintenance\n• Knowledge of Ethics Committee access and activation\n• Ability to separate personal beliefs from professional obligation\n\nResources:\n• Agency Code of Ethics (full document)\n• Ethics Committee convening process\n• Advance Directive information and forms\n• Professional Boundaries quick reference\n• Ethical Decision-Making Framework tool',
        narration_script: 'Operational next steps. Your preceptor will evaluate: understanding of advance directive locations and implications, your response to value-conflict scenarios, professional boundary maintenance, knowledge of Ethics Committee access, and your ability to separate personal beliefs from professional obligation. Resources: Agency Code of Ethics, Ethics Committee convening process, advance directive forms, professional boundaries quick reference, and ethical decision-making framework.',
        audio_path: '/training-audio/ACHC-ART-M10/l4/nextsteps.wav', image_url: IMG.M10, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m10_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The module content helped me understand ethical decision-making frameworks. (1–5)\n2. The advance directive scenario was realistic and instructive. (1–5)\n3. The values-conflict content was handled respectfully and clearly. (1–5)\n4. I feel more prepared to navigate ethical dilemmas in the field. (1–5)\n5. What ethical situation would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the clarity of ethical decision-making frameworks, the realism of the advance directive scenario, the handling of values-conflict content, and your preparedness for ethical dilemmas. Share what situation you want more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M10/l4/survey.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M11 TB & Bloodborne Pathogens ══════════════════════ */

  {
    lesson_id: 'achc_m11_l0', topic_id: 'ACHC-ART-M11', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m11_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive for a routine nursing visit. The patient has a persistent productive cough (3+ weeks), night sweats, unintentional weight loss, and fatigue. Their doctor said it\'s "just a cold that won\'t go away." The patient is not on respiratory isolation. Your last PPD was negative 6 months ago. The patient coughs in your direction while you take vitals.\n\nWhat is your IMMEDIATE concern and action?',
        narration_script: 'Pre-assessment. You arrive for a routine visit. The patient has had a productive cough for over three weeks, night sweats, unintentional weight loss, and fatigue. The doctor said it\'s just a cold. No respiratory isolation. The patient coughs in your direction during vitals. What is your immediate concern and action?',
        audio_path: '/training-audio/ACHC-ART-M11/l0/hook.wav', image_url: IMG.M11, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Continue the visit — the doctor said it\'s just a cold', isCorrect: false, rationale: 'This symptom cluster is consistent with active pulmonary TB. Never defer to "just a cold" when TB symptoms are present.' },
          { id: 'B', label: 'This is consistent with active pulmonary TB. Don N95 immediately, complete only essential assessment, report to supervisor AND physician immediately, document potential exposure', isCorrect: true, rationale: 'Correct — act as if TB is confirmed until proven otherwise. N95 is required. Report immediately.' },
          { id: 'C', label: 'Apply a surgical mask and continue — it provides enough protection', isCorrect: false, rationale: 'A surgical mask does NOT protect against airborne TB. N95 respirator (fit-tested) is the minimum requirement.' },
          { id: 'D', label: 'Leave immediately without providing any care', isCorrect: false, rationale: 'Complete only essential assessment with appropriate protection. Abrupt abandonment without notification is not appropriate.' },
        ],
      },
      {
        card_id: 'achc_m11_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define blood borne pathogens and identify primary transmission routes.\n2. Apply Standard Precautions and engineering controls to prevent exposure.\n3. Execute the immediate post-exposure response protocol for needlesticks and splash exposures.\n4. Recognize the signs and symptoms of active pulmonary tuberculosis.\n5. Describe the Agency\'s TB risk classification system and PPD testing requirements.\n6. Demonstrate proper use and fit-check of N95 respiratory protection.',
        narration_script: 'Learning objectives. One: define bloodborne pathogens and primary transmission routes. Two: apply Standard Precautions and engineering controls. Three: execute the immediate post-exposure protocol. Four: recognize signs and symptoms of active pulmonary TB. Five: describe the Agency\'s TB risk classification and PPD testing requirements. Six: demonstrate proper use and fit-check of N95 respiratory protection.',
        audio_path: '/training-audio/ACHC-ART-M11/l0/objectives.wav', image_url: IMG.M11, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m11_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Bloodborne Pathogens — Infectious microorganisms in human blood (HBV, HCV, HIV). Transmitted through direct contact, needlesticks, mucous membrane exposure.\n\nExposure Control Plan — OSHA-required written program. Must be available, known, and followed by ALL employees.\n\nPost-Exposure Prophylaxis (PEP) — Medical treatment after potential exposure. Must begin within hours (HBV) — time-critical.\n\nN95 Respirator — NIOSH-approved; minimum protection for TB. Must be fit-tested before first use. Surgical masks are NOT adequate.\n\nMantoux PPD (2-Step) — Tuberculin skin test. Required at hire; annual questionnaire thereafter.\n\nTB Risk Classification — Agency\'s risk level (Very Low/Low/Intermediate/High). Annual reassessment required.\n\nEngineering Controls — Primary exposure prevention (needleless devices, shielded needles, sharps containers). OSHA hierarchy: Engineering > Work Practice > PPE.',
        narration_script: 'Seven key terms. Bloodborne Pathogens: HBV, HCV, HIV — transmitted through direct contact, needlesticks, and mucous membrane exposure. Exposure Control Plan: OSHA-required program that must be available, known, and followed by all employees. PEP — Post-Exposure Prophylaxis: must begin within hours of exposure — time-critical. N95 Respirator: minimum TB protection, must be fit-tested — surgical masks are not adequate. Mantoux PPD: required at hire, annual questionnaire thereafter. TB Risk Classification: Agency-assessed annually. Engineering Controls: first line of defense per OSHA hierarchy — engineering over work practice over PPE.',
        audio_path: '/training-audio/ACHC-ART-M11/l0/concepts.wav', image_url: IMG.M11, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m11_l1', topic_id: 'ACHC-ART-M11', title: 'Lesson 1: Bloodborne Pathogens — Transmission & Prevention', order: 1,
    cards: [
      {
        card_id: 'achc_m11_l1_s', type: 'summary', title: 'Engineering Controls Are the First Defense',
        content: 'The OSHA hierarchy for bloodborne pathogen control: Engineering Controls first (needleless systems, shielded needles, sharps containers), then Work Practice Controls, then PPE. Relying only on PPE while ignoring engineering controls is insufficient and violates OSHA requirements.',
        narration_script: 'The OSHA hierarchy for bloodborne pathogen control: Engineering Controls first — needleless systems, shielded needles, sharps containers. Then Work Practice Controls. Then PPE. Relying only on PPE while ignoring engineering controls is insufficient and violates OSHA requirements.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/summary.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m11_l1_c1', type: 'content', title: 'BBP Transmission, Risk, and Prevention',
        content: 'Primary bloodborne pathogens: HBV, HCV, HIV.\n\nNeedlestick infection risk (without vaccination):\n• HBV: 30% per needlestick (vaccine available — 3-dose series, required for healthcare workers)\n• HCV: 1.8% per needlestick (no vaccine — but effective treatment exists)\n• HIV: 0.3% per needlestick (PEP within 72 hours is highly effective)\n\nNOT transmitted by: saliva alone, tears, sweat, urine on intact skin.\nTransmission requires: direct contact with infectious material + a portal of entry.\n\nDecontamination: 1:10 bleach solution, minimum 10 minutes contact time.\n\nHBV vaccination must be offered within 10 working days of initial assignment.',
        narration_script: 'Primary bloodborne pathogens: HBV, HCV, HIV. Needlestick risk without protection: HBV carries a 30% risk — vaccination is required, 3-dose series. HCV carries 1.8% risk — no vaccine but effective treatment. HIV carries 0.3% risk — PEP within 72 hours is highly effective. These pathogens are not transmitted by saliva alone, tears, sweat, or urine on intact skin. Transmission requires infectious material plus a portal of entry. Decontamination: 1-to-10 bleach solution with 10 minutes of contact time. HBV vaccination must be offered within 10 working days of initial assignment.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/content1.wav', image_url: IMG.M11, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m11_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Engineering controls are PRIMARY — not PPE, not "being careful"\n• HBV vaccination: accept it. It\'s required to be offered; employee may decline but employer must offer later if they change their mind\n• All body fluids treated as infectious — don\'t wait for a diagnosis\n• Remove jewelry before gloving; cover cuts/scrapes; change gloves between patients\n• Biohazard labels required on ALL containers of contaminated materials\n• NEVER recap a needle — this is the #1 preventable cause of needlestick injuries',
        narration_script: 'Takeaways. Engineering controls are primary — not PPE or caution. Accept the HBV vaccination offer — it is required to be made, and you can change your mind later. All body fluids are treated as infectious — don\'t wait for a diagnosis. Remove jewelry before gloving, cover cuts and scrapes, and change gloves between patients. Biohazard labels are required on all contaminated material containers. Never recap a needle — this is the number one preventable cause of needlestick injuries.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/takeaways.wav', image_url: IMG.M11, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m11_l1_ch', type: 'challenge', title: 'Challenge: Wound Irrigation Without Eye Protection',
        content: 'You are providing wound care to a patient with a heavily draining abdominal wound. Drainage is blood-tinged and you need to irrigate, which produces splash. You have gloves and a gown but no face shield. The patient\'s HIV status is unknown.\n\nWhat is the CORRECT action?',
        narration_script: 'Challenge scenario. You are providing wound care for a heavily draining abdominal wound with blood-tinged drainage. You need to irrigate, which produces splash. You have gloves and a gown but no face shield. The patient\'s HIV status is unknown. What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M11/l1/challenge.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Proceed with gloves and gown only — splash risk is minimal if you\'re careful', isCorrect: false, rationale: '"Minimal splash risk" is subjective. Standard Precautions require protection based on anticipated exposure, not optimistic estimates.' },
          { id: 'B', label: 'Do not perform irrigation without face/eye protection — irrigating wounds with blood-tinged drainage is a splash risk requiring full Standard Precautions', isCorrect: true, rationale: 'Correct — must have appropriate PPE before beginning a procedure with splash risk. Obtain equipment or defer the irrigation.' },
          { id: 'C', label: 'Proceed but turn your head away during irrigation', isCorrect: false, rationale: '"Turning your head" is not an engineering or administrative control. Splash travels unpredictably.' },
          { id: 'D', label: 'Ask the patient their HIV status to determine if you need face protection', isCorrect: false, rationale: 'Standard Precautions means all body fluids are treated as infectious regardless of known status. You never base PPE on patient diagnosis.' },
        ],
      },
      {
        card_id: 'achc_m11_l1_deb', type: 'content', title: 'Operational Debrief: Must Have PPE Before Proceeding',
        content: 'You must have appropriate PPE BEFORE beginning a procedure with splash risk. Missing equipment means reschedule or obtain the equipment first.\n\nWhy the others fail:\n• A: "Minimal splash risk" is subjective. The ANTICIPATED exposure determines PPE, not your optimistic estimate\n• C: "Turning your head" is hope, not a control. Splash is unpredictable\n• D: Standard Precautions means you NEVER base PPE decisions on patient diagnosis or known status\n\nPractical resolution: Eye protection should be in your nursing bag. If it\'s not, that\'s a supply issue to report — and a reason to defer the irrigation.\n\nOSHA note: Employer must provide PPE. If your bag lacks required items, report it AND defer the procedure.',
        narration_script: 'Debrief. You must have appropriate PPE before beginning any procedure with splash risk. Option A is wrong because anticipated exposure determines PPE, not optimistic estimates. Option C is wrong because turning your head is not a control — splash is unpredictable. Option D violates Standard Precautions — you never base PPE on patient diagnosis. Practical resolution: eye protection should be in your nursing bag. If it\'s not, report the supply issue and defer the irrigation. OSHA requires employers to provide PPE — missing equipment is a reportable gap.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/debrief.wav', image_url: IMG.M11, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m11_l2', topic_id: 'ACHC-ART-M11', title: 'Lesson 2: Post-Exposure Response Protocol', order: 2,
    cards: [
      {
        card_id: 'achc_m11_l2_s', type: 'summary', title: 'WASH → REPORT → EVALUATE. In That Order. Immediately.',
        content: 'The post-exposure protocol is a TIMED medical response. Every step has a time requirement. The sequence never changes: wash the wound immediately, report to supervisor immediately, seek medical evaluation. Skipping or reordering steps reduces treatment effectiveness and creates documentation gaps.',
        narration_script: 'The post-exposure protocol is a timed medical response. Every step has a time requirement and the sequence never changes. Wash the wound immediately, report to supervisor immediately, then seek medical evaluation. Skipping or reordering steps reduces treatment effectiveness and creates documentation gaps.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/summary.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m11_l2_c1', type: 'content', title: 'The 5-Step Post-Exposure Protocol',
        content: 'Step 1: Immediate first aid\n• Needlestick/cut: remove glove, wash site with soap and water 30+ seconds. Do NOT squeeze or suck the wound.\n• Eye/mucous membrane: flush with water for 20 minutes\n\nStep 2: Report to supervisor IMMEDIATELY — not end of shift\n\nStep 3: Seek medical evaluation within 2 hours — PEP decision is made here\n\nStep 4: Provide source patient information to facilitate bloodborne pathogen testing (with consent)\n\nStep 5: Complete exposure incident report before end of shift\n\nNote: If employee initially declines HIV testing, sample can be preserved 90 days in case they change their mind.',
        narration_script: 'Five steps. One: immediate first aid — for a needlestick, remove glove, wash with soap and water for 30 or more seconds. Do not squeeze or suck the wound. For eye or mucous membrane exposure: flush with water for 20 minutes. Two: report to supervisor immediately — not at end of shift. Three: seek medical evaluation within two hours — this is where the PEP decision is made. Four: provide source patient information to facilitate testing with consent. Five: complete the exposure incident report before end of shift. Note: if the employee initially declines HIV testing, the sample can be preserved for 90 days.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/content1.wav', image_url: IMG.M11, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m11_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• WASH FIRST — within seconds, not minutes\n• REPORT IMMEDIATELY — not end of shift, not tomorrow\n• Medical evaluation within 2 hours — PEP effectiveness decreases with every hour\n• Physician opinion (written) within 15 days: limited to notification of results and conditions requiring treatment\n• All findings beyond notification REMAIN CONFIDENTIAL — not disclosed to employer\n• Source patient consent for testing is requested but not required for the report',
        narration_script: 'Takeaways. Wash first — within seconds, not minutes. Report immediately — not end of shift. Medical evaluation within two hours because PEP effectiveness decreases with every hour. The written physician opinion is due within 15 days — limited to notification of results and conditions requiring treatment. All other findings remain confidential and are not disclosed to the employer. Source patient consent for testing is requested, but the report itself does not require it.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/takeaways.wav', image_url: IMG.M11, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m11_l2_ch', type: 'challenge', title: 'Challenge: Post-Exposure Sequence with Known HCV',
        content: 'While drawing blood, the patient moves unexpectedly and the needle punctures through your glove into your thumb. You see blood. The patient tells you they are Hepatitis C positive.\n\nArrange the CORRECT post-exposure actions in the proper sequence:',
        narration_script: 'Challenge scenario. While drawing blood, the needle punctures through your glove into your thumb. The patient tells you they are Hepatitis C positive. Arrange the correct post-exposure actions in proper sequence.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/challenge.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Report → Test → Wash → Document → Follow-up', isCorrect: false, rationale: 'Reporting before washing wastes critical decontamination time. Wash must happen FIRST.' },
          { id: 'B', label: 'Wash immediately → Report to supervisor → Document incident → Seek medical evaluation → Follow-up per physician', isCorrect: true, rationale: 'Correct — immediate decontamination first, then reporting, documentation, and medical evaluation in sequence.' },
          { id: 'C', label: 'Finish the blood draw → Bandage your thumb → Report at end of shift', isCorrect: false, rationale: 'Never complete the procedure before addressing your exposure. Delay eliminates the PEP window.' },
          { id: 'D', label: 'Ask the patient more questions about their HCV status → Decide if reporting is necessary', isCorrect: false, rationale: 'Known HCV status makes immediate action MORE urgent. You never "decide" whether to report a needlestick.' },
        ],
      },
      {
        card_id: 'achc_m11_l2_deb', type: 'content', title: 'Operational Debrief: Sequence Is Non-Negotiable',
        content: 'The post-exposure sequence is: WASH first (within seconds), REPORT, DOCUMENT, MEDICAL EVALUATION, FOLLOW-UP.\n\nWhy the others fail:\n• A: Reporting before washing wastes decontamination time. Washing must be within seconds of the exposure\n• C: Never finish the procedure before addressing your exposure. The blood draw can be safely stopped\n• D: Known HCV status makes action MORE urgent — not something to evaluate. You ALWAYS report a needlestick\n\nHCV-specific: Currently no PEP for HCV. But immediate baseline testing, monitoring schedule, and documentation are still mandatory.\n\nEmployee rights: test results and follow-up remain confidential. Employer receives only that you were evaluated.',
        narration_script: 'Debrief. The sequence is non-negotiable: wash first within seconds, then report, document, seek medical evaluation, and follow up. Option A fails because washing must happen before reporting. Option C is dangerous — never finish the procedure before addressing your exposure, and never delay reporting to end of shift. Option D is wrong — known HCV status makes action more urgent, not something to evaluate. HCV-specific note: there is no PEP for HCV, but immediate baseline testing and monitoring are mandatory. Test results remain confidential — employers receive only that you were evaluated.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/debrief.wav', image_url: IMG.M11, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m11_l3', topic_id: 'ACHC-ART-M11', title: 'Lesson 3: Tuberculosis — Recognition, Protection & Policy', order: 3,
    cards: [
      {
        card_id: 'achc_m11_l3_s', type: 'summary', title: 'Suspected TB = Act as Confirmed Until Proven Otherwise',
        content: 'TB is AIRBORNE — transmitted by droplet nuclei that remain suspended in air for hours. A surgical mask does NOT filter airborne particles. Only an N95 respirator (properly fit-tested) provides protection. When symptoms suggest active TB, act as if confirmed — do not wait for lab results.',
        narration_script: 'TB is airborne — transmitted by droplet nuclei that remain suspended in air for hours. A surgical mask does not filter airborne particles. Only an N95 respirator, properly fit-tested, provides protection. When symptoms suggest active TB, act as if it is confirmed — do not wait for lab results.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/summary.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m11_l3_c1', type: 'content', title: 'TB Recognition, N95 Protocol, and Agency Policy',
        content: 'Active TB symptom cluster (ALL of these together):\n• Productive cough lasting more than 3 weeks\n• Night sweats\n• Unexplained weight loss\n• Hemoptysis (blood-tinged sputum)\n• Low-grade fever, fatigue\n\nHigh-risk populations: recent immigration from endemic areas, HIV, diabetes, shelter exposure.\n\nN95 protocol:\n• Fit-test required before first use and annually\n• Seal check before EVERY use\n• Reusable if structural integrity maintained\n• NOT shareable between staff\n\nAgency TB policy: does not admit known TB patients. If discovered during care: continue with N95 protection until transfer or non-infectious status is established.',
        narration_script: 'Active TB symptom cluster: productive cough lasting more than three weeks, night sweats, unexplained weight loss, hemoptysis — blood-tinged sputum — and low-grade fever. High-risk populations include recent immigration from endemic areas, HIV, diabetes, and shelter exposure. N95 protocol: fit-test required before first use and annually, seal check before every use, reusable if structurally intact, not shareable between staff. Agency TB policy: does not admit known TB patients. If TB is discovered during care, continue with N95 protection until transfer or non-infectious status.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/content1.wav', image_url: IMG.M11, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m11_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• TB is AIRBORNE — surgical masks are NEVER adequate for suspected/confirmed TB\n• N95 fit-test is not bureaucracy — an unfitted N95 is as effective as no N95\n• Suspected TB = notify supervisor AND physician AND health department immediately (mandatory report)\n• PPD testing: annual questionnaire if negative; positive = chest X-ray required (not repeat PPD)\n• Staff who cannot be fit-tested or wear N95 are NOT assigned to suspected/confirmed TB patients\n• Cough-producing procedures: do in well-ventilated area away from household members; consider outdoors',
        narration_script: 'Takeaways. TB is airborne — surgical masks are never adequate. N95 fit-testing is not bureaucracy — an unfitted N95 is no protection. Suspected TB requires notifying supervisor, physician, and health department immediately — it is a mandatory report. PPD testing: annual questionnaire if negative; positive PPD requires a chest X-ray, not a repeat PPD. Staff who cannot be fit-tested are not assigned to suspected TB patients. For cough-producing procedures: move to a well-ventilated area away from household members, and consider doing them outdoors.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/takeaways.wav', image_url: IMG.M11, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m11_l3_ch', type: 'challenge', title: 'Challenge: Suspected TB, No Isolation Orders',
        content: 'Your patient has had a productive cough for 4 weeks, reports night sweats, and has visibly lost weight. She is a 68-year-old immigrant from the Philippines (high-risk population). No TB orders are in her chart. She coughs blood-tinged sputum in your direction.\n\nWhat actions are REQUIRED?',
        narration_script: 'Challenge scenario. Your patient has had a productive cough for four weeks, reports night sweats, and has visibly lost weight. She is a 68-year-old immigrant from the Philippines — a high-risk population. No TB orders. She coughs blood-tinged sputum in your direction. What actions are required?',
        audio_path: '/training-audio/ACHC-ART-M11/l3/challenge.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Don your N95 respirator immediately', isCorrect: true, rationale: 'Correct — you are in an enclosed space with a patient showing classic TB symptoms. N95 is the minimum required respiratory protection.' },
          { id: 'B', label: 'Report findings to the patient\'s physician immediately for TB workup', isCorrect: true, rationale: 'Correct — physician must order TB workup. You cannot diagnose, but you must report the clinical findings.' },
          { id: 'C', label: 'Notify your supervisor (DON) of suspected TB', isCorrect: true, rationale: 'Correct — supervisor notification is required for infection control program management.' },
          { id: 'D', label: 'Continue routine care with just a surgical mask since TB isn\'t confirmed', isCorrect: false, rationale: 'Surgical masks do NOT protect against airborne TB. Act as if TB is confirmed — do not wait for lab confirmation to protect yourself.' },
        ],
      },
      {
        card_id: 'achc_m11_l3_deb', type: 'content', title: 'Operational Debrief: Suspected TB Response',
        content: 'A, B, and C are ALL required. The key clinical insight: this symptom cluster in a high-risk population is suspected TB until proven otherwise.\n\nWhy D is dangerous:\nSurgical masks filter large droplets only. TB is transmitted by droplet nuclei (tiny particles) that pass through surgical masks and remain airborne for hours. Every minute in that space without an N95 is continued exposure.\n\nAdditional step not listed: health department notification is also required for suspected TB (mandatory communicable disease reporting).\n\nAfter leaving the home: document potential exposure, notify infection control for PPD monitoring schedule.',
        narration_script: 'Debrief. Options A, B, and C are all required. The clinical insight: this symptom cluster in a high-risk population is suspected TB until proven otherwise. Option D is dangerous because surgical masks filter large droplets only — TB droplet nuclei pass through surgical masks and remain airborne for hours. Every minute without an N95 is continued exposure. Additional step not listed in the options: health department notification is also required for suspected TB — mandatory communicable disease reporting. After leaving the home: document the exposure and notify infection control for PPD monitoring.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/debrief.wav', image_url: IMG.M11, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m11_l4', topic_id: 'ACHC-ART-M11', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m11_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Standard Precautions: treat ALL body fluids as infectious, ALWAYS, regardless of diagnosis\n2. Engineering controls > Work practice controls > PPE — the OSHA hierarchy\n3. Post-exposure: WASH immediately → Report immediately → Medical evaluation (within 2 hrs) → Document\n4. TB is AIRBORNE — surgical masks are inadequate. N95 fit-tested respirator is the minimum\n5. Suspected TB = act as if confirmed until proven otherwise. Don\'t wait for lab results\n6. HBV vaccination must be offered within 10 days of hire — your right as an employee\n\nOperational bridge: Your preceptor will evaluate N95 fit-check, post-exposure protocol verbalization, TB symptom recognition, and Exposure Control Plan knowledge.',
        narration_script: 'Six takeaways. One: Standard Precautions — all body fluids, all patients, always. Two: OSHA hierarchy — engineering controls first, then work practice, then PPE. Three: post-exposure sequence — wash immediately, report immediately, medical evaluation within two hours, document. Four: TB is airborne — surgical masks are inadequate, N95 fit-tested is the minimum. Five: suspected TB means act as confirmed — don\'t wait for lab results. Six: HBV vaccination must be offered within 10 days of hire. Your preceptor will evaluate N95 fit-check, post-exposure protocol, TB symptom recognition, and Exposure Control Plan knowledge.',
        audio_path: '/training-audio/ACHC-ART-M11/l4/synthesis.wav', image_url: IMG.M11, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m11_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. "The patient doesn\'t LOOK sick" has never prevented an occupational infection\n2. Post-exposure response is TIME-CRITICAL — hours matter for prophylaxis effectiveness\n3. Standard Precautions means you NEVER decide "this patient is probably fine"\n4. N95 fit-testing is not bureaucracy — an unfitted N95 provides no real protection\n5. Your right to a safe workplace includes the right to proper PPE and post-exposure care\n\nConfidence check: How confident are you in executing the post-exposure protocol and recognizing TB in the field?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: "the patient doesn\'t look sick" has never prevented an occupational infection. Two: post-exposure response is time-critical. Three: Standard Precautions means you never decide a patient is probably fine. Four: N95 fit-testing is not bureaucracy — an unfitted N95 provides no real protection. Five: your right to a safe workplace includes proper PPE and post-exposure care. How confident are you in executing the post-exposure protocol and recognizing TB in the field?',
        audio_path: '/training-audio/ACHC-ART-M11/l4/finaldebrief.wav', image_url: IMG.M11, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m11_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• N95 donning and user seal-check demonstration\n• Verbalization of the post-exposure protocol (without looking it up)\n• Recognition of TB symptom clusters during patient assessment\n• Proper sharps handling and disposal practices\n• Knowledge of where the Exposure Control Plan is located\n\nResources:\n• Agency Exposure Control Plan\n• Post-Exposure Response Protocol card (wallet-sized)\n• N95 Fit-Test records and schedule\n• TB Symptom Recognition quick reference\n• OSHA Bloodborne Pathogens Standard (29 CFR 1910.1030)',
        narration_script: 'Operational next steps. Your preceptor will evaluate: N95 donning and seal-check demonstration, post-exposure protocol verbalization without looking it up, TB symptom recognition, proper sharps handling and disposal, and knowledge of where the Exposure Control Plan is located. Resources: Agency Exposure Control Plan, wallet-sized post-exposure protocol card, N95 fit-test records, TB symptom recognition quick reference, and OSHA Bloodborne Pathogens Standard 29 CFR 1910.1030.',
        audio_path: '/training-audio/ACHC-ART-M11/l4/nextsteps.wav', image_url: IMG.M11, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m11_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The module content was relevant to my occupational safety concerns. (1–5)\n2. The post-exposure protocol was clearly explained and memorable. (1–5)\n3. The TB recognition content was actionable. (1–5)\n4. I feel more prepared to protect myself and respond to exposures. (1–5)\n5. What BBP/TB topic would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to your occupational safety concerns, the clarity and memorability of the post-exposure protocol, the actionability of the TB recognition content, and your preparedness to respond to exposures. Share what BBP or TB topic you want more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M11/l4/survey.wav', image_url: IMG.M11, estimated_duration: '0:50', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M12 Medical Device Act ══════════════════════ */

  {
    lesson_id: 'achc_m12_l0', topic_id: 'ACHC-ART-M12', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m12_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'A patient\'s oxygen concentrator has been alarming for 2 days. The caregiver silenced it each time. During your visit: SpO2 is 82%, the patient is mildly confused and lethargic, and you confirm the device is delivering 1L/min despite a 2L setting. Symptoms began 2 days ago.\n\nThis situation requires:',
        narration_script: 'Pre-assessment. An oxygen concentrator has been alarming for two days with the caregiver silencing it. During your visit the patient\'s SpO2 is 82%, they are confused and lethargic, and the device is delivering only 1L/min despite a 2L setting. Symptoms began two days ago. What does this situation require?',
        audio_path: '/training-audio/ACHC-ART-M12/l0/hook.wav', image_url: IMG.M12, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Document in the visit note and call the DME company to service the concentrator', isCorrect: false, rationale: 'The patient needs immediate clinical intervention. A service call alone does not address the patient crisis or regulatory reporting obligations.' },
          { id: 'B', label: 'Immediate patient intervention (O2, physician notification), document device malfunction, incident report, supervisor notification, AND evaluate for FDA reporting requirement', isCorrect: true, rationale: 'Correct — patient first, then the full reporting cascade: incident report, supervisor, physician, and FDA evaluation (device malfunction + serious injury = likely MDR reportable).' },
          { id: 'C', label: 'Tell the caregiver not to silence alarms and schedule a follow-up visit', isCorrect: false, rationale: 'The patient is in clinical crisis NOW. Education about alarms is appropriate later — not as the primary response to an emergency.' },
          { id: 'D', label: 'Replace the concentrator yourself and adjust the flow rate', isCorrect: false, rationale: 'Replacing a device that malfunctioned and caused injury without preserving it destroys evidentiary value for the MDR investigation.' },
        ],
      },
      {
        card_id: 'achc_m12_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define "MDR reportable event" and identify the three categories of reportable adverse events.\n2. Describe the reporting obligations of device user facilities.\n3. Apply the correct reporting timelines for deaths and serious injuries.\n4. Complete the elements required for an FDA MedWatch report (Form 3500A).\n5. Distinguish between mandatory reporting (user facilities) and voluntary reporting (healthcare professionals).\n6. Explain the Safety Data Sheet (SDS) system for hazardous chemicals in the workplace.',
        narration_script: 'Learning objectives. One: define MDR reportable event and identify the three categories of reportable adverse events. Two: describe user facility reporting obligations. Three: apply the correct reporting timelines. Four: complete the elements for FDA Form 3500A. Five: distinguish mandatory from voluntary reporting. Six: explain the SDS system for hazardous chemicals.',
        audio_path: '/training-audio/ACHC-ART-M12/l0/objectives.wav', image_url: IMG.M12, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m12_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'MDR Reportable Event — Adverse event where a device may have caused/contributed to death or serious injury. Low threshold: "may have" is sufficient.\n\nDevice User Facility — Hospital, nursing home, home health agency. Has mandatory reporting obligations. (NOT physician offices.)\n\nSerious Injury — Life-threatening, permanent impairment, OR requiring intervention to prevent permanent damage.\n\nMalfunction — Device fails to meet specifications or perform as intended. Reportable if likely to cause death/serious injury if it RECURS.\n\nFDA Form 3500A — Mandatory report for device user facilities. Required within 10 working days of awareness.\n\nMedWatch (Voluntary) — Individual healthcare professionals encouraged to report. Supplements mandatory reporting.\n\nSDS — Safety Data Sheet. Section 8 = PPE and exposure controls.',
        narration_script: 'Seven key terms. MDR Reportable Event: adverse event where a device may have caused or contributed to death or serious injury — the "may have" threshold is low. Device User Facility: hospital, nursing home, home health agency — mandatory reporting obligations. Not physician offices. Serious Injury: life-threatening, permanent impairment, or requiring intervention to prevent permanent damage. Malfunction: failure to perform as intended — reportable if likely to cause death or serious injury if it recurs. FDA Form 3500A: mandatory report within 10 working days of awareness. MedWatch Voluntary: healthcare professionals encouraged to report supplements mandatory reporting. SDS Section 8: PPE and exposure controls.',
        audio_path: '/training-audio/ACHC-ART-M12/l0/concepts.wav', image_url: IMG.M12, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m12_l1', topic_id: 'ACHC-ART-M12', title: 'Lesson 1: Medical Device Reporting Framework', order: 1,
    cards: [
      {
        card_id: 'achc_m12_l1_s', type: 'summary', title: '"May Have Caused" Is a Low Threshold',
        content: 'The MDR reporting standard is "reasonably suggests the device may have caused or contributed to" the event. You don\'t need certainty. You don\'t need confirmation. When in doubt — report. The regulation also ASSUMES malfunctions will recur, so even one-time events are reportable.',
        narration_script: 'The MDR reporting standard is "reasonably suggests the device may have caused or contributed to the event." You don\'t need certainty, and you don\'t need confirmation. When in doubt, report. The regulation also assumes malfunctions will recur — so even one-time events are reportable.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/summary.wav', image_url: IMG.M12, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m12_l1_c1', type: 'content', title: 'The MDR Framework',
        content: 'Three mandatory reporter types: manufacturers, importers, and device user facilities (home health agencies).\n\nUser facility obligations:\n• Death: report to FDA AND manufacturer within 10 working days\n• Serious injury: report to manufacturer (or FDA if manufacturer unknown) within 10 working days\n• Malfunction alone: voluntary reporting via MedWatch encouraged; mandatory only if likely to cause death/serious injury if it recurs\n\n"Reasonably suggest" standard: report unless the connection is "very remote or very unlikely."\n\nAnnual summary to FDA required every January 1.\nRecords retained minimum 5 years.',
        narration_script: 'Three mandatory reporter types: manufacturers, importers, and device user facilities including home health agencies. User facility obligations: death — report to FDA and manufacturer within 10 working days. Serious injury — report to manufacturer, or FDA if manufacturer is unknown, within 10 working days. Malfunction alone — voluntary MedWatch reporting encouraged; mandatory only if likely to cause death or serious injury if it recurs. "Reasonably suggest" standard: report unless the connection is very remote or very unlikely. Annual FDA summary due January 1. Records retained minimum five years.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/content1.wav', image_url: IMG.M12, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m12_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• "May have caused or contributed to" = LOW threshold. When in doubt, report\n• Death → FDA + manufacturer within 10 working days\n• Serious injury → manufacturer (FDA if unknown) within 10 working days\n• The regulation ASSUMES malfunctions WILL recur — don\'t dismiss "first-time" events\n• YOUR role: identify, document, and report UP immediately. Administrator files with FDA\n• Annual summary to FDA due every January 1\n• Records retained minimum 5 years',
        narration_script: 'Takeaways. "May have caused or contributed to" is a low threshold — when in doubt, report. Death: report to FDA and manufacturer within 10 working days. Serious injury: report to manufacturer within 10 working days. The regulation assumes malfunctions will recur — don\'t dismiss first-time events. Your role: identify, document, and report to the Administrator immediately. The Administrator files with the FDA. Annual FDA summary due January 1. Records retained minimum five years.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/takeaways.wav', image_url: IMG.M12, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m12_l1_ch', type: 'challenge', title: 'Challenge: Hospital Bed Rail Failure and Hip Fracture',
        content: 'A patient\'s hospital bed railing fails while they are repositioning, and the patient falls to the floor. Assessment reveals a hip fracture confirmed by subsequent X-ray. The bed is 3 years old and has never malfunctioned before.\n\nIs this an MDR reportable event?',
        narration_script: 'Challenge scenario. A hospital bed railing fails while the patient is repositioning. The patient falls and sustains a hip fracture confirmed by X-ray. The bed is three years old and has never malfunctioned before. Is this an MDR reportable event?',
        audio_path: '/training-audio/ACHC-ART-M12/l1/challenge.wav', image_url: IMG.M12, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'No — the bed is old and equipment fails eventually; this is normal wear', isCorrect: false, rationale: 'Device age and maintenance history are irrelevant to MDR reporting requirements. If a device caused a serious injury, it is reportable.' },
          { id: 'B', label: 'Yes — a medical device (hospital bed) malfunctioned and caused/contributed to serious injury (hip fracture). Device age is irrelevant to reporting', isCorrect: true, rationale: 'Correct — all three criteria are clearly met: medical device, malfunction, serious injury requiring intervention. Report.' },
          { id: 'C', label: 'Only if the patient dies from complications', isCorrect: false, rationale: 'Death triggers a different reporting path (FDA AND manufacturer), but serious injuries are ALSO mandatory reports to the manufacturer.' },
          { id: 'D', label: 'Only if the same bed has malfunctioned before', isCorrect: false, rationale: 'First-time malfunctions are reportable. The regulation assumes they will recur.' },
        ],
      },
      {
        card_id: 'achc_m12_l1_deb', type: 'content', title: 'Operational Debrief: All Three Criteria Met',
        content: 'Three criteria make an event MDR-reportable: (1) medical device, (2) malfunction, (3) death or serious injury. All three are clearly met.\n\nWhy the others fail:\n• A: "Normal wear" does not exempt from reporting. The device failed to perform as intended and injury resulted\n• C: Death and serious injury trigger DIFFERENT reporting paths — both to FDA + manufacturer (death) or manufacturer only (serious injury). Both are mandatory\n• D: First-time malfunctions are reportable. The regulation ASSUMES recurrence\n\nTimeline: 10 working days from when "any employee or person affiliated with the Agency becomes aware."\nDevice preservation: Do NOT return, repair, or discard until released by risk management — it is evidentiary.',
        narration_script: 'Debrief. Three criteria: medical device, malfunction, and death or serious injury. All three are clearly met. Option A is wrong — normal wear does not exempt from reporting. Option C is wrong — death and serious injury trigger different but both mandatory reporting paths. Option D is wrong — first-time malfunctions are reportable because the regulation assumes recurrence. Timeline: 10 working days from when any employee becomes aware. Device preservation: do not return, repair, or discard until risk management releases it — it is evidentiary.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/debrief.wav', image_url: IMG.M12, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m12_l2', topic_id: 'ACHC-ART-M12', title: 'Lesson 2: Reporting Process & Documentation', order: 2,
    cards: [
      {
        card_id: 'achc_m12_l2_s', type: 'summary', title: 'The 10-Day Clock Starts at YOUR Awareness',
        content: 'The 10-working-day FDA reporting deadline begins when ANY employee becomes aware of the event — not when the investigation concludes, not when the patient is discharged, not when a supervisor approves the report. Day 0 is awareness. Day 10 is the deadline.',
        narration_script: 'The 10-working-day FDA reporting deadline begins when any employee becomes aware of the event — not when the investigation concludes, not when the patient is discharged, not when a supervisor approves it. Day 0 is awareness. Day 10 is the deadline.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/summary.wav', image_url: IMG.M12, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m12_l2_c1', type: 'content', title: 'The MDR Reporting Chain',
        content: 'Step 1: YOU identify a device event — immediately notify your supervisor and document\nStep 2: Supervisor escalates to Administrator/Risk Manager\nStep 3: Risk Manager/QAPI review confirms reportability\nStep 4: Administrator submits FDA Form 3500A to FDA and notifies manufacturer within 10 working days of identification\nStep 5: PRESERVE the device — do not return, repair, or discard until released by risk management\n\nFDA Form 3500A required elements:\n• Patient information\n• Type of adverse event\n• Event description\n• Relevant lab/test data\n• Device identification (manufacturer, model, serial, lot)\n• Reporter identity and user facility information',
        narration_script: 'The MDR reporting chain. Step 1: you identify the event — notify supervisor and document immediately. Step 2: supervisor escalates to Administrator or Risk Manager. Step 3: QAPI review confirms reportability. Step 4: Administrator submits FDA Form 3500A and notifies the manufacturer within 10 working days of identification. Step 5: preserve the device — do not return, repair, or discard until risk management releases it. FDA Form 3500A required elements: patient information, adverse event type, event description, relevant lab data, device identification including manufacturer, model, serial, and lot number, and reporter identity.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/content1.wav', image_url: IMG.M12, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m12_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• YOUR job: identify → document → report to Administrator IMMEDIATELY\n• The 10-day clock starts when ANY employee becomes AWARE — not at investigation end\n• Preserve the device — it is evidentiary. Do NOT return to DME until released\n• Document: device name, manufacturer, model, serial number, lot number. Date, time, location. Exact sequence of events. Patient status before, during, and after. Who you notified and when\n• Photograph the device if possible before removal\n• Near-miss events: voluntary MedWatch reporting (Form 3500) is encouraged',
        narration_script: 'Takeaways. Your job: identify, document, and report to the Administrator immediately. The 10-day clock starts when any employee becomes aware. Preserve the device — it is evidentiary, do not return it to the DME until risk management releases it. Documentation must include device name, manufacturer, model, serial, and lot number; date, time, and location; the exact sequence of events; patient status before, during, and after; and who you notified and when. Photograph the device if possible before removal. Near-miss events should be reported voluntarily via MedWatch Form 3500.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/takeaways.wav', image_url: IMG.M12, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m12_l2_ch', type: 'challenge', title: 'Challenge: Day 8, No MDR Initiated',
        content: 'On Day 1, you documented a patient fall linked to a hospital bed rail failure. On Day 8, you learn from a QA review that no MDR was initiated despite the event being clearly reportable. The deadline is Day 10.\n\nWho should have acted by now, and what must happen in the next 2 working days?',
        narration_script: 'Challenge scenario. On Day 1 you documented a patient fall linked to a bed rail failure. On Day 8 in a QA review you learn no MDR was initiated. The deadline is Day 10. Who should have acted by now, and what must happen in the next two working days?',
        audio_path: '/training-audio/ACHC-ART-M12/l2/challenge.wav', image_url: IMG.M12, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'You should have filed the FDA form yourself on Day 1', isCorrect: false, rationale: 'Your role is to report to the Administrator. The Administrator files with the FDA — not field staff.' },
          { id: 'B', label: 'The Administrator/Risk Manager should have initiated the MDR process. In the next 2 days, the report must be filed immediately to meet the Day 10 deadline', isCorrect: true, rationale: 'Correct — the Administrator bears the regulatory reporting obligation. But at Day 8, immediate escalation is required to meet the deadline.' },
          { id: 'C', label: 'The deadline can be extended by notifying the FDA of the delay', isCorrect: false, rationale: 'The 10-working-day deadline is fixed. There is no extension mechanism for standard MDR reports.' },
          { id: 'D', label: 'The QA reviewer should file the report', isCorrect: false, rationale: 'The Administrator is the responsible party for MDR submissions. QA review identifies the gap — it does not substitute for proper reporting authority.' },
        ],
      },
      {
        card_id: 'achc_m12_l2_deb', type: 'content', title: 'Operational Debrief: Reporting Chain Accountability',
        content: 'Field staff report to the Administrator. The Administrator bears the FDA filing obligation.\n\nWhy the others fail:\n• A: Field staff are not the filing party. Your role ends at reporting to the Administrator immediately upon identification\n• C: The 10-working-day deadline is fixed with no extension mechanism\n• D: QA review identifies gaps but does not have the authority to file MDR reports\n\nMissing the Day 10 deadline:\nFailure to file within the deadline = regulatory violation. FDA can impose fines, enhanced oversight, and require corrective action.\n\nPrevention: When you report on Day 1, confirm with your supervisor that the escalation chain was activated.',
        narration_script: 'Debrief. Field staff report to the Administrator. The Administrator bears the FDA filing obligation. Option A is wrong — your role ends at reporting to the Administrator. Option C is wrong — the 10-day deadline is fixed with no extension. Option D is wrong — QA review identifies gaps but does not have filing authority. Missing the deadline is a regulatory violation with potential fines and enhanced oversight. Prevention: when you report on Day 1, confirm with your supervisor that the escalation chain was activated.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/debrief.wav', image_url: IMG.M12, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m12_l3', topic_id: 'ACHC-ART-M12', title: 'Lesson 3: Voluntary Reporting & Chemical Safety', order: 3,
    cards: [
      {
        card_id: 'achc_m12_l3_s', type: 'summary', title: 'Your Individual Report Can Protect Patients Nationwide',
        content: 'A device failure in your patient\'s home may be the same defect in thousands of other homes nationwide. Your voluntary MedWatch report triggers FDA analysis that can lead to a recall, design correction, or national safety communication. Individual reports matter — they are not bureaucratic exercises.',
        narration_script: 'A device failure in your patient\'s home may be the same defect deployed in thousands of other homes nationwide. Your voluntary MedWatch report triggers FDA analysis that can lead to a recall, a design correction, or a national safety communication. Individual reports matter.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/summary.wav', image_url: IMG.M12, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m12_l3_c1', type: 'content', title: 'Voluntary Reporting and Chemical Safety',
        content: 'MedWatch voluntary reporting (Form 3500) — healthcare professionals encouraged to report:\n• Adverse events, product use errors, quality problems\n• Device malfunctions that don\'t meet mandatory threshold\n• Near-miss events with significant potential\n• Available online at fda.gov or via MedWatcher mobile app\n\nSafety Data Sheets in home health context:\n• Chemical hazards in patient homes AND office environments\n• Health hazard = statistically significant evidence of acute/chronic health effects\n• SDS training required at orientation AND annually\n• Training elements: chemical presence in work area, reading labels/SDS, emergency procedures\n\nAnnual MDR in-service: required with documentation of date, time, attendees, and training outline.',
        narration_script: 'Voluntary MedWatch reporting for healthcare professionals. Use Form 3500 for adverse events, product use errors, quality problems, device malfunctions that don\'t meet mandatory threshold, and near-miss events. Available online at fda.gov or via the MedWatcher mobile app. Safety Data Sheets in the home health context: chemical hazards exist in patient homes and office environments. SDS training is required at orientation and annually. Training must cover the chemicals present in your work area, how to read labels and SDS, and emergency procedures. The annual MDR in-service is required with documentation of date, time, attendees, and training content.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/content1.wav', image_url: IMG.M12, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m12_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Voluntary reporting supplements mandatory reporting — it captures events that may not meet mandatory thresholds\n• Near-miss = something went wrong but did not cause injury this time. Still worth reporting voluntarily\n• Annual MDR in-service must include documentation of attendees and training content\n• SDS training happens at orientation AND annually\n• Your contemporaneous documentation of device events is the foundation of the FDA report — be thorough and objective\n• Document device information immediately at the scene — before removal, before discussion',
        narration_script: 'Takeaways. Voluntary reporting supplements mandatory reporting and captures events that may not meet mandatory thresholds. Near-miss events — where something went wrong but no injury resulted — are worth voluntary reporting. Annual MDR in-service must document attendees and training content. SDS training occurs at orientation and annually. Your contemporaneous documentation of device events forms the foundation of the FDA report — be thorough and objective. Document device information immediately at the scene, before removal and before discussion.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/takeaways.wav', image_url: IMG.M12, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m12_l3_ch', type: 'challenge', title: 'Challenge: Glucose Meter Systematic Inaccuracy',
        content: 'A patient reports their new blood glucose meter consistently reads 30-40 mg/dL LOWER than lab values drawn the same day. This has happened 3 times. The patient has been adjusting insulin doses based on the meter readings, resulting in one episode of moderate hypoglycemia (treated at home with juice, no ER visit).\n\nWhat type of reporting applies?',
        narration_script: 'Challenge scenario. A patient reports their glucose meter consistently reads 30 to 40 mg/dL lower than same-day lab values — three times. The patient adjusted insulin doses based on meter readings and had one episode of moderate hypoglycemia, treated at home. What type of reporting applies?',
        audio_path: '/training-audio/ACHC-ART-M12/l3/challenge.wav', image_url: IMG.M12, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'No reporting needed — the patient managed the hypoglycemia at home', isCorrect: false, rationale: 'Patient self-treatment does not eliminate reporting obligations. The device malfunctioned and caused a clinical event.' },
          { id: 'B', label: 'Both: internal incident reporting plus manufacturer notification for the malfunction, AND evaluation of whether hypoglycemia constitutes "serious injury" requiring mandatory FDA reporting', isCorrect: true, rationale: 'Correct — the device malfunctioned systematically and caused a clinical event. Evaluate severity for mandatory threshold; at minimum, voluntary MedWatch is appropriate.' },
          { id: 'C', label: 'Only a complaint to the meter company', isCorrect: false, rationale: 'A manufacturer complaint alone does not fulfill documentation, incident reporting, or potential regulatory reporting obligations.' },
          { id: 'D', label: 'Document it and move on — glucose meters aren\'t medical devices', isCorrect: false, rationale: 'Blood glucose meters are FDA-regulated Class II medical devices. They are definitively medical devices.' },
        ],
      },
      {
        card_id: 'achc_m12_l3_deb', type: 'content', title: 'Operational Debrief: Systematic Malfunction Evaluation',
        content: 'A glucose meter is a medical device. Systematic inaccuracy leading to inappropriate insulin dosing and hypoglycemia = device malfunction causing a clinical event.\n\nWhy the others fail:\n• A: Patient self-treatment doesn\'t eliminate reporting. The device caused a clinical event\n• C: Manufacturer complaint alone does not fulfill documentation and incident reporting obligations\n• D: Blood glucose meters are FDA-regulated Class II devices — factually incorrect that they aren\'t medical devices\n\nClinical follow-up required:\n• Patient needs alternative monitoring immediately\n• Physician notification for insulin dose adjustment\n• All meter readings from this device are unreliable\n• Three consistent misreadings = systematic defect, not random error — manufacturer needs this pattern data',
        narration_script: 'Debrief. A glucose meter is an FDA-regulated Class II medical device. Systematic inaccuracy causing inappropriate insulin dosing and hypoglycemia is a device malfunction that caused a clinical event. Option A fails because patient self-treatment does not eliminate reporting. Option C alone is insufficient. Option D is factually incorrect. Clinical follow-up: the patient needs alternative monitoring immediately, physician notification for insulin adjustment, and all readings from this device are unreliable. Three consistent misreadings indicate a systematic defect — the manufacturer needs this pattern data to evaluate the device.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/debrief.wav', image_url: IMG.M12, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m12_l4', topic_id: 'ACHC-ART-M12', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m12_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. "May have caused or contributed to" is the reporting threshold — NOT "definitely caused"\n2. Deaths → FDA + manufacturer within 10 working days. Serious injuries → manufacturer within 10 working days\n3. The regulation ASSUMES malfunctions will recur — report first-time events\n4. YOUR job: identify, document, report to Administrator IMMEDIATELY. Their job: file with FDA\n5. Three categories of serious injury: life-threatening, permanent impairment, requiring intervention to prevent permanent damage\n6. Annual MDR in-service is required with documented attendees and training content\n\nOperational bridge: Your preceptor will evaluate your ability to identify device malfunctions, initiate incident reports, describe the reporting pathway, and distinguish mandatory vs. voluntary reporting.',
        narration_script: 'Six takeaways. One: "may have caused or contributed to" is the threshold — not definitely caused. Two: deaths go to FDA and manufacturer within 10 working days; serious injuries go to the manufacturer within 10 working days. Three: the regulation assumes malfunctions will recur — report first-time events. Four: your job is to identify, document, and report to the Administrator immediately. Five: three types of serious injury — life-threatening, permanent impairment, requiring intervention to prevent permanent damage. Six: annual MDR in-service is required with documented attendance. Your preceptor will evaluate your ability to identify device malfunctions, initiate incident reports, describe the reporting pathway, and distinguish mandatory from voluntary reporting.',
        audio_path: '/training-audio/ACHC-ART-M12/l4/synthesis.wav', image_url: IMG.M12, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m12_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. "May have caused or contributed to" means you report based on POSSIBILITY, not certainty\n2. A patient saying "I\'m fine" after a device failure does NOT eliminate your reporting obligation\n3. First-time malfunctions are treated as if they WILL happen again — report them\n4. The 10-day clock starts when ANY employee becomes aware — not when the investigation concludes\n5. Your documentation of the event becomes the foundation of the FDA report — be thorough and objective\n\nConfidence check: How confident are you in recognizing and reporting medical device events in the field?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: "may have caused or contributed to" means you report based on possibility, not certainty. Two: a patient saying they are fine does not eliminate reporting. Three: first-time malfunctions are treated as if they will happen again. Four: the 10-day clock starts when any employee becomes aware. Five: your documentation becomes the foundation of the FDA report — be thorough and objective. How confident are you in recognizing and reporting medical device events in the field?',
        audio_path: '/training-audio/ACHC-ART-M12/l4/finaldebrief.wav', image_url: IMG.M12, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m12_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Can you identify common medical devices in your patient caseload?\n• Do you know the immediate reporting pathway for device malfunctions?\n• Can you articulate the difference between mandatory and voluntary reporting?\n• Can you identify the elements needed for an incident report regarding a device event?\n• Do you know where the Agency\'s medical device reporting policy is located?\n\nResources:\n• Agency Medical Device/Safety Hazard Reporting Policy\n• FDA Form 3500A (mandatory)\n• FDA MedWatch online voluntary reporting portal (fda.gov)\n• MedWatcher mobile app\n• Incident Report form\n• Device manufacturer contact list',
        narration_script: 'Operational next steps. Your preceptor will evaluate: your ability to identify common medical devices, your knowledge of the reporting pathway, your ability to distinguish mandatory from voluntary reporting, the elements you would document in a device incident report, and where the Agency\'s medical device reporting policy is located. Resources: Agency Medical Device Reporting Policy, FDA Form 3500A, FDA MedWatch portal at fda.gov, MedWatcher mobile app, incident report form, and device manufacturer contact list.',
        audio_path: '/training-audio/ACHC-ART-M12/l4/nextsteps.wav', image_url: IMG.M12, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m12_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The module clarified my device reporting obligations. (1–5)\n2. The distinction between mandatory and voluntary reporting was clear. (1–5)\n3. The scenarios reflected realistic device situations in home health. (1–5)\n4. I feel more prepared to identify and report device-related events. (1–5)\n5. What device safety topic would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the clarity of your device reporting obligations, the distinction between mandatory and voluntary reporting, the realism of the scenarios, and your preparedness. Share what device safety topic you want more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered. Congratulations on completing all 12 ACHC Required Annual Training modules.',
        audio_path: '/training-audio/ACHC-ART-M12/l4/survey.wav', image_url: IMG.M12, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },
];

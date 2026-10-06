/**
 * POSTPARTUM DEPRESSION ALERT — SCRIPT.JS
 * 
 * Comprehensive Frontend Engine:
 * 1. Audio Engine & DTMF Synthesizer (Web Audio API + SpeechSynthesis in en-IN, hi-IN, ta-IN)
 * 2. 8-Question Clinical Voice Script & Decision Tree (Physical PPH/Sepsis + EPDS Mood + Suicide Ideation)
 * 3. Server-Sent Events (SSE) Simulated Telemetry Timeline
 * 4. Triage Escalation & ASHA Dispatch Engine with SLA Timers
 * 5. Interactive Health Worker Dashboard (Data filtering, search, dynamic adding, status resolution, sparklines)
 * 6. Validated 10-Item EPDS Self-Check Calculator (Cox et al., 1987 + BMJ 2020 bands)
 * 7. Sticky 14-Day Surveillance Stepper & WHO Protocol Navigator
 * 8. UI Modals, Masked Logging, and Accessibility Live Announcements
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DATA MODELS & CLINICAL SCRIPTS
  // ==========================================

  // Clinical Questions for the Interactive Call (Section 2 of Prompt)
  const CALL_QUESTIONS = [
    {
      id: 'Q1',
      key: 'heavy_bleeding',
      title: 'Very heavy bleeding',
      prompt: {
        en: 'Namaste {name} ji. This is your postnatal automated health check. Question 1: Are you experiencing very heavy bleeding, such as soaking an entire pad within one hour, or passing large blood clots? Press 1 for YES, or 2 for NO.',
        hi: 'नमस्ते {name} जी। यह आपकी प्रसवोत्तर स्वास्थ्य जांच है। प्रश्न 1: क्या आपको बहुत अधिक रक्तस्राव हो रहा है, जैसे एक घंटे में पूरा पैड भीगना या बड़े थक्के निकलना? हाँ के लिए 1 दबाएं, नहीं के लिए 2 दबाएं।',
        ta: 'வணக்கம் {name} அம்மா. இது உங்கள் பிரசவத்திற்குப் பிந்தைய நல பரிசோதனை. கேள்வி 1: உங்களுக்கு ஒரு மணி நேரத்திற்குள் ஒரு பேட் முழுமையாக நனையும் அளவுக்கு கடுமையான இரத்தப்போக்கு உள்ளதா? ஆம் என்றால் 1 ஐயும், இல்லை என்றால் 2 ஐயும் அழுத்தவும்.'
      },
      type: 'yes_no',
      urgentIfYes: true,
      dangerExplanation: 'Reported severe postpartum hemorrhage (PPH) risk: soaking pad in <1 hr.'
    },
    {
      id: 'Q2',
      key: 'fever_discharge',
      title: 'Fever, chills, or foul-smelling discharge',
      prompt: {
        en: 'Question 2: Do you currently have a fever, shivering chills, or any foul-smelling vaginal discharge? Press 1 for YES, or 2 for NO.',
        hi: 'प्रश्न 2: क्या आपको वर्तमान में तेज बुखार, कंपकंपी, या दुर्गंधयुक्त स्राव हो रहा है? हाँ के लिए 1, नहीं के लिए 2 दबाएं।',
        ta: 'கேள்வி 2: உங்களுக்கு காய்ச்சல், நடுக்கம் அல்லது துர்நாற்றத்துடன் கூடிய வெளியேற்றம் உள்ளதா? ஆம் என்றால் 1, இல்லை என்றால் 2 அழுத்தவும்.'
      },
      type: 'yes_no',
      followupIfYes: true,
      dangerExplanation: 'Possible puerperal sepsis / uterine infection signs.'
    },
    {
      id: 'Q3',
      key: 'severe_headache_vision',
      title: 'Severe headache or blurred vision',
      prompt: {
        en: 'Question 3: Are you experiencing a severe, splitting headache, blurred vision, or any fainting spells? Press 1 for YES, or 2 for NO.',
        hi: 'प्रश्न 3: क्या आपको बहुत तेज सिरदर्द, आंखों में धुंधलापन, या चक्कर आ रहे हैं? हाँ के लिए 1, नहीं के लिए 2 दबाएं।',
        ta: 'கேள்வி 3: உங்களுக்கு கடுமையான தலைவலி, பார்வை மங்குதல் அல்லது வலிப்பு போன்ற உணர்வு உள்ளதா? ஆம் என்றால் 1, இல்லை என்றால் 2 அழுத்தவும்.'
      },
      type: 'yes_no',
      urgentIfYes: true,
      dangerExplanation: 'Postpartum preeclampsia danger signs (hypertension / neurological danger).'
    },
    {
      id: 'Q4',
      key: 'breathing_chest_pain',
      title: 'Trouble breathing or chest pain',
      prompt: {
        en: 'Question 4: Are you having severe trouble breathing or sharp chest pain? Press 1 for YES, or 2 for NO.',
        hi: 'प्रश्न 4: क्या आपको सांस लेने में बहुत कठिनाई या सीने में तेज दर्द हो रहा है? हाँ के लिए 1, नहीं के लिए 2 दबाएं।',
        ta: 'கேள்வி 4: உங்களுக்கு மூச்சுத் திணறல் அல்லது நெஞ்சு வலி உள்ளதா? ஆம் என்றால் 1, இல்லை என்றால் 2 அழுத்தவும்.'
      },
      type: 'yes_no',
      urgentIfYes: true,
      dangerExplanation: 'Cardiovascular or pulmonary complication risk.'
    },
    {
      id: 'Q5',
      key: 'baby_feeding',
      title: 'Baby feeding well',
      prompt: {
        en: 'Question 5: Is your baby feeding well, latching properly, and having at least 6 wet diapers daily? Press 1 for YES, or 2 for NO.',
        hi: 'प्रश्न 5: क्या आपका शिशु ठीक से दूध पी रहा है और दिन में कम से कम 6 बार पेशाब कर रहा है? हाँ के लिए 1, नहीं के लिए 2 दबाएं।',
        ta: 'கேள்வி 5: குழந்தை தாய்ப்பால் நன்றாகக் குடிக்கிறதா? ஆம் என்றால் 1, இல்லை என்றால் 2 அழுத்தவும்.'
      },
      type: 'yes_no',
      followupIfNo: true,
      dangerExplanation: 'Neonatal feeding inadequacy or insufficient latch support.'
    },
    {
      id: 'Q6',
      key: 'mood_laugh',
      title: 'Able to laugh and see the funny side',
      prompt: {
        en: 'Question 6: Thinking of the past week, have you been able to laugh and see the bright side of things? Press 1 for As much as I always could, 2 for Rather less now, 3 for Definitely less, 4 for Not at all.',
        hi: 'प्रश्न 6: पिछले सप्ताह में, क्या आप हंसने और चीजों के अच्छे पहलू को देखने में सक्षम रही हैं? 1 हमेशा की तरह, 2 कुछ कम, 3 बहुत कम, 4 बिल्कुल नहीं।',
        ta: 'கேள்வி 6: கடந்த வாரத்தில், நீங்கள் வழக்கம்போல மனமகிழ்ச்சியுடன் சிரிக்க முடிந்ததா? 1 எப்போதும் போல, 2 சற்று குறைவு, 3 மிக குறைவு, 4 சுத்தமாக இல்லை.'
      },
      type: 'epds_scale',
      scoreMap: { '1': 0, '2': 1, '3': 2, '4': 3 }
    },
    {
      id: 'Q7',
      key: 'mood_anxious',
      title: 'Anxious or worried for no good reason',
      prompt: {
        en: 'Question 7: Have you felt anxious, panicked, or worried for no good reason? Press 1 for No not at all, 2 for Hardly ever, 3 for Yes sometimes, 4 for Yes very often.',
        hi: 'प्रश्न 7: क्या आप बिना किसी खास वजह के घबराई या बहुत चिंतित महसूस करती हैं? 1 बिल्कुल नहीं, 2 कभी-कभार, 3 हाँ कभी-कभी, 4 हाँ बहुत अक्सर।',
        ta: 'கேள்வி 7: எந்த குறிப்பிட்ட காரணமும் இன்றி தேவையில்லாத பதற்றம் அடைந்தீர்களா? 1 இல்லை, 2 அரிதாக, 3 சில சமயம், 4 அடிக்கடி.'
      },
      type: 'epds_scale',
      scoreMap: { '1': 0, '2': 1, '3': 2, '4': 3 }
    },
    {
      id: 'Q8',
      key: 'self_harm_ideation',
      title: 'Thoughts of harming oneself',
      prompt: {
        en: 'Final Question: Have you had any thoughts of harming yourself or feeling life is not worth living? Please be honest, we are here to support you. Press 1 for YES, or 2 for NO.',
        hi: 'अंतिम प्रश्न: क्या आपके मन में कभी खुद को नुकसान पहुंचाने या जीवन समाप्त करने के विचार आए हैं? कृपया संकोच न करें। हाँ के लिए 1, नहीं के लिए 2 दबाएं।',
        ta: 'இறுதி கேள்வி: உங்களை நீங்களே காயப்படுத்திக்கொள்ளும் எண்ணங்கள் அல்லது தீவிர மனச்சோர்வு ஏற்பட்டதா? ஆம் என்றால் 1, இல்லை என்றால் 2 அழுத்தவும்.'
      },
      type: 'yes_no',
      urgentIfYes: true,
      dangerExplanation: 'Direct crisis ideation reported (EPDS Item 10 trigger). Immediate supportive intervention required.'
    }
  ];

  // 10-Item EPDS Questionnaire (Cox, Holden & Sagovsky, 1987)
  const EPDS_10_QUESTIONS = [
    {
      id: 1,
      text: '1. I have been able to laugh and see the funny side of things:',
      options: [
        { label: 'As much as I always could', score: 0 },
        { label: 'Not quite so much now', score: 1 },
        { label: 'Definitely not so much now', score: 2 },
        { label: 'Not at all', score: 3 }
      ]
    },
    {
      id: 2,
      text: '2. I have looked forward with enjoyment to things:',
      options: [
        { label: 'As much as I ever did', score: 0 },
        { label: 'Rather less than I used to', score: 1 },
        { label: 'Definitely less than I used to', score: 2 },
        { label: 'Hardly at all', score: 3 }
      ]
    },
    {
      id: 3,
      text: '3. I have blamed myself unnecessarily when things went wrong:',
      options: [
        { label: 'No, never', score: 0 },
        { label: 'Not very often', score: 1 },
        { label: 'Yes, some of the time', score: 2 },
        { label: 'Yes, most of the time', score: 3 }
      ]
    },
    {
      id: 4,
      text: '4. I have been anxious or worried for no good reason:',
      options: [
        { label: 'No, not at all', score: 0 },
        { label: 'Hardly ever', score: 1 },
        { label: 'Yes, sometimes', score: 2 },
        { label: 'Yes, very often', score: 3 }
      ]
    },
    {
      id: 5,
      text: '5. I have felt scared or panicky for no very good reason:',
      options: [
        { label: 'No, not at all', score: 0 },
        { label: 'No, not much', score: 1 },
        { label: 'Yes, sometimes', score: 2 },
        { label: 'Yes, quite a lot', score: 3 }
      ]
    },
    {
      id: 6,
      text: '6. Things have been getting on top of me (feeling unable to cope):',
      options: [
        { label: 'No, I have been coping as well as ever', score: 0 },
        { label: 'No, most of the time I cope quite well', score: 1 },
        { label: 'Yes, sometimes I haven’t been coping as well as usual', score: 2 },
        { label: 'Yes, most of the time I haven’t been able to cope at all', score: 3 }
      ]
    },
    {
      id: 7,
      text: '7. I have been so unhappy that I have had difficulty sleeping:',
      options: [
        { label: 'No, not at all', score: 0 },
        { label: 'Not very often', score: 1 },
        { label: 'Yes, sometimes', score: 2 },
        { label: 'Yes, most of the time', score: 3 }
      ]
    },
    {
      id: 8,
      text: '8. I have felt sad or miserable:',
      options: [
        { label: 'No, not at all', score: 0 },
        { label: 'Not very often', score: 1 },
        { label: 'Yes, quite often', score: 2 },
        { label: 'Yes, most of the time', score: 3 }
      ]
    },
    {
      id: 9,
      text: '9. I have been so unhappy that I have been crying:',
      options: [
        { label: 'No, never', score: 0 },
        { label: 'Only occasionally', score: 1 },
        { label: 'Yes, quite often', score: 2 },
        { label: 'Yes, most of the time', score: 3 }
      ]
    },
    {
      id: 10,
      text: '10. The thought of harming myself has occurred to me: (Trigger Item)',
      isCrisisTrigger: true,
      options: [
        { label: 'Never', score: 0 },
        { label: 'Hardly ever', score: 1 },
        { label: 'Sometimes', score: 2 },
        { label: 'Yes, quite often', score: 3 }
      ]
    }
  ];

  // 14-Day Surveillance Schedule Content
  const SURVEILLANCE_SCHEDULE = {
    1: {
      day: 'Day 1 Check-In',
      prio: 'CRITICAL MONITORING',
      prioClass: 'high-prio',
      title: 'Immediate Obstetric Hemorrhage & Sepsis Screening',
      desc: 'High-priority focus on physical postpartum danger signs: heavy soaking of pads within 1 hour, passing of large clots, foul odor, and persistent high fever. Initial newborn latching and breastfeeding confirmation.',
      actions: [
        'Automated IVR call at mother\'s preferred morning slot',
        'If unanswered: 3-tier retry schedule (15m, 1h, 3h) before marking Unreachable',
        'Escalation target: Local ASHA Worker notified via SMS & Dashboard'
      ]
    },
    2: {
      day: 'Day 2 Check-In',
      prio: 'VITAL RECOVERY',
      prioClass: 'high-prio',
      title: 'Perineal Healing, Pain & Early Lactation Milestones',
      desc: 'Checks for surgical wound infection (episiotomy / Cesarean site), urinary retention, severe afterpains, and verifies that colostrum/milk is transitioning well.',
      actions: [
        'Pain evaluation and hydration reminder',
        'Verification of iron-folic acid and calcium supplement consumption',
        'Instant flag to ASHA worker if feeding difficulties persist'
      ]
    },
    3: {
      day: 'Day 3 Check-In',
      prio: 'BABY BLUES ONSET',
      prioClass: 'medium-prio',
      title: 'First Emotional Check: Distinguishing Blues from Depression',
      desc: 'Peak onset window for transient "baby blues" (tearfulness, exhaustion). Reassures mother while establishing baseline EPDS mood items.',
      actions: [
        'Gentle tone reassurance: normalizes maternal hormonal shifts',
        'Family companion alert sent to partner on practical rest assistance',
        'Sleep hygiene query: checks if mother gets 4 continuous hours of rest'
      ]
    },
    5: {
      day: 'Day 5 Check-In',
      prio: 'NEONATAL CARE',
      prioClass: 'medium-prio',
      title: 'Newborn Jaundice & Maternal Vital Signs',
      desc: 'Screening for neonatal jaundice signs (yellowing of skin/eyes), lethargy in baby, and maternal blood pressure alerts (throbbing headaches).',
      actions: [
        'Baby feeding frequency check (minimum 8-12 feedings/24h)',
        'Umbilical cord stump infection screening',
        'ASHA home visit confirmation sync'
      ]
    },
    7: {
      day: 'Day 7 Check-In',
      prio: 'ONE-WEEK MILESTONE',
      prioClass: 'medium-prio',
      title: 'Full Secondary Hemorrhage & Mood Assessment',
      desc: 'Late postpartum hemorrhage detection window. Re-assessment of emotional anxiety and domestic support safety.',
      actions: [
        'Secondary lochia check: monitoring if bleeding has turned pale/scant',
        '3-item EPDS mood scoring comparison against Day 3 baseline',
        'PHC weekly surveillance cohort report update'
      ]
    },
    10: {
      day: 'Day 10 Check-In',
      prio: 'ROUTINE SURVEILLANCE',
      prioClass: 'safe-prio',
      title: 'Physical Mobility, Hydration & Sustained Rest',
      desc: 'Screening for deep vein thrombosis (calf pain/swelling), mastitis / breast engorgement, and maternal dietary intake.',
      actions: [
        'Mastitis check: redness or hot spots on breast with fever',
        'Gentle reassurance regarding newborn sleep cycles',
        'Schedule reminder for upcoming Day 14 comprehensive review'
      ]
    },
    14: {
      day: 'Day 14 Check-In',
      prio: 'PRIMARY DISCHARGE AUDIT',
      prioClass: 'safe-prio',
      title: 'Two-Week Complete Postnatal Milestone',
      desc: 'Completion of the critical acute phase. Comprehensive evaluation before transitioning to weekly check-ins culminating in the Week-6 audit.',
      actions: [
        'Complete 8-question health and emotional audit',
        'Formal ASHA sign-off on home recovery progress',
        'Transition to weekly supportive companion messages'
      ]
    },
    42: {
      day: 'Week 6 (Day 42 Milestone)',
      prio: 'WHO GOLD STANDARD',
      prioClass: 'milestone-prio',
      title: 'WHO 6-Week Postnatal Milestone & Full EPDS Review',
      desc: 'Official end of the postpartum puerperium period. Full clinical validation of maternal physical involution, family planning options, and major depression screening.',
      actions: [
        'Comprehensive 10-Item EPDS depression review',
        'Contraception / family planning guidance & counseling',
        'Postnatal clinic visit coordination at the Primary Health Center'
      ]
    }
  };

  // Mock Frontline ASHA Workers & Dashboard Patient Queue
  let patientQueue = [
    {
      id: 'PT-101',
      name: 'Priya Sundaram',
      phone: '+91 98765 43210',
      maskedPhone: '+91 98765 ••••10',
      village: 'Manalur East, Ward 2',
      deliveryDate: '2026-10-04',
      postnatalDay: 2,
      riskLevel: 'urgent',
      primaryFinding: 'Heavy bleeding soaking pad < 1h (Q1: Yes)',
      moodScores: [2, 3, 2, 3], // for sparkline
      assignedAsha: 'Lakshmi Devi',
      phc: 'Kallakurichi Rural PHC',
      status: 'Escalated to ANM (12 min left)'
    },
    {
      id: 'PT-102',
      name: 'Sunita Verma',
      phone: '+91 94421 88219',
      maskedPhone: '+91 94421 ••••19',
      village: 'Chinnasalem Sector 3',
      deliveryDate: '2026-10-01',
      postnatalDay: 5,
      riskLevel: 'urgent',
      primaryFinding: 'Severe headache & blurred vision (Q3: Yes)',
      moodScores: [1, 2, 2, 2],
      assignedAsha: 'Mary Stella',
      phc: 'Dindigul West Sub-center',
      status: 'ASHA In-transit'
    },
    {
      id: 'PT-103',
      name: 'Ananya Roy',
      phone: '+91 91234 56789',
      maskedPhone: '+91 91234 ••••89',
      village: 'Kallakurichi Town Ward 4',
      deliveryDate: '2026-09-29',
      postnatalDay: 7,
      riskLevel: 'urgent',
      primaryFinding: 'Crisis self-harm thoughts (Q8: Yes)',
      moodScores: [3, 3, 3, 3],
      assignedAsha: 'Lakshmi Devi',
      phc: 'Kallakurichi Rural PHC',
      status: 'Tele-MANAS counselor active'
    },
    {
      id: 'PT-104',
      name: 'Kavitha Ramasamy',
      phone: '+91 97890 12345',
      maskedPhone: '+91 97890 ••••45',
      village: 'Sankarapuram South',
      deliveryDate: '2026-10-03',
      postnatalDay: 3,
      riskLevel: 'followup',
      primaryFinding: 'High anxiety & baby feeding distress (Q5: No)',
      moodScores: [2, 2, 2, 2],
      assignedAsha: 'K. Meena',
      phc: 'Sankarapuram PHC',
      status: '48h Home Visit Booked'
    },
    {
      id: 'PT-105',
      name: 'Fatima Begum',
      phone: '+91 98450 67891',
      maskedPhone: '+91 98450 ••••91',
      village: 'Sitapur North Hamlet',
      deliveryDate: '2026-09-30',
      postnatalDay: 6,
      riskLevel: 'followup',
      primaryFinding: 'Low-grade fever & shivering chills (Q2: Yes)',
      moodScores: [1, 2, 1, 1],
      assignedAsha: 'Sunita Verma',
      phc: 'Sitapur Health Post',
      status: 'Antibiotics prescribed by PHC'
    },
    {
      id: 'PT-106',
      name: 'Divya Krishnan',
      phone: '+91 98220 54321',
      maskedPhone: '+91 98220 ••••21',
      village: 'Manalur West, Ward 1',
      deliveryDate: '2026-10-05',
      postnatalDay: 1,
      riskLevel: 'safe',
      primaryFinding: 'Vitals stable, infant latching, good sleep',
      moodScores: [0, 0, 1, 0],
      assignedAsha: 'Lakshmi Devi',
      phc: 'Kallakurichi Rural PHC',
      status: 'Routine Day 2 Scheduled'
    },
    {
      id: 'PT-107',
      name: 'Radhika Nair',
      phone: '+91 99001 23456',
      maskedPhone: '+91 99001 ••••56',
      village: 'Chinnasalem Main',
      deliveryDate: '2026-09-26',
      postnatalDay: 10,
      riskLevel: 'safe',
      primaryFinding: 'Normal lochia, mood positive, walking easily',
      moodScores: [0, 1, 0, 0],
      assignedAsha: 'Mary Stella',
      phc: 'Dindigul West Sub-center',
      status: 'Routine Day 14 Scheduled'
    }
  ];

  // ==========================================
  // 2. AUDIO & DTMF SYNTHESIZER
  // ==========================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Dual-tone multi-frequency (DTMF) telephone tone generator
  const DTMF_FREQS = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
  };

  function playDtmfTone(key, durationMs = 180) {
    try {
      initAudioContext();
      if (!audioCtx || !DTMF_FREQS[key]) return;

      const [freq1, freq2] = DTMF_FREQS[key];
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (durationMs / 1000));

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + (durationMs / 1000));
      osc2.stop(audioCtx.currentTime + (durationMs / 1000));
    } catch (e) {
      console.warn('Web Audio DTMF unavailable:', e);
    }
  }

  // SpeechSynthesis wrapper with dialect fallback
  function speakPrompt(text, langCode = 'en', onEndCallback) {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) setTimeout(onEndCallback, 1500);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose voice
    const voices = window.speechSynthesis.getVoices();
    let targetVoice = null;

    if (langCode === 'hi') {
      utterance.lang = 'hi-IN';
      targetVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
    } else if (langCode === 'ta') {
      utterance.lang = 'ta-IN';
      targetVoice = voices.find(v => v.lang.includes('ta') || v.name.includes('Tamil'));
    } else {
      utterance.lang = 'en-IN';
      targetVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    }

    if (targetVoice) utterance.voice = targetVoice;
    utterance.rate = 0.94; // slightly slower for clear healthcare comprehension
    utterance.pitch = 1.05; // warm, comforting tone

    utterance.onend = () => {
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    utterance.onerror = () => {
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopAllSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // Preload voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // ==========================================
  // 3. VOICE CALL SIMULATOR STATE MACHINE
  // ==========================================
  const callState = {
    isActive: false,
    callerName: 'Priya',
    phoneNumber: '+919876543210',
    maskedPhone: '+91 98765 ••••10',
    language: 'en',
    assignedPhc: 'phc-kallakurichi',
    currentQuestionIndex: 0,
    answers: {},
    auditTrail: [],
    timerInterval: null,
    callDurationSec: 0,
    presetScenario: null
  };

  // DOM Elements for Live Call
  const liveCallModal = document.getElementById('liveCallModal');
  const liveCallPromptText = document.getElementById('liveCallPromptText');
  const liveResponsesAuditList = document.getElementById('liveResponsesAuditList');
  const keypadActionHint = document.getElementById('keypadActionHint');
  const currentSpeakerName = document.getElementById('currentSpeakerName');
  const hangupCallModalBtn = document.getElementById('hangupCallModalBtn');
  const hangupKeypadBtn = document.getElementById('hangupKeypadBtn');
  const sseStepQueued = document.getElementById('sseStepQueued');
  const sseStepRinging = document.getElementById('sseStepRinging');
  const sseStepAnswered = document.getElementById('sseStepAnswered');
  const sseStepScreening = document.getElementById('sseStepScreening');
  const sseStepCompleted = document.getElementById('sseStepCompleted');

  // Trigger Call from Form or Preset
  function initiateCallSession(callerName, phone, lang, phc, scenario = null) {
    callState.isActive = true;
    callState.callerName = callerName || 'Priya';
    callState.phoneNumber = phone || '+919876543210';
    callState.maskedPhone = maskPhoneNumber(callState.phoneNumber);
    callState.language = lang || 'en';
    callState.assignedPhc = phc || 'phc-kallakurichi';
    callState.currentQuestionIndex = 0;
    callState.answers = {};
    callState.auditTrail = [];
    callState.callDurationSec = 0;
    callState.presetScenario = scenario;

    // Reset SSE visual steps
    resetSseSteps();
    updateLiveAuditList();

    // Open Modal
    openModal('liveCallModal');
    announceA11y(`Initiating automated postnatal call simulation for ${callState.callerName}`);

    // Simulate SSE sequence: Queued -> Ringing -> Answered
    setSseStep('queued');
    liveCallPromptText.textContent = `Dialing ${callState.maskedPhone}... Queued at primary telecom gateway.`;

    setTimeout(() => {
      if (!callState.isActive) return;
      setSseStep('ringing');
      liveCallPromptText.textContent = `Handset ringing in ${callState.language.toUpperCase()} dialect...`;
      playDtmfTone('1', 80);

      setTimeout(() => {
        if (!callState.isActive) return;
        setSseStep('answered');
        liveCallPromptText.textContent = `Call answered by ${callState.callerName} ji. Initializing audio prompt...`;

        setTimeout(() => {
          if (!callState.isActive) return;
          setSseStep('screening');
          startQuestionsFlow();
        }, 1200);
      }, 1500);
    }, 1200);
  }

  function setSseStep(step) {
    [sseStepQueued, sseStepRinging, sseStepAnswered, sseStepScreening, sseStepCompleted].forEach(el => {
      el.classList.remove('active', 'done');
    });

    if (step === 'queued') {
      sseStepQueued.classList.add('active');
    } else if (step === 'ringing') {
      sseStepQueued.classList.add('done');
      sseStepRinging.classList.add('active');
    } else if (step === 'answered') {
      sseStepQueued.classList.add('done');
      sseStepRinging.classList.add('done');
      sseStepAnswered.classList.add('active');
    } else if (step === 'screening') {
      sseStepQueued.classList.add('done');
      sseStepRinging.classList.add('done');
      sseStepAnswered.classList.add('done');
      sseStepScreening.classList.add('active');
    } else if (step === 'completed') {
      sseStepQueued.classList.add('done');
      sseStepRinging.classList.add('done');
      sseStepAnswered.classList.add('done');
      sseStepScreening.classList.add('done');
      sseStepCompleted.classList.add('active');
    }
  }

  function resetSseSteps() {
    [sseStepQueued, sseStepRinging, sseStepAnswered, sseStepScreening, sseStepCompleted].forEach(el => {
      el.classList.remove('active', 'done');
    });
  }

  function startQuestionsFlow() {
    askCurrentQuestion();
  }

  function askCurrentQuestion() {
    if (!callState.isActive) return;

    if (callState.currentQuestionIndex >= CALL_QUESTIONS.length) {
      completeCallSession();
      return;
    }

    const q = CALL_QUESTIONS[callState.currentQuestionIndex];
    let rawPrompt = q.prompt[callState.language] || q.prompt['en'];
    let formattedText = rawPrompt.replace('{name}', callState.callerName);

    currentSpeakerName.textContent = `Automated Care Voice (${callState.language.toUpperCase()} dialect):`;
    liveCallPromptText.textContent = formattedText;
    keypadActionHint.textContent = `Waiting for keypad response for ${q.id}: (${q.title})...`;
    announceA11y(formattedText);

    // Speak Prompt
    speakPrompt(formattedText, callState.language, () => {
      // If a preset scenario is active, auto-keypad response after audio finishes
      if (callState.presetScenario) {
        handlePresetAutoKeypress(q);
      }
    });
  }

  // Handle Preset Automations
  function handlePresetAutoKeypress(question) {
    if (!callState.isActive) return;
    const scenario = callState.presetScenario;
    let chosenKey = '2'; // Default safe NO

    if (scenario === 'urgent-haemorrhage') {
      if (question.id === 'Q1') chosenKey = '1'; // Heavy bleeding YES
    } else if (scenario === 'urgent-suicide') {
      if (question.id === 'Q8') chosenKey = '1'; // Suicide YES
    } else if (scenario === 'followup-mood') {
      if (question.id === 'Q5') chosenKey = '2'; // Feeding NOT well
      if (question.id === 'Q6') chosenKey = '4'; // Can't laugh
      if (question.id === 'Q7') chosenKey = '4'; // Very anxious
    } else if (scenario === 'safe-recovery') {
      if (question.id === 'Q5') chosenKey = '1'; // Feeding YES
      if (question.id === 'Q6') chosenKey = '1'; // Able to laugh
      if (question.id === 'Q7') chosenKey = '1'; // Not anxious
    }

    setTimeout(() => {
      if (callState.isActive) {
        recordKeypadInput(chosenKey);
      }
    }, 1100);
  }

  // User Presses Keypad Button
  function recordKeypadInput(key) {
    if (!callState.isActive) return;
    playDtmfTone(key);

    if (key === '9') {
      // Re-prompt repeat
      liveCallPromptText.textContent = `[Repeated prompt requested via Key 9]`;
      askCurrentQuestion();
      return;
    }

    const currentQ = CALL_QUESTIONS[callState.currentQuestionIndex];
    if (!currentQ) return;

    // Record response
    callState.answers[currentQ.id] = {
      questionId: currentQ.id,
      title: currentQ.title,
      keyEntered: key,
      label: getKeyLabel(currentQ, key)
    };

    callState.auditTrail.push({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      qId: currentQ.id,
      title: currentQ.title,
      key: key,
      answerLabel: getKeyLabel(currentQ, key)
    });

    updateLiveAuditList();

    // Stop currently playing voice and advance
    stopAllSpeech();
    callState.currentQuestionIndex++;

    setTimeout(() => {
      askCurrentQuestion();
    }, 600);
  }

  function getKeyLabel(q, key) {
    if (q.type === 'yes_no') {
      return key === '1' ? 'YES (Affirmative)' : 'NO (Negative)';
    } else if (q.type === 'epds_scale') {
      if (key === '1') return 'Score 0 (Optimal)';
      if (key === '2') return 'Score 1 (Mild)';
      if (key === '3') return 'Score 2 (Moderate)';
      if (key === '4') return 'Score 3 (Severe)';
    }
    return `Key ${key}`;
  }

  function updateLiveAuditList() {
    if (callState.auditTrail.length === 0) {
      liveResponsesAuditList.innerHTML = '<li class="empty-state">No questions answered yet.</li>';
      return;
    }

    liveResponsesAuditList.innerHTML = callState.auditTrail.map(item => `
      <li>
        <span><strong>${item.qId}:</strong> ${item.title}</span>
        <span><code>Key ${item.key}</code> &bull; <em>${item.answerLabel}</em></span>
      </li>
    `).join('');
  }

  // Terminate or Complete Call
  function completeCallSession() {
    callState.isActive = false;
    stopAllSpeech();
    setSseStep('completed');

    liveCallPromptText.textContent = `Call completed. Evaluating clinical risk engine and generating ASHA triage dispatches...`;
    announceA11y('Call completed. Evaluating risk engine.');

    setTimeout(() => {
      closeModal('liveCallModal');
      evaluateAndShowTriageResults();
    }, 1200);
  }

  function hangupCall() {
    callState.isActive = false;
    stopAllSpeech();
    closeModal('liveCallModal');
    showToast('Call hung up by caller.', 'info');
  }

  // ==========================================
  // 4. EVIDENCE-BASED CLINICAL RISK ENGINE
  // ==========================================
  function evaluateCallRisk(answers) {
    let riskLevel = 'safe'; // 'safe', 'followup', 'urgent'
    let reasons = [];
    let moodScoreSum = 0;
    let emergencyPointers = [];

    // Q1: Very heavy bleeding
    if (answers['Q1'] && answers['Q1'].keyEntered === '1') {
      riskLevel = 'urgent';
      reasons.push('Severe Postpartum Hemorrhage (PPH) warning sign: soaking a pad < 1 hr or large blood clots.');
      emergencyPointers.push('Check fundal tone, uterine massage, prepare IV fluids & hospital transfer.');
    }

    // Q2: Fever, chills, foul discharge
    if (answers['Q2'] && answers['Q2'].keyEntered === '1') {
      if (riskLevel !== 'urgent') riskLevel = 'followup';
      reasons.push('Possible Puerperal Sepsis / pelvic infection: maternal fever or foul discharge reported.');
    }

    // Q3: Severe headache, vision, convulsions
    if (answers['Q3'] && answers['Q3'].keyEntered === '1') {
      riskLevel = 'urgent';
      reasons.push('Severe preeclampsia / eclampsia neurological danger sign: splitting headache or vision changes.');
      emergencyPointers.push('Measure blood pressure immediately, check for hyperreflexia, magnesium sulfate protocol.');
    }

    // Q4: Breathing or chest pain
    if (answers['Q4'] && answers['Q4'].keyEntered === '1') {
      riskLevel = 'urgent';
      reasons.push('Acute cardiopulmonary danger sign: chest pain or severe dyspnea.');
      emergencyPointers.push('Immediate emergency evaluation for pulmonary embolism or peripartum cardiomyopathy.');
    }

    // Q5: Baby feeding
    if (answers['Q5'] && answers['Q5'].keyEntered === '2') {
      if (riskLevel !== 'urgent') riskLevel = 'followup';
      reasons.push('Neonatal feeding inadequacy / latch distress reported.');
    }

    // Mood Q6 & Q7
    if (answers['Q6']) {
      const val = CALL_QUESTIONS.find(q => q.id === 'Q6').scoreMap[answers['Q6'].keyEntered] || 0;
      moodScoreSum += val;
    }
    if (answers['Q7']) {
      const val = CALL_QUESTIONS.find(q => q.id === 'Q7').scoreMap[answers['Q7'].keyEntered] || 0;
      moodScoreSum += val;
    }

    // Demo Mood cutoff: Score >= 4 across these 2 items indicates high perinatal distress
    if (moodScoreSum >= 4) {
      if (riskLevel !== 'urgent') riskLevel = 'followup';
      reasons.push(`Elevated perinatal distress score (${moodScoreSum}/6 on demo sub-scale).`);
    }

    // Q8: Self-harm ideation (EPDS Item 10 trigger)
    if (answers['Q8'] && answers['Q8'].keyEntered === '1') {
      riskLevel = 'urgent';
      reasons.push('Active thoughts of self-harm or crisis ideation (Item 10 trigger).');
      emergencyPointers.push('Immediate crisis intervention. Provide Tele-MANAS (14416). Family member to stay with mother.');
    }

    if (reasons.length === 0) {
      reasons.push('All physical danger signs negative; normal mood markers reported.');
    }

    return {
      riskLevel,
      reasons,
      emergencyPointers,
      moodScoreSum
    };
  }

  // Display Result Modal & Propagate to Dashboard
  function evaluateAndShowTriageResults() {
    const analysis = evaluateCallRisk(callState.answers);

    // Modal DOM
    const resultStatusBanner = document.getElementById('resultStatusBanner');
    const resultStatusPill = document.getElementById('resultStatusPill');
    const resultStatusHeadline = document.getElementById('resultStatusHeadline');
    const resultStatusExplanation = document.getElementById('resultStatusExplanation');
    const resultAnswersList = document.getElementById('resultAnswersList');
    const resultAshaSmsPreview = document.getElementById('resultAshaSmsPreview');

    // Reset styles
    resultStatusBanner.className = 'result-badge-banner';

    if (analysis.riskLevel === 'urgent') {
      resultStatusBanner.classList.add('urgent-result');
      resultStatusPill.textContent = 'CRITICAL RED ESCALATION';
      resultStatusHeadline.textContent = 'Immediate Medical Attention Required';
      resultStatusExplanation.textContent = analysis.reasons.join(' ');
      announceA11y('Urgent danger detected. Red escalation protocol active.');
    } else if (analysis.riskLevel === 'followup') {
      resultStatusBanner.classList.add('followup-result');
      resultStatusPill.textContent = 'FOLLOW-UP REQUIRED';
      resultStatusHeadline.textContent = '48-Hour Priority Home Visit Scheduled';
      resultStatusExplanation.textContent = analysis.reasons.join(' ');
      announceA11y('Follow-up triage required. ASHA visit scheduled.');
    } else {
      resultStatusBanner.classList.add('safe-result');
      resultStatusPill.textContent = 'ROUTINE STABLE';
      resultStatusHeadline.textContent = 'Normal Recovery Signs Recorded';
      resultStatusExplanation.textContent = 'Mother and infant are progressing safely. Next protocol call scheduled.';
      announceA11y('Routine recovery recorded.');
    }

    // Recorded Answers list
    resultAnswersList.innerHTML = Object.values(callState.answers).map(ans => `
      <div><strong>${ans.questionId}:</strong> ${ans.title} &rarr; <em>${ans.label}</em></div>
    `).join('');

    // Generate SMS text for ASHA worker
    const ashaSms = generateAshaSms(callState.callerName, callState.maskedPhone, analysis);
    resultAshaSmsPreview.innerHTML = `<strong>DRAFT DISPATCH SMS:</strong><br>${ashaSms.replace(/\n/g, '<br>')}`;

    // Add entry to Live ASHA Dashboard Queue
    const newEntry = {
      id: `PT-${Math.floor(100 + Math.random() * 900)}`,
      name: callState.callerName,
      phone: callState.phoneNumber,
      maskedPhone: callState.maskedPhone,
      village: 'Manalur East, Ward 2',
      deliveryDate: new Date().toISOString().split('T')[0],
      postnatalDay: 1,
      riskLevel: analysis.riskLevel,
      primaryFinding: analysis.reasons[0] || 'Vitals stable',
      moodScores: [1, analysis.moodScoreSum, 1, 0],
      assignedAsha: 'Lakshmi Devi',
      phc: 'Kallakurichi Rural PHC',
      status: analysis.riskLevel === 'urgent' ? 'Escalated (14 min left)' : 'Logged'
    };

    patientQueue.unshift(newEntry);
    renderPatientTable(patientQueue);
    updateKpis();

    openModal('callResultModal');

    // If Urgent, trigger the ASHA pop-up after the result modal or toast
    if (analysis.riskLevel === 'urgent') {
      setTimeout(() => {
        triggerAshaEscalationModal(newEntry.name, analysis.reasons[0]);
      }, 1000);
    }
  }

  function generateAshaSms(name, phone, analysis) {
    if (analysis.riskLevel === 'urgent') {
      return `[ALERT: TN-HEALTH-POSTNATAL]\nPATIENT: ${name} (${phone})\nSTATUS: RED ESCALATION (URGENT)\nDANGER SIGN: ${analysis.reasons[0]}\nACTION: ASHA Lakshmi Devi dispatched. Target SLA: 15 mins. Dial 108 if in shock.`;
    } else if (analysis.riskLevel === 'followup') {
      return `[NOTICE: TN-HEALTH-POSTNATAL]\nPATIENT: ${name} (${phone})\nSTATUS: AMBER FOLLOW-UP\nFINDINGS: ${analysis.reasons[0]}\nACTION: Schedule in-person lactation/fever visit within 48h.`;
    }
    return `[INFO: TN-HEALTH-POSTNATAL]\nPATIENT: ${name} (${phone})\nSTATUS: GREEN STABLE\nCheck-in completed successfully. Routine schedule maintained.`;
  }

  function triggerAshaEscalationModal(patientName, dangerSign) {
    const alertPatientName = document.getElementById('alertPatientName');
    const alertDangerSign = document.getElementById('alertDangerSign');

    if (alertPatientName) alertPatientName.textContent = patientName;
    if (alertDangerSign) alertDangerSign.textContent = dangerSign;

    openModal('ashaEscalationAlertModal');
    showToast(`Urgent alert broadcast to ASHA Lakshmi Devi (+91 94421 ••••82)`, 'urgent');
  }

  // ==========================================
  // 5. ASHA WORKER DASHBOARD & DATA TABLE
  // ==========================================
  const patientTableBody = document.getElementById('patientTableBody');
  const tableFilterChips = document.getElementById('tableFilterChips');
  const patientSearchInput = document.getElementById('patientSearchInput');
  const refreshDashboardBtn = document.getElementById('refreshDashboardBtn');
  const kpiUrgentCount = document.getElementById('kpiUrgentCount');
  const kpiFollowupCount = document.getElementById('kpiFollowupCount');
  const kpiSafeCount = document.getElementById('kpiSafeCount');
  const kpiTotalCalls = document.getElementById('kpiTotalCalls');

  function renderPatientTable(data) {
    if (!patientTableBody) return;

    if (data.length === 0) {
      patientTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 24px; color: var(--color-ink-muted);">
            No patient records match the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    patientTableBody.innerHTML = data.map(item => {
      let badgeClass = 'safe';
      let badgeText = 'Safe';
      if (item.riskLevel === 'urgent') {
        badgeClass = 'urgent';
        badgeText = 'Urgent Escalation';
      } else if (item.riskLevel === 'followup') {
        badgeClass = 'followup';
        badgeText = 'Follow-Up Needed';
      }

      // Generate inline SVG sparkline
      const sparkSvg = generateSparklineSvg(item.moodScores);

      return `
        <tr data-patient-id="${item.id}">
          <td class="patient-cell">
            <strong>${item.name}</strong>
            <span>${item.village} &bull; ${item.maskedPhone}</span>
          </td>
          <td>
            <strong>Day ${item.postnatalDay}</strong>
            <span style="display:block; font-size: 0.76rem; color: var(--color-ink-muted);">Delivered: ${item.deliveryDate}</span>
          </td>
          <td>
            <span class="risk-tag ${badgeClass}">
              <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> ${badgeText}
            </span>
          </td>
          <td style="max-width: 240px; font-size: 0.82rem; color: var(--color-ink-muted);">
            ${item.primaryFinding}
          </td>
          <td>
            ${sparkSvg}
          </td>
          <td>
            <strong>${item.assignedAsha}</strong>
            <span style="display:block; font-size: 0.74rem; color: var(--color-ink-muted);">${item.phc}</span>
          </td>
          <td>
            <div class="action-buttons-cell">
              <button class="action-btn resolve-btn" data-action="resolve" data-id="${item.id}" title="Mark as resolved / home visit completed">
                <i class="fa-solid fa-check"></i> Resolve
              </button>
              <button class="action-btn" data-action="reassign" data-id="${item.id}" title="Reassign ASHA beat">
                <i class="fa-solid fa-user-pen"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function generateSparklineSvg(points) {
    if (!points || points.length === 0) points = [0, 1, 0, 1];
    const width = 80;
    const height = 22;
    const maxVal = Math.max(...points, 3);
    const step = width / (points.length - 1);

    const coords = points.map((p, i) => {
      const x = i * step;
      const y = height - (p / maxVal) * (height - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    return `
      <svg class="sparkline-svg" viewBox="0 0 ${width} ${height}">
        <polyline fill="none" stroke="var(--color-plum)" stroke-width="2" points="${coords}" />
        <circle cx="${points.length > 0 ? (points.length - 1) * step : 0}" cy="${height - (points[points.length-1] / maxVal) * (height - 4) - 2}" r="3" fill="var(--color-rose)" />
      </svg>
    `;
  }

  function updateKpis() {
    const urgentCount = patientQueue.filter(p => p.riskLevel === 'urgent').length;
    const followupCount = patientQueue.filter(p => p.riskLevel === 'followup').length;
    const safeCount = patientQueue.filter(p => p.riskLevel === 'safe').length;

    if (kpiUrgentCount) kpiUrgentCount.textContent = urgentCount;
    if (kpiFollowupCount) kpiFollowupCount.textContent = followupCount;
    if (kpiSafeCount) kpiSafeCount.textContent = safeCount;
    if (kpiTotalCalls) kpiTotalCalls.textContent = patientQueue.length;
  }

  // Filter & Search Handlers
  function applyTableFilters() {
    const activeChip = tableFilterChips ? tableFilterChips.querySelector('.chip.active') : null;
    const filterVal = activeChip ? activeChip.getAttribute('data-filter') : 'all';
    const query = patientSearchInput ? patientSearchInput.value.toLowerCase().trim() : '';

    let filtered = patientQueue;

    if (filterVal !== 'all') {
      filtered = filtered.filter(p => p.riskLevel === filterVal);
    }

    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.village.toLowerCase().includes(query) ||
        p.assignedAsha.toLowerCase().includes(query)
      );
    }

    renderPatientTable(filtered);
  }

  // Table Action Buttons (Resolve / Reassign)
  if (patientTableBody) {
    patientTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      const patient = patientQueue.find(p => p.id === id);

      if (action === 'resolve' && patient) {
        patient.riskLevel = 'safe';
        patient.primaryFinding = 'Home visit completed by ASHA. Danger signs subsided.';
        patient.status = 'Resolved';
        showToast(`Case for ${patient.name} marked as resolved.`, 'safe');
        applyTableFilters();
        updateKpis();
      } else if (action === 'reassign' && patient) {
        const newAsha = patient.assignedAsha === 'Lakshmi Devi' ? 'Mary Stella' : 'Lakshmi Devi';
        patient.assignedAsha = newAsha;
        showToast(`Reassigned ${patient.name} to ASHA ${newAsha}.`, 'info');
        applyTableFilters();
      }
    });
  }

  // ==========================================
  // 6. EPDS 10-ITEM VALIDATED QUIZ ENGINE
  // ==========================================
  const epdsQuestionsContainer = document.getElementById('epdsQuestionsContainer');
  const epdsQuizForm = document.getElementById('epdsQuizForm');
  const epdsResultPanel = document.getElementById('epdsResultPanel');
  const epdsTotalScoreVal = document.getElementById('epdsTotalScoreVal');
  const epdsRiskCategoryTitle = document.getElementById('epdsRiskCategoryTitle');
  const epdsRiskCategoryDescription = document.getElementById('epdsRiskCategoryDescription');
  const epdsCrisisCard = document.getElementById('epdsCrisisCard');

  function renderEpdsQuestions() {
    if (!epdsQuestionsContainer) return;

    epdsQuestionsContainer.innerHTML = EPDS_10_QUESTIONS.map(q => `
      <div class="epds-q-item" data-q-id="${q.id}">
        <p class="epds-q-title">${q.text}</p>
        <div class="epds-options-grid">
          ${q.options.map((opt, idx) => `
            <label class="epds-option-label">
              <input type="radio" name="epds_q${q.id}" value="${opt.score}" ${idx === 0 ? 'checked' : ''} required>
              <span>${opt.label} (Score: ${opt.score})</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function calculateEpdsScore(e) {
    if (e) e.preventDefault();
    let totalScore = 0;
    let item10Score = 0;

    EPDS_10_QUESTIONS.forEach(q => {
      const selected = document.querySelector(`input[name="epds_q${q.id}"]:checked`);
      const val = selected ? parseInt(selected.value, 10) : 0;
      totalScore += val;
      if (q.id === 10) item10Score = val;
    });

    if (epdsTotalScoreVal) epdsTotalScoreVal.textContent = totalScore;
    if (epdsResultPanel) epdsResultPanel.classList.remove('hidden');

    // Interpret Bands based on BMJ 2020 Meta-Analysis
    // Cut-off >= 11: Best balance (Sens 0.81, Spec 0.88)
    // Cut-off >= 13: High specificity
    const band10 = document.getElementById('band10');
    const band11 = document.getElementById('band11');
    const band13 = document.getElementById('band13');

    [band10, band11, band13].forEach(b => { if (b) b.style.outline = 'none'; });

    if (totalScore >= 13) {
      if (band13) band13.style.outline = '2px solid var(--color-urgent)';
      epdsRiskCategoryTitle.textContent = 'High Probability of Moderate-to-Severe Postpartum Depression';
      epdsRiskCategoryTitle.style.color = 'var(--color-urgent)';
      epdsRiskCategoryDescription.textContent = 'A score of 13 or higher falls within the high-specificity threshold identified in the BMJ 2020 individual-participant meta-analysis. Formal clinical assessment by a healthcare professional is strongly recommended.';
    } else if (totalScore >= 11) {
      if (band11) band11.style.outline = '2px solid var(--color-followup)';
      epdsRiskCategoryTitle.textContent = 'Recommended Cut-off Threshold (Possible Perinatal Distress)';
      epdsRiskCategoryTitle.style.color = 'var(--color-followup)';
      epdsRiskCategoryDescription.textContent = 'Scores between 11 and 12 achieve the optimal sensitivity (0.81) and specificity (0.88) balance in literature. We advise speaking with your ASHA worker or doctor for a compassionate evaluation.';
    } else {
      if (band10) band10.style.outline = '2px solid var(--color-safe)';
      epdsRiskCategoryTitle.textContent = 'Sub-Clinical / Normal Adjustment Range';
      epdsRiskCategoryTitle.style.color = 'var(--color-safe)';
      epdsRiskCategoryDescription.textContent = 'Your current score is below the screening cut-off. Mild tiredness is expected; continue healthy rest and supportive nutrition.';
    }

    // Trigger Item 10 crisis banner if non-zero
    if (item10Score > 0) {
      if (epdsCrisisCard) epdsCrisisCard.classList.remove('hidden');
      announceA11y('Item 10 triggered: Compassionate crisis support card displayed.');
    } else {
      if (epdsCrisisCard) epdsCrisisCard.classList.add('hidden');
    }

    epdsResultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================
  // 7. 14-DAY PROTOCOL INTERACTIVE STEPPER
  // ==========================================
  const timelineStepper = document.getElementById('timelineStepper');
  const timelineDisplayCard = document.getElementById('timelineDisplayCard');

  function updateTimelineCard(dayNumber) {
    const data = SURVEILLANCE_SCHEDULE[dayNumber] || SURVEILLANCE_SCHEDULE[1];
    if (!timelineDisplayCard) return;

    timelineDisplayCard.innerHTML = `
      <div class="timeline-card-inner">
        <div class="timeline-badge-row">
          <span class="day-chip"><i class="fa-solid fa-clock"></i> ${data.day.toUpperCase()}</span>
          <span class="priority-chip ${data.prioClass}">${data.prio}</span>
        </div>
        <h3 class="timeline-title">${data.title}</h3>
        <p class="timeline-desc">${data.desc}</p>
        <div class="timeline-action-list">
          ${data.actions.map(act => `<div class="tl-action"><i class="fa-solid fa-check"></i> ${act}</div>`).join('')}
        </div>
      </div>
    `;

    // Highlight button in stepper
    if (timelineStepper) {
      timelineStepper.querySelectorAll('.step-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-day') === String(dayNumber));
      });
    }
  }

  // ==========================================
  // 8. HERO PHONE MOCKUP CALL INTERACTION
  // ==========================================
  const heroAnswerBtn = document.getElementById('heroAnswerBtn');
  const heroDeclineBtn = document.getElementById('heroDeclineBtn');
  const heroPhoneScreen = document.getElementById('heroPhoneScreen');
  const heroActiveCallUI = document.getElementById('heroActiveCallUI');
  const heroCallStatusText = document.getElementById('heroCallStatusText');

  function setupHeroPhone() {
    if (!heroAnswerBtn || !heroActiveCallUI) return;

    heroAnswerBtn.addEventListener('click', () => {
      heroPhoneScreen.classList.add('hidden');
      heroActiveCallUI.classList.remove('hidden');
      playDtmfTone('1', 120);

      speakPrompt('Namaste. This is your postnatal automated health check. Are you feeling any severe pain or heavy bleeding?', 'en');

      setTimeout(() => {
        const transcript = document.getElementById('heroTranscriptBubble');
        if (transcript) {
          transcript.textContent = '"Keypad 1 for YES. Keypad 2 for NO. Listening..."';
        }
      }, 3500);
    });

    if (heroDeclineBtn) {
      heroDeclineBtn.addEventListener('click', () => {
        heroCallStatusText.textContent = 'Call declined. Scheduled retry attempt 1 of 3 in 15 mins.';
        showToast('Missed call protocol initiated: Attempt 1 scheduled.', 'info');
      });
    }
  }

  // ==========================================
  // 9. MODALS, TOASTS & A11Y HELPERS
  // ==========================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const focusable = modal.querySelector('button, input, select');
      if (focusable) focusable.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}-toast`;
    
    let icon = 'fa-info-circle';
    if (type === 'urgent') icon = 'fa-triangle-exclamation';
    if (type === 'safe') icon = 'fa-circle-check';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  function announceA11y(text) {
    const liveRegion = document.getElementById('a11yLiveRegion');
    if (liveRegion) {
      liveRegion.textContent = text;
    }
  }

  function maskPhoneNumber(phone) {
    if (!phone) return '+91 98765 ••••10';
    const clean = phone.replace(/[^\d+]/g, '');
    if (clean.length < 8) return clean;
    const start = clean.slice(0, clean.length - 6);
    const end = clean.slice(-2);
    return `${start} ••••${end}`;
  }

  // Countdown SLA Timer simulation for urgent escalations
  let escalationTimerSec = 15 * 60;
  setInterval(() => {
    const el = document.getElementById('escalationCountdownTimer');
    if (el && escalationTimerSec > 0) {
      escalationTimerSec--;
      const mins = String(Math.floor(escalationTimerSec / 60)).padStart(2, '0');
      const secs = String(escalationTimerSec % 60).padStart(2, '0');
      el.textContent = `${mins}:${secs}`;
    }
  }, 1000);

  // ==========================================
  // 10. EVENT LISTENERS INITIALIZATION
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial UI Inits
    renderPatientTable(patientQueue);
    updateKpis();
    renderEpdsQuestions();
    updateTimelineCard(1);
    setupHeroPhone();

    // 2. Open Welcome Modal on first visit
    const hasSeenWelcome = sessionStorage.getItem('ppd_welcome_seen');
    if (!hasSeenWelcome) {
      openModal('welcomeModal');
      sessionStorage.setItem('ppd_welcome_seen', 'true');
    }

    // 3. Modal Close Triggers
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetModal = btn.getAttribute('data-close-modal');
        closeModal(targetModal);
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay && overlay.id !== 'liveCallModal') {
          overlay.classList.add('hidden');
          document.body.style.overflow = '';
        }
      });
    });

    // 4. Helpline Buttons
    const openHelplineBtn = document.getElementById('openHelplineBtn');
    const fabHelplineBtn = document.getElementById('fabHelplineBtn');
    if (openHelplineBtn) openHelplineBtn.addEventListener('click', () => openModal('helplineModal'));
    if (fabHelplineBtn) fabHelplineBtn.addEventListener('click', () => openModal('helplineModal'));

    const ashaDirectCallSimBtn = document.getElementById('ashaDirectCallSimBtn');
    if (ashaDirectCallSimBtn) {
      ashaDirectCallSimBtn.addEventListener('click', () => {
        closeModal('helplineModal');
        showToast('Connecting directly with ASHA worker Lakshmi Devi...', 'safe');
      });
    }

    // 5. Consent Modal Trigger
    const viewConsentDetailsBtn = document.getElementById('viewConsentDetailsBtn');
    const acceptConsentFromModalBtn = document.getElementById('acceptConsentFromModalBtn');
    const consentCheckbox = document.getElementById('consentCheckbox');

    if (viewConsentDetailsBtn) {
      viewConsentDetailsBtn.addEventListener('click', () => openModal('consentModal'));
    }
    if (acceptConsentFromModalBtn && consentCheckbox) {
      acceptConsentFromModalBtn.addEventListener('click', () => {
        consentCheckbox.checked = true;
        closeModal('consentModal');
        showToast('Maternal surveillance consent verified.', 'safe');
      });
    }

    // 6. Call Initiate Form
    const callInitiateForm = document.getElementById('callInitiateForm');
    const callerNameInput = document.getElementById('callerNameInput');
    const callerPhoneInput = document.getElementById('callerPhoneInput');
    const countryCodeSelect = document.getElementById('countryCodeSelect');
    const callLanguageSelect = document.getElementById('callLanguageSelect');
    const assignedPhcSelect = document.getElementById('assignedPhcSelect');

    if (callInitiateForm) {
      callInitiateForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Spam honeypot check
        const hp = document.getElementById('websiteHoneypot');
        if (hp && hp.value) return;

        if (!consentCheckbox.checked) {
          showToast('Please check the maternal consent confirmation box before calling.', 'urgent');
          return;
        }

        const name = callerNameInput.value.trim() || 'Priya';
        const phone = `${countryCodeSelect.value} ${callerPhoneInput.value.trim()}`;
        const lang = callLanguageSelect.value;
        const phc = assignedPhcSelect.value;

        initiateCallSession(name, phone, lang, phc, null);
      });
    }

    // Dynamic phone mask hint
    if (callerPhoneInput) {
      callerPhoneInput.addEventListener('input', () => {
        const hint = document.getElementById('phoneMaskHint');
        if (hint) hint.textContent = `Masked as: ${maskPhoneNumber(callerPhoneInput.value)}`;
      });
    }

    // 7. 1-Click Scenario Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!consentCheckbox.checked) consentCheckbox.checked = true;
        const scenario = btn.getAttribute('data-scenario');
        const lang = callLanguageSelect ? callLanguageSelect.value : 'en';
        initiateCallSession('Priya', '+91 98765 43210', lang, 'phc-kallakurichi', scenario);
      });
    });

    // 8. Live Call Keypad Listeners
    document.querySelectorAll('.keypad-btn[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        recordKeypadInput(key);
      });
    });

    if (hangupCallModalBtn) hangupCallModalBtn.addEventListener('click', hangupCall);
    if (hangupKeypadBtn) hangupKeypadBtn.addEventListener('click', hangupCall);

    // Keyboard support for on-screen keypad (1-4, 9, Escape)
    window.addEventListener('keydown', (e) => {
      if (!callState.isActive) return;
      if (['1', '2', '3', '4', '9'].includes(e.key)) {
        recordKeypadInput(e.key);
      } else if (e.key === 'Escape') {
        hangupCall();
      }
    });

    // 9. 14-Day Timeline Stepper Buttons
    if (timelineStepper) {
      timelineStepper.addEventListener('click', (e) => {
        const btn = e.target.closest('.step-btn');
        if (btn) {
          const day = btn.getAttribute('data-day');
          updateTimelineCard(day);
        }
      });
    }

    // 10. Dashboard Filter Chips & Search
    if (tableFilterChips) {
      tableFilterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) {
          tableFilterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          applyTableFilters();
        }
      });
    }

    if (patientSearchInput) {
      patientSearchInput.addEventListener('input', applyTableFilters);
    }

    if (refreshDashboardBtn) {
      refreshDashboardBtn.addEventListener('click', () => {
        applyTableFilters();
        showToast('ASHA triage queue updated from telecom telemetry.', 'safe');
      });
    }

    // 11. New Mother Registration Modal
    const addNewRegistrationModalBtn = document.getElementById('addNewRegistrationModalBtn');
    const newMotherForm = document.getElementById('newMotherForm');

    if (addNewRegistrationModalBtn) {
      addNewRegistrationModalBtn.addEventListener('click', () => openModal('registrationModal'));
    }

    if (newMotherForm) {
      newMotherForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const motherName = document.getElementById('regMotherName').value;
        const phone = document.getElementById('regPhone').value;
        const delivDate = document.getElementById('regDeliveryDate').value;
        const phc = document.getElementById('regPhc').value;

        const newPatient = {
          id: `PT-${Math.floor(200 + Math.random() * 800)}`,
          name: motherName,
          phone: `+91 ${phone}`,
          maskedPhone: maskPhoneNumber(phone),
          village: `${phc} Sector`,
          deliveryDate: delivDate,
          postnatalDay: 1,
          riskLevel: 'safe',
          primaryFinding: 'Registered for 14-Day IVR Protocol. First call queued.',
          moodScores: [0, 0, 0, 0],
          assignedAsha: 'Lakshmi Devi',
          phc: phc,
          status: 'Day 1 Queued'
        };

        patientQueue.unshift(newPatient);
        renderPatientTable(patientQueue);
        updateKpis();
        closeModal('registrationModal');
        newMotherForm.reset();
        showToast(`Registered ${motherName} successfully! Protocol initialized.`, 'safe');
      });
    }

    // 12. EPDS Calculator Form
    if (epdsQuizForm) {
      epdsQuizForm.addEventListener('submit', calculateEpdsScore);
    }

    const resetEpdsQuizBtn = document.getElementById('resetEpdsQuizBtn');
    if (resetEpdsQuizBtn) {
      resetEpdsQuizBtn.addEventListener('click', () => {
        renderEpdsQuestions();
        if (epdsResultPanel) epdsResultPanel.classList.add('hidden');
        showToast('EPDS questionnaire reset.', 'info');
      });
    }

    // 13. Family Companion Demo SMS Button
    const sendFamilyDemoSmsBtn = document.getElementById('sendFamilyDemoSmsBtn');
    if (sendFamilyDemoSmsBtn) {
      sendFamilyDemoSmsBtn.addEventListener('click', () => {
        showToast('Sample Daily SMS: "Day 3 reminder: Mother is going through peak hormonal adjustment today. Ensure she gets 4 continuous hours of rest while you hold the baby."', 'safe');
      });
    }

    // 14. Counter Animation for 22% Stat
    const counterAnim = document.querySelector('.counter-anim');
    if (counterAnim) {
      let count = 0;
      const target = parseInt(counterAnim.getAttribute('data-target'), 10) || 22;
      const timer = setInterval(() => {
        count++;
        counterAnim.textContent = count;
        if (count >= target) clearInterval(timer);
      }, 50);
    }
  });

})();

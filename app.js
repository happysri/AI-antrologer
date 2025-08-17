// AI Astrologer (rule-based, on-device)
(function(){
  const form = document.getElementById('astroForm');
  const readingCard = document.getElementById('readingCard');
  const qaCard = document.getElementById('qaCard');
  const readingEl = document.getElementById('reading');
  const resetBtn = document.getElementById('resetBtn');
  const askBtn = document.getElementById('askBtn');
  const qInput = document.getElementById('userQuestion');

  resetBtn.addEventListener('click', () => {
    form.reset();
    readingCard.hidden = true;
    qaCard.hidden = true;
    readingEl.innerHTML = '';
    qInput.value = '';
    document.getElementById('name').focus();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const dob = document.getElementById('dob').value;
    const tob = document.getElementById('tob').value;
    const pob = document.getElementById('pob').value.trim();
    if(!name || !dob || !tob || !pob) return;

    const d = new Date(dob + 'T' + (tob || '00:00'));
    if(isNaN(d.getTime())){
      alert('Please enter a valid date & time.');
      return;
    }

    const {month, day, year, hour} = {
      month: d.getUTCMonth()+1, day: d.getUTCDate(), year: d.getUTCFullYear(), hour: d.getUTCHours()
    };

    // Core calculations
    const sign = zodiac(month, day);
    const lifePath = lifePathNumber(year, month, day);
    const ruling = rulingPlanet[sign];
    const traits = signTraits[sign];
    const lucky = luckyMap[sign];
    const nightBorn = (hour >= 18 || hour <= 5);
    const weekday = d.toLocaleDateString(undefined, { weekday:'long' });

    // Seeded daily message (deterministic by date+name)
    const seed = hashCode(name + dob);
    const daily = pickFrom(seed, dailyMessages);

    // Build reading HTML
    const html = `
      <div class="badged"><span class="badge">${sign}</span></div>
      <div class="kv"><div>Name</div><div>${escapeHtml(name)}</div></div>
      <div class="kv"><div>Born</div><div>${dob} at ${tob} (${weekday})</div></div>
      <div class="kv"><div>Place</div><div>${escapeHtml(pob)}</div></div>
      <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:8px 0">
      <div class="kv"><div>Zodiac Sign</div><div>${sign} — ${traits.summary}</div></div>
      <div class="kv"><div>Ruling Planet</div><div>${ruling}</div></div>
      <div class="kv"><div>Life Path</div><div>${lifePathText(lifePath)}</div></div>
      <div class="kv"><div>Lucky Vibes</div><div>Color: ${lucky.color} · Number: ${lucky.number}</div></div>
      <div class="kv"><div>Born At</div><div>${nightBorn ? 'Night' : 'Day'} — ${nightBorn ? 'introspective, intuitive undertone' : 'expressive, outward-facing undertone'}</div></div>
      <div class="section-title">Today’s Guidance</div>
      <div>${daily}</div>
      <div class="section-title">Focus</div>
      <div>${traits.focus}</div>
      <div class="section-title">Watch-outs</div>
      <div>${traits.watch}</div>
      <p style="color:#9aa4c7;margin-top:8px">Note: This is a lightweight, rule-based reading for learning & entertainment.</p>
    `;

    readingEl.innerHTML = html;
    readingCard.hidden = false;
    qaCard.hidden = false;
  });

  askBtn.addEventListener('click', () => {
    const q = (qInput.value || '').trim();
    if(!q) return;
    const dob = document.getElementById('dob').value;
    const tob = document.getElementById('tob').value;
    const name = document.getElementById('name').value.trim();
    const d = new Date(dob + 'T' + (tob || '00:00'));
    const sign = zodiac(d.getUTCMonth()+1, d.getUTCDate());
    const lp = lifePathNumber(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate());
    const reply = answerQuestion(q, sign, lp, name);
    document.getElementById('answer').textContent = reply;
  });

  // --- Astrology logic ---
  function zodiac(m, d){
    // Western zodiac by month/day
    return (
      (m==1 && d>=20)||(m==2 && d<=18) ? 'Aquarius' :
      (m==2 && d>=19)||(m==3 && d<=20) ? 'Pisces' :
      (m==3 && d>=21)||(m==4 && d<=19) ? 'Aries' :
      (m==4 && d>=20)||(m==5 && d<=20) ? 'Taurus' :
      (m==5 && d>=21)||(m==6 && d<=20) ? 'Gemini' :
      (m==6 && d>=21)||(m==7 && d<=22) ? 'Cancer' :
      (m==7 && d>=23)||(m==8 && d<=22) ? 'Leo' :
      (m==8 && d>=23)||(m==9 && d<=22) ? 'Virgo' :
      (m==9 && d>=23)||(m==10 && d<=22) ? 'Libra' :
      (m==10 && d>=23)||(m==11 && d<=21) ? 'Scorpio' :
      (m==11 && d>=22)||(m==12 && d<=21) ? 'Sagittarius' :
      'Capricorn'
    );
  }

  function lifePathNumber(y, m, d){
    const digits = (''+y+m+d).replace(/\D/g,'');
    let sum = digits.split('').reduce((a,b)=>a+parseInt(b,10),0);
    const master = [11,22,33];
    while(sum > 9 && !master.includes(sum)){
      sum = (''+sum).split('').reduce((a,b)=>a+parseInt(b,10),0);
    }
    return sum;
  }

  function lifePathText(n){
    const map = {
      1:'1 — The Pioneer: independence, leadership, initiative. Tip: Start, don’t wait.',
      2:'2 — The Diplomat: harmony, partnership, patience. Tip: Collaborate.',
      3:'3 — The Creator: communication, art, optimism. Tip: Express yourself.',
      4:'4 — The Builder: discipline, systems, reliability. Tip: Plan, then act.',
      5:'5 — The Explorer: change, travel, versatility. Tip: Embrace variety wisely.',
      6:'6 — The Nurturer: care, community, responsibility. Tip: Create balance.',
      7:'7 — The Seeker: analysis, intuition, depth. Tip: Trust your inner research.',
      8:'8 — The Executive: ambition, finance, power. Tip: Aim high, stay ethical.',
      9:'9 — The Humanitarian: compassion, completion, wisdom. Tip: Give and let go.',
      11:'11 — The Illuminator: vision, inspiration, sensitivity. Tip: Channel your spark.',
      22:'22 — The Master Builder: big-picture pragmatism. Tip: Dream and deliver.',
      33:'33 — The Master Teacher: service through love. Tip: Lead with heart.'
    };
    return map[n] || (n + '');
  }

  const rulingPlanet = {
    Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon',
    Leo:'Sun', Virgo:'Mercury', Libra:'Venus', Scorpio:'Pluto / Mars',
    Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Uranus / Saturn', Pisces:'Neptune / Jupiter'
  };

  const luckyMap = {
    Aries:{color:'Red', number:9},
    Taurus:{color:'Green', number:6},
    Gemini:{color:'Yellow', number:5},
    Cancer:{color:'Silver', number:2},
    Leo:{color:'Gold', number:1},
    Virgo:{color:'Olive', number:5},
    Libra:{color:'Pink', number:6},
    Scorpio:{color:'Maroon', number:9},
    Sagittarius:{color:'Purple', number:3},
    Capricorn:{color:'Black', number:8},
    Aquarius:{color:'Blue', number:4},
    Pisces:{color:'Sea green', number:7},
  };

  const signTraits = {
    Aries:{summary:'bold, fast-moving, action-first.', focus:'Use your drive to kick off a fresh initiative.', watch:'Avoid impatience; pace yourself.'},
    Taurus:{summary:'steady, sensual, loyal.', focus:'Lean into consistency and practical gains.', watch:'Stubbornness—stay open to feedback.'},
    Gemini:{summary:'curious, witty, adaptable.', focus:'Learn, network, and share ideas widely.', watch:'Scattered focus—prioritize.'},
    Cancer:{summary:'intuitive, protective, nurturing.', focus:'Strengthen home, family, and trusted bonds.', watch:'Moodiness—care for your needs too.'},
    Leo:{summary:'warm, expressive, charismatic.', focus:'Showcase your talents and lead with heart.', watch:'Ego flare-ups—share the spotlight.'},
    Virgo:{summary:'precise, helpful, analytical.', focus:'Refine systems; simplify processes.', watch:'Perfectionism—ship the work.'},
    Libra:{summary:'harmonizing, balanced, aesthetic.', focus:'Build win–win partnerships and beauty.', watch:'Indecision—choose a direction.'},
    Scorpio:{summary:'intense, magnetic, transformational.', focus:'Focus deeply; pursue meaningful change.', watch:'Control issues—trust the process.'},
    Sagittarius:{summary:'expansive, optimistic, adventurous.', focus:'Explore, study, and think bigger.', watch:'Overpromising—ground your plans.'},
    Capricorn:{summary:'ambitious, disciplined, strategic.', focus:'Play the long game; structure wins.', watch:'Workaholism—protect rest.'},
    Aquarius:{summary:'original, future-facing, humanitarian.', focus:'Innovate and connect with community.', watch:'Detachment—share feelings, too.'},
    Pisces:{summary:'empathetic, imaginative, healing.', focus:'Create and recharge your inner world.', watch:'Boundaries—keep them clear.'}
  };

  const dailyMessages = [
    'A small, consistent habit outshines a grand, rare effort. Take one step.',
    'A conversation today reveals a path—ask the question you’ve been avoiding.',
    'Tidy a corner of your world; clarity follows order.',
    'Momentum beats motivation—move first, mood follows.',
    'Your intuition is precise—note the first signal you feel.',
    'Fortune favors prepared minds—outline then act.',
    'Kindness compounds—offer help without keeping score.',
    'Say no to reclaim time for your yes.',
    'A surprise change is a hidden upgrade; reframe quickly.',
    'Focus on what you can control; energy returns.'
  ];

  // Q&A (keyword + persona-based synthesis)
  function answerQuestion(q, sign, lp, name){
    const lower = q.toLowerCase();
    const topic = /career|job|work|promotion|startup|business/.test(lower) ? 'career'
               : /love|relationship|marriage|partner|crush|dating/.test(lower) ? 'love'
               : /health|fitness|energy|sleep|stress/.test(lower) ? 'health'
               : /money|finance|wealth|income|salary|debt/.test(lower) ? 'money'
               : /study|exam|college|learning|course/.test(lower) ? 'study'
               : 'general';

    const trait = signTraits[sign];
    const lpHint = lifePathHint(lp, topic);

    const openers = {
      career: 'Career outlook',
      love: 'Matters of the heart',
      health: 'Well‑being check',
      money: 'Financial flow',
      study: 'Learning path',
      general: 'Guidance'
    };

    const suggestion = {
      career: `Leverage your ${trait.summary.split(',')[0]} nature. ${trait.focus}`,
      love: `Bring your authentic self; ${trait.summary.includes('empathetic') ? 'share feelings openly' : 'listen as much as you speak'}.`,
      health: `Balance effort with recovery. ${trait.watch}`,
      money: `Favor steady plans over impulse. ${trait.focus}`,
      study: `Use structure + curiosity in equal measure. ${trait.focus}`,
      general: `${trait.focus}`
    }[topic];

    const closer = 'Remember: astrology offers perspective—your actions write the story.';

    return `${openers[topic]} for ${name} (${sign}, Life Path ${lp}): ${lpHint} ${suggestion} ${closer}`;
  }

  function lifePathHint(lp, topic){
    const base = {
      1:{career:'lead projects', love:'take initiative kindly', health:'train with goals', money:'negotiate firmly', study:'study independently', general:'start the thing'},
      2:{career:'build alliances', love:'prioritize harmony', health:'try mindful movement', money:'budget jointly', study:'form a study pair', general:'seek balance'},
      3:{career:'show your ideas', love:'communicate playfully', health:'express + de-stress', money:'track spending weekly', study:'teach what you learn', general:'create daily'},
      4:{career:'systematize work', love:'schedule quality time', health:'routine > intensity', money:'save automatically', study:'plan and revise', general:'build foundations'},
      5:{career:'embrace variety', love:'keep things fresh', health:'mix workouts', money:'cap impulsive buys', study:'alternate topics', general:'adapt quickly'},
      6:{career:'serve & lead', love:'care without rescuing', health:'prioritize sleep', money:'support family plans', study:'study in groups', general:'nurture ties'},
      7:{career:'research deeply', love:'share inner world', health:'solo recharge', money:'analyze investments', study:'quiet focused blocks', general:'trust intuition + data'},
      8:{career:'aim for scale', love:'balance power gently', health:'train with metrics', money:'think long-term assets', study:'set ambitious goals', general:'own your ambition'},
      9:{career:'meaningful impact', love:'practice compassion', health:'mind–body practices', money:'give + invest wisely', study:'connect dots broadly', general:'complete old chapters'},
      11:{career:'inspire teams', love:'protect sensitivity', health:'ground with breath', money:'invest in vision', study:'follow sparks', general:'share your insights'},
      22:{career:'ship big ideas', love:'be present daily', health:'sustainable habits', money:'long horizon building', study:'project-based learning', general:'think + build'},
      33:{career:'mentor generously', love:'lead with kindness', health:'gentle consistency', money:'support causes smartly', study:'teach others', general:'serve and shine'}
    };
    const key = base[lp] || base[ (lp%9)||9 ];
    return key[topic] ? `Favorable to ${key[topic]}. ` : '';
  }

  // Utils
  function hashCode(str){
    let h = 0;
    for(let i=0;i<str.length;i++){
      h = ((h<<5)-h) + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }
  function pickFrom(seed, arr){
    const idx = seed % arr.length;
    return arr[idx];
  }
  function escapeHtml(s){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();

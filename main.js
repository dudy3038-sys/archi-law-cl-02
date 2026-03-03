// main.js (FULL REPLACE)
// archi-law-cl-03 (1~2단계 고도화)
// - 자동찾기(후보 패널/버튼) 제거 ✅
// - 자치법규만 고도화 ✅ (추천 TOP 표시)
// - 법제처 검색 링크 기반 / 저장은 localStorage

/* =========================
   데이터
========================= */

const SIDO_LIST = [
    "서울특별시","부산광역시","대구광역시","인천광역시","광주광역시","대전광역시","울산광역시","세종특별자치시",
    "경기도","강원특별자치도","충청북도","충청남도","전북특별자치도","전라남도","경상북도","경상남도","제주특별자치도",
  ];
  
  const SIGUNGU_BY_SIDO = {
    서울특별시: [
      "강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구",
      "동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구",
      "용산구","은평구","종로구","중구","중랑구",
    ],
    부산광역시: [
      "강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구",
      "서구","수영구","연제구","영도구","중구","해운대구",
    ],
    대구광역시: ["군위군","남구","달서구","달성군","동구","북구","서구","수성구","중구"],
    인천광역시: ["강화군","계양구","남동구","동구","미추홀구","부평구","서구","연수구","옹진군","중구"],
    광주광역시: ["광산구","남구","동구","북구","서구"],
    대전광역시: ["대덕구","동구","서구","유성구","중구"],
    울산광역시: ["남구","동구","북구","중구","울주군"],
    세종특별자치시: ["세종특별자치시"],
    경기도: [
      "가평군","고양시 덕양구","고양시 일산동구","고양시 일산서구","과천시","광명시","광주시","구리시","군포시","김포시",
      "남양주시","동두천시","부천시","성남시 분당구","성남시 수정구","성남시 중원구","수원시 권선구","수원시 영통구","수원시 장안구","수원시 팔달구",
      "시흥시","안산시 단원구","안산시 상록구","안성시","안양시 동안구","안양시 만안구","양주시","양평군","여주시","연천군",
      "오산시","용인시 기흥구","용인시 수지구","용인시 처인구","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시",
    ],
    강원특별자치도: [
      "강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군",
      "정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군",
    ],
    충청북도: [
      "괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시 상당구",
      "청주시 서원구","청주시 청원구","청주시 흥덕구","충주시",
    ],
    충청남도: [
      "계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시",
      "예산군","천안시 동남구","천안시 서북구","청양군","태안군","홍성군",
    ],
    전북특별자치도: [
      "고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군",
      "장수군","전주시 덕진구","전주시 완산구","정읍시","진안군",
    ],
    전라남도: [
      "강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군",
      "순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군",
      "해남군","화순군",
    ],
    경상북도: [
      "경산시","경주시","고령군","구미시","군위군","김천시","문경시","봉화군","상주시","성주군",
      "안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군",
      "청송군","칠곡군","포항시 남구","포항시 북구",
    ],
    경상남도: [
      "거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군",
      "진주시","창녕군","창원시 마산합포구","창원시 마산회원구","창원시 성산구","창원시 의창구","창원시 진해구",
      "통영시","하동군","함안군","함양군","합천군",
    ],
    제주특별자치도: ["서귀포시","제주시"],
  };
  
  const USES = [
    { code: "", label: "(미선택)" },
    { code: "NEIGHBOR_1", label: "제1종 근린생활시설" },
    { code: "NEIGHBOR_2", label: "제2종 근린생활시설" },
    { code: "CULTURE_ASSEMBLY", label: "문화 및 집회시설" },
    { code: "RELIGION", label: "종교시설" },
    { code: "SALES", label: "판매시설" },
    { code: "TRANSPORT", label: "운수시설" },
    { code: "MEDICAL", label: "의료시설" },
    { code: "EDU_RESEARCH", label: "교육연구시설" },
    { code: "CHILD_ELDER", label: "노유자시설" },
    { code: "TRAINING", label: "수련시설" },
    { code: "SPORTS", label: "운동시설" },
    { code: "OFFICE", label: "업무시설" },
    { code: "FACTORY", label: "공장" },
    { code: "WAREHOUSE", label: "창고시설" },
    { code: "DANGEROUS", label: "위험물 저장 및 처리시설" },
    { code: "AUTO", label: "자동차 관련 시설" },
    { code: "RECYCLE", label: "자원순환 관련 시설" },
    { code: "CORRECTION", label: "교정시설" },
    { code: "MILITARY", label: "국방·군사시설" },
    { code: "BROADCAST", label: "방송통신시설" },
    { code: "POWER", label: "발전시설" },
    { code: "CEMETERY", label: "묘지 관련 시설" },
    { code: "FUNERAL", label: "장례시설" },
    { code: "CAMPING", label: "야영장 시설" },
  ];
  
  const TOPICS = [
    {
      key: "SITE_PLAN",
      label: "대지·배치",
      keywords: ["대지","접도","건축선","대지안의공지","공개공지","이격"],
      upperLaws: ["국토의 계획 및 이용에 관한 법률","건축법","건축법 시행령"],
      ordinKeywords: ["건축","개발행위","지구단위","대지","건축위원회"],
    },
    {
      key: "MASS_HEIGHT",
      label: "규모·높이",
      keywords: ["높이","층수","사선","일조","경관","지구단위"],
      upperLaws: ["건축법","건축법 시행령","국토의 계획 및 이용에 관한 법률"],
      ordinKeywords: ["경관","고도","지구단위","건축물","일조"],
    },
    {
      key: "STRUCTURE_SEISMIC",
      label: "구조·내진",
      keywords: ["구조","내진","구조안전","기초","구조기준"],
      upperLaws: ["건축법","건축법 시행령"],
      ordinKeywords: ["내진","구조","건축물","안전"],
    },
    {
      key: "FIRE_COMPARTMENT",
      label: "방화·내화",
      keywords: ["방화구획","내화","방화문","방화셔터","관통부"],
      upperLaws: ["건축법","건축법 시행령","화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["방화","내화","소방","안전"],
    },
    {
      key: "EVAC_SAFETY",
      label: "피난·안전",
      keywords: ["피난","직통계단","피난계단","출구","피난거리","복도"],
      upperLaws: ["건축법","건축법 시행령","화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["피난","계단","대피","안전"],
    },
    {
      key: "BF_ACCESS",
      label: "장애인·BF",
      keywords: ["장애인","편의시설","무장애","BF","승강기"],
      upperLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률","건축법 시행령"],
      ordinKeywords: ["장애인","편의","무장애","BF"],
    },
    {
      key: "MEP_ELECT",
      label: "설비·전기",
      keywords: ["기계실","전기","환기","위생","설비","설비실"],
      upperLaws: ["건축법","건축법 시행령"],
      ordinKeywords: ["설비","위생","환기"],
    },
    {
      key: "ENERGY_GREEN",
      label: "에너지·친환경",
      keywords: ["에너지절약","단열","열관류율","ZEB","신재생"],
      upperLaws: ["녹색건축물 조성 지원법","에너지이용 합리화법","건축물의 에너지절약설계기준"],
      ordinKeywords: ["에너지","녹색","친환경","신재생"],
    },
    {
      key: "PARKING",
      label: "주차",
      keywords: ["부설주차장","주차대수","장애인주차","기계식","전기차충전"],
      upperLaws: ["주차장법","주차장법 시행령","건축법 시행령"],
      ordinKeywords: ["부설주차장","주차","주차장"],
    },
    {
      key: "FIRE_SERVICE",
      label: "소방",
      keywords: ["소방시설","스프링클러","제연","감지기","비상방송"],
      upperLaws: ["소방시설 설치 및 관리에 관한 법률","화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["소방","화재","안전"],
    },
    {
      key: "REVIEW_PERMIT",
      label: "심의·인허가",
      keywords: ["건축위원회","심의","경관심의","교통영향","재해","인허가"],
      upperLaws: ["건축법","건축법 시행령","국토의 계획 및 이용에 관한 법률"],
      ordinKeywords: ["심의","위원회","경관","교통","재해"],
    },
  ];
  
  /* =========================
     유틸
  ========================= */
  
  const LS_KEY = "archiLawCl03.library.v1";
  
  function $(id) { return document.getElementById(id); }
  function clean(s) { return String(s ?? "").trim(); }
  function uniq(arr) { return [...new Set((arr ?? []).filter(Boolean))]; }
  function nowIso() { return new Date().toISOString(); }
  
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("복사됨");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("복사됨");
    }
  }
  
  let _toastTimer = null;
  function toast(msg) {
    clearTimeout(_toastTimer);
    let el = document.getElementById("__toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "__toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "24px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 12px";
      el.style.border = "1px solid rgba(255,255,255,.15)";
      el.style.borderRadius = "12px";
      el.style.background = "rgba(0,0,0,.78)";
      el.style.color = "rgba(255,255,255,.92)";
      el.style.boxShadow = "0 18px 44px rgba(0,0,0,.55)";
      el.style.zIndex = "9999";
      el.style.fontSize = "13px";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    _toastTimer = setTimeout(() => (el.style.opacity = "0"), 1400);
  }
  
  /* =========================
     법제처 링크 (검색)
  ========================= */
  
  function lawSearchUrl(query) {
    const q = encodeURIComponent(query);
    return `https://www.law.go.kr/LSW/main.html#${q}`;
  }
  
  function buildOrdinanceQuery({ sido, sigungu, kw, useLabel }) {
    const parts = [];
    if (sido) parts.push(sido);
    if (sigungu) parts.push(sigungu);
    if (kw) parts.push(kw);
    if (useLabel) parts.push(useLabel);
    parts.push("조례");
    return parts.join(" ");
  }
  
  function buildUpperLawQuery(lawName, topicLabel) {
    return `${lawName} ${topicLabel}`.trim();
  }
  
  /* =========================
     저장소
  ========================= */
  
  function loadLibrary() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sources: {} };
    try {
      const v = JSON.parse(raw);
      if (!v || typeof v !== "object") return { sources: {} };
      if (!v.sources || typeof v.sources !== "object") v.sources = {};
      return v;
    } catch {
      return { sources: {} };
    }
  }
  
  function saveLibrary(lib) {
    localStorage.setItem(LS_KEY, JSON.stringify(lib));
  }
  
  function makeSourceId({ type, name, jurisdiction }) {
    const j = clean(jurisdiction) || "-";
    return `${type}::${name}::${j}`;
  }
  
  function upsertSource({ type, name, jurisdiction, query, url, topicLabel, useLabel }) {
    const lib = loadLibrary();
    const id = makeSourceId({ type, name, jurisdiction });
  
    const existing = lib.sources[id];
    const nextTopics = uniq([...(existing?.topics ?? []), topicLabel]);
    const nextUses = uniq([...(existing?.uses ?? []), useLabel].filter((x) => x && x !== "(미선택)"));
  
    lib.sources[id] = {
      id,
      type,
      name,
      jurisdiction: jurisdiction || "-",
      query,
      url,
      topics: nextTopics,
      uses: nextUses,
      created_at: existing?.created_at ?? nowIso(),
      updated_at: nowIso(),
    };
  
    saveLibrary(lib);
    return lib.sources[id];
  }
  
  function removeSource(id) {
    const lib = loadLibrary();
    delete lib.sources[id];
    saveLibrary(lib);
  }
  
  /* =========================
     시군구: select 우선(현재 UI 기준)
  ========================= */
  
  function getSigunguValue() {
    const sel = $("selSigungu");
    if (sel) return clean(sel.value);
    const inp = $("inpSigungu"); // 구버전 호환
    if (inp) return clean(inp.value);
    return "";
  }
  
  function resetSigunguUI() {
    const sel = $("selSigungu");
    if (sel) sel.value = "";
    const inp = $("inpSigungu");
    if (inp) inp.value = "";
  }
  
  function setSigunguOptionsForSido(sido) {
    const list = (SIGUNGU_BY_SIDO[sido] ?? []).slice().sort((a, b) => a.localeCompare(b, "ko-KR"));
    const sel = $("selSigungu");
    if (sel) {
      sel.innerHTML =
        `<option value="">(시군구 선택)</option>` +
        list.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("");
    }
  
    // 구버전 datalist 호환
    const dl = $("dlSigungu");
    if (dl) dl.innerHTML = list.map((x) => `<option value="${escapeHtml(x)}"></option>`).join("");
  }
  
  /* =========================
     UI 초기화
  ========================= */
  
  function getUseLabelByCode(code) {
    return USES.find((u) => u.code === code)?.label ?? "(미선택)";
  }
  function getTopicByKey(key) {
    return TOPICS.find((t) => t.key === key) ?? null;
  }
  
  function initSelects() {
    const selSido = $("selSido");
    const selUse = $("selUse");
    const selTopic = $("selTopic");
  
    if (selSido) {
      selSido.innerHTML =
        `<option value="">(시도 선택)</option>` +
        SIDO_LIST.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
    }
    if (selUse) {
      selUse.innerHTML = USES.map((u) => `<option value="${escapeHtml(u.code)}">${escapeHtml(u.label)}</option>`).join("");
    }
    if (selTopic) {
      selTopic.innerHTML =
        `<option value="">(토픽 선택)</option>` +
        TOPICS.map((t) => `<option value="${escapeHtml(t.key)}">${escapeHtml(t.label)}</option>`).join("");
    }
  
    if (selSido) {
      selSido.addEventListener("change", () => {
        const sido = clean(selSido.value);
        resetSigunguUI();
        setSigunguOptionsForSido(sido);
      });
    }
  }
  
  function validateInputs() {
    const sido = clean($("selSido")?.value);
    const sigungu = getSigunguValue();
    const useCode = $("selUse")?.value ?? "";
    const useLabel = getUseLabelByCode(useCode);
    const topicKey = $("selTopic")?.value ?? "";
    const topic = getTopicByKey(topicKey);
  
    if (!sido) return { ok: false, msg: "시도를 선택해줘." };
    if (!sigungu) return { ok: false, msg: "시군구를 선택해줘." };
    if (!topic) return { ok: false, msg: "토픽을 선택해줘." };
  
    return { ok: true, ctx: { sido, sigungu, useLabel, topic } };
  }
  
  function setCtxBar({ sido, sigungu, useLabel, topicLabel }) {
    const bSido = $("bSido");
    const bSigungu = $("bSigungu");
    const bUse = $("bUse");
    const bTopic = $("bTopic");
    if (bSido) bSido.textContent = sido;
    if (bSigungu) bSigungu.textContent = sigungu;
    if (bUse) bUse.textContent = `용도: ${useLabel || "(미선택)"}`;
    if (bTopic) bTopic.textContent = `토픽: ${topicLabel}`;
  }
  
  /* =========================
     렌더링
  ========================= */
  
  function renderItem({ title, subtitle, meta = [], actions = [] }) {
    const el = document.createElement("div");
    el.className = "item";
  
    const metaHtml = meta
      .filter(Boolean)
      .map((m) => `<span class="metaPill ${m.cls ?? ""}">${escapeHtml(m.text)}</span>`)
      .join("");
  
    el.innerHTML = `
      <div class="itemTop">
        <div>
          <div class="itemTitle">${escapeHtml(title)}</div>
          ${subtitle ? `<div class="hint" style="margin-top:6px">${escapeHtml(subtitle)}</div>` : ""}
          <div class="itemMeta">${metaHtml}</div>
        </div>
      </div>
      <div class="itemActions"></div>
    `;
  
    const act = el.querySelector(".itemActions");
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.className = `btn ${a.cls ?? ""}`;
      b.textContent = a.label;
      b.addEventListener("click", a.onClick);
      act.appendChild(b);
    });
  
    return el;
  }
  
  /* =========================
     자치법규 추천(Top) 스코어링
     - 아직 “확정”은 아니고, 실무적으로 가장 유력한 검색어를 상단에 고정
  ========================= */
  function scoreOrdinanceCandidate({ kw, useLabel, topic }) {
    let score = 0;
  
    // 토픽의 ordinKeywords에 포함된 키워드면 가산
    if (topic?.ordinKeywords?.includes(kw)) score += 30;
  
    // 토픽 label과 가까운 키워드면 가산 (간단히 포함 검사)
    if (topic?.label && kw && topic.label.includes(kw)) score += 10;
  
    // 용도 선택 시, 용도 포함 쿼리는 실무적으로 유리한 경우가 많아 가산
    if (useLabel && useLabel !== "(미선택)") score += 8;
  
    // 짧고 일반적인 키워드(건축/대지/안전 등)는 너무 넓게 걸려서 약간 감점
    const tooBroad = ["건축", "안전", "대지", "건축물"];
    if (tooBroad.includes(kw)) score -= 6;
  
    return score;
  }
  
  function renderResultLists(ctx) {
    const { sido, sigungu, useLabel, topic } = ctx;
    setCtxBar({ sido, sigungu, useLabel, topicLabel: topic.label });
  
    const includeAct = $("chkIncludeAct")?.checked ?? true;
    const includeOrdin = $("chkIncludeOrdin")?.checked ?? true;
  
    const upperList = $("upperList");
    const ordinList = $("ordinList");
  
    if (upperList) upperList.innerHTML = "";
    if (ordinList) ordinList.innerHTML = "";
  
    const seen = new Set();
  
    // 상위법
    if (upperList) {
      if (!includeAct) {
        upperList.innerHTML = `<div class="hint">상위법 표시가 꺼져있습니다.</div>`;
      } else {
        topic.upperLaws.forEach((lawName) => {
          const q = buildUpperLawQuery(lawName, topic.label);
          const url = lawSearchUrl(q);
          const id = makeSourceId({ type: "상위법", name: lawName, jurisdiction: "-" });
          const dup = seen.has(id);
          if (!dup) seen.add(id);
  
          upperList.appendChild(
            renderItem({
              title: lawName,
              subtitle: q,
              meta: [
                { text: "상위법", cls: "good" },
                { text: `토픽:${topic.label}` },
                useLabel !== "(미선택)" ? { text: `용도:${useLabel}` } : null,
                dup ? { text: "중복(묶임)", cls: "warn" } : null,
              ],
              actions: [
                { label: "열기", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
                { label: "복사", onClick: () => copyToClipboard(url) },
                {
                  label: "저장",
                  onClick: () => {
                    upsertSource({ type: "상위법", name: lawName, jurisdiction: "-", query: q, url, topicLabel: topic.label, useLabel });
                    toast("저장됨");
                    renderLibrary();
                  },
                },
              ],
            })
          );
        });
      }
    }
  
    // 자치법규 (추천 TOP 상단 고정)
    if (ordinList) {
      if (!includeOrdin) {
        ordinList.innerHTML = `<div class="hint">자치법규 표시가 꺼져있습니다.</div>`;
      } else {
        const kws = uniq(topic.ordinKeywords);
  
        // 후보 생성 + 스코어링
        const candidates = kws.map((kw) => ({
          kw,
          score: scoreOrdinanceCandidate({ kw, useLabel, topic }),
        }))
        .sort((a, b) => b.score - a.score);
  
        const top = candidates.slice(0, 2);
        const rest = candidates.slice(2);
  
        // ✅ TOP 먼저
        top.forEach(({ kw, score }, idx) => {
          const q = buildOrdinanceQuery({ sido, sigungu, kw, useLabel: useLabel !== "(미선택)" ? useLabel : "" });
          const url = lawSearchUrl(q);
          const name = `${kw} 관련 조례/규칙(검색)`;
          const jurisdiction = `${sido} ${sigungu}`;
          const id = makeSourceId({ type: "자치법규", name, jurisdiction });
          const dup = seen.has(id);
          if (!dup) seen.add(id);
  
          ordinList.appendChild(
            renderItem({
              title: name,
              subtitle: q,
              meta: [
                { text: "추천 TOP", cls: "warn" },
                { text: "자치법규", cls: "good" },
                { text: `지자체:${sigungu}` },
                { text: `키워드:${kw}` },
                { text: `점수:${score}` },
                dup ? { text: "중복(묶임)", cls: "warn" } : null,
              ],
              actions: [
                { label: "열기", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
                { label: "복사", onClick: () => copyToClipboard(url) },
                {
                  label: "저장",
                  onClick: () => {
                    upsertSource({ type: "자치법규", name, jurisdiction, query: q, url, topicLabel: topic.label, useLabel });
                    toast("저장됨");
                    renderLibrary();
                  },
                },
              ],
            })
          );
        });
  
        // 구분선(시각적으로만)
        if (rest.length > 0) {
          const sep = document.createElement("div");
          sep.className = "hint";
          sep.style.margin = "6px 2px 2px";
          sep.textContent = "나머지 후보";
          ordinList.appendChild(sep);
        }
  
        // ✅ 나머지
        rest.forEach(({ kw, score }) => {
          const q = buildOrdinanceQuery({ sido, sigungu, kw, useLabel: useLabel !== "(미선택)" ? useLabel : "" });
          const url = lawSearchUrl(q);
          const name = `${kw} 관련 조례/규칙(검색)`;
          const jurisdiction = `${sido} ${sigungu}`;
          const id = makeSourceId({ type: "자치법규", name, jurisdiction });
          const dup = seen.has(id);
          if (!dup) seen.add(id);
  
          ordinList.appendChild(
            renderItem({
              title: name,
              subtitle: q,
              meta: [
                { text: "자치법규", cls: "good" },
                { text: `지자체:${sigungu}` },
                { text: `키워드:${kw}` },
                { text: `점수:${score}` },
                dup ? { text: "중복(묶임)", cls: "warn" } : null,
              ],
              actions: [
                { label: "열기", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
                { label: "복사", onClick: () => copyToClipboard(url) },
                {
                  label: "저장",
                  onClick: () => {
                    upsertSource({ type: "자치법규", name, jurisdiction, query: q, url, topicLabel: topic.label, useLabel });
                    toast("저장됨");
                    renderLibrary();
                  },
                },
              ],
            })
          );
        });
      }
    }
  }
  
  /* =========================
     저장소 렌더링
  ========================= */
  
  function renderLibrary() {
    const lib = loadLibrary();
    const sources = Object.values(lib.sources ?? {});
    const listEl = $("libList");
    const filter = clean($("inpFilter")?.value).toLowerCase();
  
    const filtered = !filter
      ? sources
      : sources.filter((s) => {
          const hay = [s.type, s.name, s.jurisdiction, ...(s.topics ?? []), ...(s.uses ?? []), s.query].join(" ").toLowerCase();
          return hay.includes(filter);
        });
  
    if ($("statSources")) $("statSources").textContent = String(sources.length);
    if ($("statTags")) $("statTags").textContent = String(sources.reduce((acc, s) => acc + (s.topics?.length ?? 0), 0));
  
    if (!listEl) return;
    listEl.innerHTML = "";
  
    filtered
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
      .forEach((s) => {
        const el = document.createElement("div");
        el.className = "libItem";
  
        const tags = uniq([...(s.topics ?? [])]).map((t) => `<span class="metaPill">${escapeHtml(t)}</span>`).join("");
        const uses = uniq([...(s.uses ?? [])]).map((u) => `<span class="metaPill warn">${escapeHtml(u)}</span>`).join("");
  
        el.innerHTML = `
          <div class="top">
            <div>
              <div class="title">${escapeHtml(s.name)}</div>
              <div class="sub">${escapeHtml(s.type)} · ${escapeHtml(s.jurisdiction || "-")}</div>
              <div class="tags">${tags}${uses}</div>
            </div>
            <div style="display:flex; gap:8px; align-items:flex-start; flex-wrap:wrap; justify-content:flex-end;">
              <button class="btn" data-act="open">열기</button>
              <button class="btn ghost" data-act="copy">복사</button>
              <button class="btn danger" data-act="del">삭제</button>
            </div>
          </div>
          <div class="hint" style="margin-top:10px; word-break:break-word;">${escapeHtml(s.query || "")}</div>
        `;
  
        el.querySelector('[data-act="open"]').addEventListener("click", () => window.open(s.url, "_blank", "noopener,noreferrer"));
        el.querySelector('[data-act="copy"]').addEventListener("click", () => copyToClipboard(s.url));
        el.querySelector('[data-act="del"]').addEventListener("click", () => {
          if (!confirm("정말 삭제할까?")) return;
          removeSource(s.id);
          renderLibrary();
          toast("삭제됨");
        });
  
        listEl.appendChild(el);
      });
  
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="hint">저장된 항목이 없습니다. (또는 필터 결과 없음)</div>`;
    }
  }
  
  /* =========================
     이벤트
  ========================= */
  
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  
  function bindEvents() {
    on($("btnBuild"), "click", () => {
      const v = validateInputs();
      if (!v.ok) return toast(v.msg);
      renderResultLists(v.ctx);
    });
  
    on($("btnCopyQuery"), "click", async () => {
      const v = validateInputs();
      if (!v.ok) return toast("먼저 시도/시군구/토픽을 선택해줘.");
      const { sido, sigungu, useLabel, topic } = v.ctx;
      const kw = topic.ordinKeywords?.[0] ?? topic.keywords?.[0] ?? topic.label;
      const q = buildOrdinanceQuery({ sido, sigungu, kw, useLabel: useLabel !== "(미선택)" ? useLabel : "" });
      await copyToClipboard(q);
    });
  
    on($("inpFilter"), "input", () => renderLibrary());
    on($("btnClearFilter"), "click", () => {
      const inp = $("inpFilter");
      if (inp) inp.value = "";
      renderLibrary();
    });
  
    on($("btnReset"), "click", () => {
      if (!confirm("로컬 저장소를 초기화할까? (저장된 소스가 모두 삭제됨)")) return;
      localStorage.removeItem(LS_KEY);
      renderLibrary();
      toast("초기화됨");
    });
  }
  
  /* =========================
     부트
  ========================= */
  
  function boot() {
    initSelects();
    bindEvents();
    renderLibrary();
    toast("준비 완료");
  }
  boot();
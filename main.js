// main.js (FULL REPLACE)
// archi-law-cl-03 MVP (1~2단계): 지자체(필수) + 용도(선택) + 토픽(필수)
// - 법제처(국가법령정보센터) "검색 링크" 기반으로 안정적 연결
// - 소스(법령/조례)는 1회 저장, 토픽은 태그로 다대다 연결
// - 저장은 localStorage

/* =========================
   데이터(초안)
========================= */

// 17개 시도
const SIDO_LIST = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "강원특별자치도",
    "충청북도",
    "충청남도",
    "전북특별자치도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주특별자치도",
  ];
  
  // 시군구 추천(샘플 + 확장 가능). 직접 입력 가능하게 설계.
  const SIGUNGU_SUGGEST = {
    서울특별시: ["종로구", "중구", "용산구", "성동구", "마포구", "강남구", "송파구"],
    부산광역시: ["중구", "서구", "동구", "해운대구", "수영구", "사하구"],
    대구광역시: ["중구", "동구", "서구", "달서구", "수성구"],
    인천광역시: ["중구", "동구", "미추홀구", "연수구", "남동구", "서구"],
    광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
    대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
    울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
    세종특별자치시: ["세종시"],
    경기도: ["수원시", "성남시", "용인시", "고양시", "화성시", "부천시", "안산시"],
    강원특별자치도: ["춘천시", "원주시", "강릉시", "속초시"],
    충청북도: ["청주시", "충주시", "제천시"],
    충청남도: ["천안시", "아산시", "공주시", "보령시"],
    전북특별자치도: ["전주시", "익산시", "군산시", "정읍시"],
    전라남도: ["여수시", "순천시", "목포시", "나주시"],
    경상북도: ["포항시", "경주시", "구미시", "안동시"],
    경상남도: ["창원시", "김해시", "진주시", "거제시"],
    제주특별자치도: ["제주시", "서귀포시"],
  };
  
  // 별표1 용도(대분류) — MVP에선 대분류로만 제공 (선택값은 “검색 보정”에만 사용)
  const USES = [
    { code: "", label: "(미선택)" },
    { code: "SINGLE_HOUSE", label: "단독주택(참고)" },
    { code: "MULTI_HOUSE", label: "공동주택(참고)" },
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
    { code: "ACCOM", label: "숙박시설" },
    { code: "ENTERTAIN", label: "위락시설" },
    { code: "FACTORY", label: "공장" },
    { code: "WAREHOUSE", label: "창고시설" },
    { code: "DANGEROUS", label: "위험물 저장 및 처리시설" },
    { code: "AUTO", label: "자동차 관련 시설" },
    { code: "ANIMAL_PLANT", label: "동물 및 식물 관련 시설" },
    { code: "RECYCLE", label: "자원순환 관련 시설" },
    { code: "CORRECTION", label: "교정시설" },
    { code: "MILITARY", label: "국방·군사시설" },
    { code: "BROADCAST", label: "방송통신시설" },
    { code: "POWER", label: "발전시설" },
    { code: "CEMETERY", label: "묘지 관련 시설" },
    { code: "FUNERAL", label: "장례시설" },
    { code: "CAMPING", label: "야영장 시설" },
  ];
  
  // 공통 코어 토픽(실무형) — 상위법/키워드/자치법규 검색 키워드
  const TOPICS = [
    {
      key: "SITE_PLAN",
      label: "대지·배치",
      keywords: ["대지", "접도", "건축선", "대지안의공지", "공개공지", "이격"],
      upperLaws: ["국토의 계획 및 이용에 관한 법률", "건축법", "건축법 시행령"],
      ordinKeywords: ["건축", "개발행위", "지구단위", "대지", "건축위원회"],
    },
    {
      key: "MASS_HEIGHT",
      label: "규모·높이",
      keywords: ["높이", "층수", "사선", "일조", "경관", "지구단위"],
      upperLaws: ["건축법", "건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
      ordinKeywords: ["경관", "고도", "지구단위", "건축물", "일조"],
    },
    {
      key: "STRUCTURE_SEISMIC",
      label: "구조·내진",
      keywords: ["구조", "내진", "구조안전", "기초", "구조기준"],
      upperLaws: ["건축법", "건축법 시행령"],
      ordinKeywords: ["내진", "구조", "건축물", "안전"],
    },
    {
      key: "FIRE_COMPARTMENT",
      label: "방화·내화",
      keywords: ["방화구획", "내화", "방화문", "방화셔터", "관통부"],
      upperLaws: ["건축법", "건축법 시행령", "화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["방화", "내화", "소방", "안전"],
    },
    {
      key: "EVAC_SAFETY",
      label: "피난·안전",
      keywords: ["피난", "직통계단", "피난계단", "출구", "피난거리", "복도"],
      upperLaws: ["건축법", "건축법 시행령", "화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["피난", "계단", "대피", "안전"],
    },
    {
      key: "BF_ACCESS",
      label: "장애인·BF",
      keywords: ["장애인", "편의시설", "무장애", "BF", "승강기"],
      upperLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률", "건축법 시행령"],
      ordinKeywords: ["장애인", "편의", "무장애", "BF"],
    },
    {
      key: "MEP_ELECT",
      label: "설비·전기",
      keywords: ["기계실", "전기", "환기", "위생", "설비", "설비실"],
      upperLaws: ["건축법", "건축법 시행령"],
      ordinKeywords: ["설비", "위생", "환기"],
    },
    {
      key: "ENERGY_GREEN",
      label: "에너지·친환경",
      keywords: ["에너지절약", "단열", "열관류율", "ZEB", "신재생"],
      upperLaws: ["녹색건축물 조성 지원법", "에너지이용 합리화법", "건축물의 에너지절약설계기준"],
      ordinKeywords: ["에너지", "녹색", "친환경", "신재생"],
    },
    {
      key: "PARKING",
      label: "주차",
      keywords: ["부설주차장", "주차대수", "장애인주차", "기계식", "전기차충전"],
      upperLaws: ["주차장법", "주차장법 시행령", "건축법 시행령"],
      ordinKeywords: ["부설주차장", "주차", "주차장"],
    },
    {
      key: "FIRE_SERVICE",
      label: "소방",
      keywords: ["소방시설", "스프링클러", "제연", "감지기", "비상방송"],
      upperLaws: ["소방시설 설치 및 관리에 관한 법률", "화재의 예방 및 안전관리에 관한 법률"],
      ordinKeywords: ["소방", "화재", "안전"],
    },
    {
      key: "REVIEW_PERMIT",
      label: "심의·인허가",
      keywords: ["건축위원회", "심의", "경관심의", "교통영향", "재해", "인허가"],
      upperLaws: ["건축법", "건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
      ordinKeywords: ["심의", "위원회", "경관", "교통", "재해"],
    },
  ];
  
  /* =========================
     유틸
  ========================= */
  
  const LS_KEY = "archiLawCl03.library.v1";
  
  function $(id) {
    return document.getElementById(id);
  }
  
  function nowIso() {
    return new Date().toISOString();
  }
  
  function clean(s) {
    return String(s ?? "").trim();
  }
  
  function uniq(arr) {
    return [...new Set(arr.filter(Boolean))];
  }
  
  function safeJsonParse(txt) {
    try {
      return { ok: true, value: JSON.parse(txt) };
    } catch (e) {
      return { ok: false, error: e };
    }
  }
  
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("복사됨");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("복사됨");
    }
  }
  
  // 아주 단순 토스트
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
      el.style.background = "rgba(15,23,48,.85)";
      el.style.color = "rgba(233,238,252,.9)";
      el.style.boxShadow = "0 18px 44px rgba(0,0,0,.35)";
      el.style.zIndex = "9999";
      el.style.fontSize = "13px";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    _toastTimer = setTimeout(() => {
      el.style.opacity = "0";
    }, 1400);
  }
  
  /* =========================
     법제처 링크 생성
     - 정확한 내부 경로는 변동 가능성이 있어 MVP에선 "검색 링크"를 사용
     - law.go.kr 은 검색을 query 기반으로 받는 경로가 여러 형태가 있어,
       가장 범용적인 형태로 "검색어를 포함한 페이지"로 이동하도록 구성
  ========================= */
  
  // 범용: law.go.kr 에서 검색어로 찾아보기(안정성 우선)
  // (만약 특정 환경에서 검색 경로가 바뀌면, 여기 함수만 교체하면 됨)
  function lawSearchUrl(query) {
    const q = encodeURIComponent(query);
    // 범용 진입: 메인 + query (환경에 따라 검색창에 자동 입력이 안 될 수 있어도 "검색어" 기반 진입은 유지)
    // 필요 시 다음 단계에서 "정확한 검색 URL"로 강화 가능
    return `https://www.law.go.kr/LSW/main.html#${q}`;
  }
  
  // 자치법규 후보 검색어 만들기(법제처에서 검색해도 결과가 나오도록 현실적인 문장)
  function buildOrdinanceQuery({ sido, sigungu, topicLabel, kw, useLabel }) {
    const parts = [];
    if (sido) parts.push(sido);
    if (sigungu) parts.push(sigungu);
    if (kw) parts.push(kw);
    if (useLabel) parts.push(useLabel);
    parts.push("조례");
    // 토픽 라벨은 검색어에 넣으면 노이즈가 될 수 있어 제외/선택
    return parts.join(" ");
  }
  
  function buildUpperLawQuery(lawName, topicLabel) {
    // 토픽은 검색 정확도 보정용(선택)
    return `${lawName} ${topicLabel}`.trim();
  }
  
  /* =========================
     저장소 모델
  ========================= */
  /**
   * library = {
   *  sources: {
   *    [sourceId]: {
   *      id, type, name, jurisdiction, query, url, topics:[], uses:[], created_at, updated_at
   *    }
   *  }
   * }
   */
  
  function loadLibrary() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sources: {} };
    const p = safeJsonParse(raw);
    if (!p.ok || !p.value || typeof p.value !== "object") return { sources: {} };
    if (!p.value.sources) p.value.sources = {};
    return p.value;
  }
  
  function saveLibrary(lib) {
    localStorage.setItem(LS_KEY, JSON.stringify(lib));
  }
  
  function makeSourceId({ type, name, jurisdiction }) {
    // 중복키: type + name + jurisdiction(없으면 "-")
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
  
  function exportLibrary() {
    return loadLibrary();
  }
  
  function importLibrary(obj) {
    if (!obj || typeof obj !== "object") throw new Error("JSON 형식이 올바르지 않습니다.");
    if (!obj.sources || typeof obj.sources !== "object") throw new Error("sources 필드가 없습니다.");
    saveLibrary(obj);
  }
  
  /* =========================
     UI 초기화
  ========================= */
  
  function initSelects() {
    // 시도
    const selSido = $("selSido");
    selSido.innerHTML = `<option value="">(선택)</option>` + SIDO_LIST.map((s) => `<option value="${s}">${s}</option>`).join("");
  
    // 용도
    const selUse = $("selUse");
    selUse.innerHTML = USES.map((u) => `<option value="${u.code}">${u.label}</option>`).join("");
  
    // 토픽
    const selTopic = $("selTopic");
    selTopic.innerHTML =
      `<option value="">(선택)</option>` +
      TOPICS.map((t) => `<option value="${t.key}">${t.label}</option>`).join("");
  
    // 시도 변경 시 datalist 업데이트
    selSido.addEventListener("change", () => {
      const sido = selSido.value;
      const dl = $("dlSigungu");
      const list = SIGUNGU_SUGGEST[sido] ?? [];
      dl.innerHTML = list.map((x) => `<option value="${x}"></option>`).join("");
    });
  }
  
  function getUseLabelByCode(code) {
    return USES.find((u) => u.code === code)?.label ?? "(미선택)";
  }
  
  function getTopicByKey(key) {
    return TOPICS.find((t) => t.key === key) ?? null;
  }
  
  function validateInputs() {
    const sido = clean($("selSido").value);
    const sigungu = clean($("inpSigungu").value);
    const useCode = $("selUse").value;
    const useLabel = getUseLabelByCode(useCode);
    const topicKey = $("selTopic").value;
    const topic = getTopicByKey(topicKey);
  
    if (!sido) return { ok: false, msg: "시도를 선택해줘." };
    if (!sigungu) return { ok: false, msg: "시군구를 입력해줘." };
    if (!topic) return { ok: false, msg: "토픽을 선택해줘." };
  
    return {
      ok: true,
      ctx: { sido, sigungu, useCode, useLabel, topicKey, topic },
    };
  }
  
  function setCtxBar({ sido, sigungu, useLabel, topicLabel }) {
    $("bSido").textContent = sido;
    $("bSigungu").textContent = sigungu;
    $("bUse").textContent = `용도: ${useLabel || "(미선택)"}`;
    $("bTopic").textContent = `토픽: ${topicLabel}`;
  }
  
  /* =========================
     렌더링
  ========================= */
  
  function renderResultLists(ctx) {
    const { sido, sigungu, useLabel, topic } = ctx;
    setCtxBar({ sido, sigungu, useLabel, topicLabel: topic.label });
  
    const includeAct = $("chkIncludeAct").checked;
    const includeOrdin = $("chkIncludeOrdin").checked;
  
    // 표시 중복 방지: 이번 결과 화면 내부에서도 "같은 소스"는 묶어서 표시
    const seen = new Set();
  
    // 상위법
    const upperList = $("upperList");
    upperList.innerHTML = "";
    if (!includeAct) {
      upperList.innerHTML = `<div class="hint">상위법 표시가 꺼져있습니다.</div>`;
    } else {
      const items = topic.upperLaws.map((lawName) => {
        const q = buildUpperLawQuery(lawName, topic.label);
        const url = lawSearchUrl(q);
        const id = makeSourceId({ type: "상위법", name: lawName, jurisdiction: "-" });
  
        const duplicate = seen.has(id);
        if (!duplicate) seen.add(id);
  
        return renderItem({
          title: lawName,
          meta: [
            { text: "상위법", cls: "good" },
            { text: `토픽:${topic.label}` },
            useLabel && useLabel !== "(미선택)" ? { text: `용도:${useLabel}` } : null,
            duplicate ? { text: "중복(묶임)", cls: "warn" } : null,
          ],
          actions: [
            { label: "열기", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
            { label: "복사", onClick: () => copyToClipboard(url) },
            {
              label: "저장",
              onClick: () => {
                upsertSource({
                  type: "상위법",
                  name: lawName,
                  jurisdiction: "-",
                  query: q,
                  url,
                  topicLabel: topic.label,
                  useLabel,
                });
                toast("저장됨");
                renderLibrary();
              },
            },
          ],
          subtitle: q,
        });
      });
  
      items.forEach((node) => upperList.appendChild(node));
    }
  
    // 자치법규: 토픽의 ordinKeywords로 검색 후보 생성
    const ordinList = $("ordinList");
    ordinList.innerHTML = "";
  
    if (!includeOrdin) {
      ordinList.innerHTML = `<div class="hint">자치법규 표시가 꺼져있습니다.</div>`;
    } else {
      const keywords = uniq([
        ...topic.ordinKeywords,
        // 용도가 선택되면 “용도 라벨”도 키워드로 같이 제안(노이즈가 커질 수 있어 후보에만 사용)
      ]);
  
      const items = keywords.map((kw) => {
        const q = buildOrdinanceQuery({
          sido,
          sigungu,
          topicLabel: topic.label,
          kw,
          useLabel: useLabel !== "(미선택)" ? useLabel : "",
        });
        const url = lawSearchUrl(q);
        const name = `${kw} 관련 조례/규칙(검색)`;
        const jurisdiction = `${sido} ${sigungu}`;
        const id = makeSourceId({ type: "자치법규", name: name, jurisdiction });
  
        const duplicate = seen.has(id);
        if (!duplicate) seen.add(id);
  
        return renderItem({
          title: name,
          meta: [
            { text: "자치법규", cls: "good" },
            { text: `지자체:${sigungu}` },
            { text: `키워드:${kw}` },
            duplicate ? { text: "중복(묶임)", cls: "warn" } : null,
          ],
          actions: [
            { label: "열기", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
            { label: "복사", onClick: () => copyToClipboard(url) },
            {
              label: "저장",
              onClick: () => {
                upsertSource({
                  type: "자치법규",
                  name,
                  jurisdiction,
                  query: q,
                  url,
                  topicLabel: topic.label,
                  useLabel,
                });
                toast("저장됨");
                renderLibrary();
              },
            },
          ],
          subtitle: q,
        });
      });
  
      items.forEach((node) => ordinList.appendChild(node));
    }
  
    // 후보 박스
    renderCandidates(ctx);
  }
  
  function renderCandidates(ctx) {
    const { sido, sigungu, useLabel, topic } = ctx;
    const box = $("candidateBox");
    box.innerHTML = "";
  
    // “자동찾기” 후보: 토픽 키워드 + (선택 용도) 조합으로 조금 더 구체화
    const candidates = [];
  
    // 토픽 키워드 기반 후보
    for (const kw of uniq(topic.keywords)) {
      const q1 = buildOrdinanceQuery({
        sido,
        sigungu,
        topicLabel: topic.label,
        kw,
        useLabel: "",
      });
      candidates.push({ query: q1, kind: "조례" });
    }
  
    // 용도 선택되면 보정 후보
    if (useLabel && useLabel !== "(미선택)") {
      for (const kw of uniq(topic.keywords).slice(0, 4)) {
        const q2 = buildOrdinanceQuery({
          sido,
          sigungu,
          topicLabel: topic.label,
          kw,
          useLabel,
        });
        candidates.push({ query: q2, kind: "조례+용도" });
      }
    }
  
    // 상위법 후보(토픽 + 대표법령)
    for (const lawName of uniq(topic.upperLaws).slice(0, 3)) {
      const q3 = buildUpperLawQuery(lawName, topic.label);
      candidates.push({ query: q3, kind: "상위법" });
    }
  
    candidates.slice(0, 12).forEach((c) => {
      const url = lawSearchUrl(c.query);
      const el = document.createElement("div");
      el.className = "cand";
      el.innerHTML = `
        <div class="q"><b>${c.kind}</b> · ${escapeHtml(c.query)}</div>
        <div class="actions">
          <button class="btn" data-act="open">열기</button>
          <button class="btn ghost" data-act="copy">복사</button>
        </div>
      `;
      el.querySelector('[data-act="open"]').addEventListener("click", () => {
        window.open(url, "_blank", "noopener,noreferrer");
      });
      el.querySelector('[data-act="copy"]').addEventListener("click", () => copyToClipboard(c.query));
      box.appendChild(el);
    });
  }
  
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
  
  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  /* =========================
     저장소 렌더링
  ========================= */
  
  function renderLibrary() {
    const lib = loadLibrary();
    const sources = Object.values(lib.sources ?? {});
  
    const filter = clean($("inpFilter").value).toLowerCase();
  
    const filtered = !filter
      ? sources
      : sources.filter((s) => {
          const hay = [
            s.type,
            s.name,
            s.jurisdiction,
            ...(s.topics ?? []),
            ...(s.uses ?? []),
            s.query,
          ]
            .join(" ")
            .toLowerCase();
          return hay.includes(filter);
        });
  
    // stats
    $("statSources").textContent = String(sources.length);
    $("statTags").textContent = String(
      sources.reduce((acc, s) => acc + (s.topics?.length ?? 0), 0)
    );
  
    const list = $("libList");
    list.innerHTML = "";
  
    // 최신순
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
              <div class="sub">
                ${escapeHtml(s.type)} · ${escapeHtml(s.jurisdiction || "-")}
              </div>
              <div class="tags">
                ${tags}
                ${uses}
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:flex-start; flex-wrap:wrap; justify-content:flex-end;">
              <button class="btn" data-act="open">열기</button>
              <button class="btn ghost" data-act="copy">복사</button>
              <button class="btn danger" data-act="del">삭제</button>
            </div>
          </div>
          <div class="hint" style="margin-top:10px; word-break:break-word;">
            ${escapeHtml(s.query || "")}
          </div>
        `;
  
        el.querySelector('[data-act="open"]').addEventListener("click", () => {
          window.open(s.url, "_blank", "noopener,noreferrer");
        });
        el.querySelector('[data-act="copy"]').addEventListener("click", () => copyToClipboard(s.url));
        el.querySelector('[data-act="del"]').addEventListener("click", () => {
          if (!confirm("정말 삭제할까?")) return;
          removeSource(s.id);
          renderLibrary();
          toast("삭제됨");
        });
  
        list.appendChild(el);
      });
  
    if (filtered.length === 0) {
      list.innerHTML = `<div class="hint">저장된 항목이 없습니다. (또는 필터 결과 없음)</div>`;
    }
  }
  
  /* =========================
     이벤트
  ========================= */
  
  function bindEvents() {
    $("btnBuild").addEventListener("click", () => {
      const v = validateInputs();
      if (!v.ok) return toast(v.msg);
      renderResultLists(v.ctx);
    });
  
    $("btnAutoFind").addEventListener("click", () => {
      const v = validateInputs();
      if (!v.ok) return toast(v.msg);
  
      // “자동찾기”는 후보 검색어를 보여주고, 첫 후보를 새 탭으로 열어주는 UX
      renderCandidates(v.ctx);
  
      const first = $("candidateBox").querySelector(".cand");
      if (first) {
        toast("후보를 생성했어. 필요하면 각 후보의 ‘열기’로 법제처 검색을 진행해줘.");
      }
    });
  
    $("btnCopyQuery").addEventListener("click", async () => {
      const v = validateInputs();
      if (!v.ok) return toast("먼저 시도/시군구/토픽을 선택해줘.");
      const { sido, sigungu, useLabel, topic } = v.ctx;
  
      // 대표 검색어(토픽 + 지자체 + 핵심키워드 1개)
      const kw = topic.keywords?.[0] ?? topic.label;
      const q = buildOrdinanceQuery({
        sido,
        sigungu,
        topicLabel: topic.label,
        kw,
        useLabel: useLabel !== "(미선택)" ? useLabel : "",
      });
      await copyToClipboard(q);
    });
  
    $("inpFilter").addEventListener("input", () => renderLibrary());
    $("btnClearFilter").addEventListener("click", () => {
      $("inpFilter").value = "";
      renderLibrary();
    });
  
    // Export
    $("btnExport").addEventListener("click", () => {
      const dlg = $("dlgExport");
      const ta = $("taExport");
      ta.value = JSON.stringify(exportLibrary(), null, 2);
      dlg.showModal();
    });
    $("btnCopyExport").addEventListener("click", () => copyToClipboard($("taExport").value));
  
    // Import
    $("btnImport").addEventListener("click", () => {
      $("taImport").value = "";
      $("dlgImport").showModal();
    });
    $("btnDoImport").addEventListener("click", (e) => {
      e.preventDefault(); // dialog default close 방지(가져오기 후 닫기)
      const txt = $("taImport").value;
      const p = safeJsonParse(txt);
      if (!p.ok) return toast("JSON 파싱 실패. 형식을 확인해줘.");
      try {
        importLibrary(p.value);
        toast("가져오기 완료");
        $("dlgImport").close();
        renderLibrary();
      } catch (err) {
        toast(err?.message ?? "가져오기 실패");
      }
    });
  
    // Reset
    $("btnReset").addEventListener("click", () => {
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
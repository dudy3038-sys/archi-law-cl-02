// main.js (FULL REPLACE)
// archi-law-cl-03
// ✅ B 레이아웃 고정(토글/모드개념 제거)
// ✅ law.go.kr 종류별(법령/행정규칙/자치법규/별표) 검색 분기
//
// 정리 포인트(깔끔한 코드 정책)
// - 숨김 UI(저장소 필터) 기능/이벤트 완전 제거
// - 구버전 호환(inpSigungu/dlSigungu) 제거: select 기반 확정
//
// 핵심 동작
// 1) 열기/복사: doc_url 우선, 없으면 search_url
// 2) 결과 카드에 "본문URL 저장(연결)" 추가 (prompt로 입력)
// 3) 저장소에서 본문URL 수정/삭제 가능
// 4) doc_url 최소 검증: http(s) + law.go.kr
// 5) 상위법 항목은 kind(LAW/ADM)로 검색 탭 정확히 분기

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

// ✅ 상위법 항목을 (name, kind)로 확장
// - kind: "LAW" | "ADM" | "ORD" | "BYL"
const TOPICS = [
  {
    key: "SITE_PLAN",
    label: "대지·배치",
    keywords: ["대지","접도","건축선","대지안의공지","공개공지","이격"],
    upperLaws: [
      { name:"국토의 계획 및 이용에 관한 법률", kind:"LAW" },
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
    ],
    ordinKeywords: ["건축","개발행위","지구단위","대지","건축위원회"],
  },
  {
    key: "MASS_HEIGHT",
    label: "규모·높이",
    keywords: ["높이","층수","사선","일조","경관","지구단위"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
      { name:"국토의 계획 및 이용에 관한 법률", kind:"LAW" },
    ],
    ordinKeywords: ["경관","고도","지구단위","건축물","일조"],
  },
  {
    key: "STRUCTURE_SEISMIC",
    label: "구조·내진",
    keywords: ["구조","내진","구조안전","기초","구조기준"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
    ],
    ordinKeywords: ["내진","구조","건축물","안전"],
  },
  {
    key: "FIRE_COMPARTMENT",
    label: "방화·내화",
    keywords: ["방화구획","내화","방화문","방화셔터","관통부"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
      { name:"화재의 예방 및 안전관리에 관한 법률", kind:"LAW" },
    ],
    ordinKeywords: ["방화","내화","소방","안전"],
  },
  {
    key: "EVAC_SAFETY",
    label: "피난·안전",
    keywords: ["피난","직통계단","피난계단","출구","피난거리","복도"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
      { name:"화재의 예방 및 안전관리에 관한 법률", kind:"LAW" },
    ],
    ordinKeywords: ["피난","계단","대피","안전"],
  },
  {
    key: "BF_ACCESS",
    label: "장애인·BF",
    keywords: ["장애인","편의시설","무장애","BF","승강기"],
    upperLaws: [
      { name:"장애인·노인·임산부 등의 편의증진 보장에 관한 법률", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
    ],
    ordinKeywords: ["장애인","편의","무장애","BF"],
  },
  {
    key: "MEP_ELECT",
    label: "설비·전기",
    keywords: ["기계실","전기","환기","위생","설비","설비실"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
    ],
    ordinKeywords: ["설비","위생","환기"],
  },
  {
    key: "ENERGY_GREEN",
    label: "에너지·친환경",
    keywords: ["에너지절약","단열","열관류율","ZEB","신재생"],
    upperLaws: [
      { name:"녹색건축물 조성 지원법", kind:"LAW" },
      { name:"에너지이용 합리화법", kind:"LAW" },
      { name:"건축물의 에너지절약설계기준", kind:"ADM" },
    ],
    ordinKeywords: ["에너지","녹색","친환경","신재생"],
  },
  {
    key: "PARKING",
    label: "주차",
    keywords: ["부설주차장","주차대수","장애인주차","기계식","전기차충전"],
    upperLaws: [
      { name:"주차장법", kind:"LAW" },
      { name:"주차장법 시행령", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
    ],
    ordinKeywords: ["부설주차장","주차","주차장"],
  },
  {
    key: "FIRE_SERVICE",
    label: "소방",
    keywords: ["소방시설","스프링클러","제연","감지기","비상방송"],
    upperLaws: [
      { name:"소방시설 설치 및 관리에 관한 법률", kind:"LAW" },
      { name:"화재의 예방 및 안전관리에 관한 법률", kind:"LAW" },
    ],
    ordinKeywords: ["소방","화재","안전"],
  },
  {
    key: "REVIEW_PERMIT",
    label: "심의·인허가",
    keywords: ["건축위원회","심의","경관심의","교통영향","재해","인허가"],
    upperLaws: [
      { name:"건축법", kind:"LAW" },
      { name:"건축법 시행령", kind:"LAW" },
      { name:"국토의 계획 및 이용에 관한 법률", kind:"LAW" },
    ],
    ordinKeywords: ["심의","위원회","경관","교통","재해"],
  },
];

/* =========================
   유틸
========================= */

const LS_KEY = "archiLawCl03.library.v2";

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
   law.go.kr 링크 생성 (종류별)
========================= */

function lawUrl(kind, query) {
  const q = encodeURIComponent(query);
  if (kind === "ADM") return `https://www.law.go.kr/admRulSc.do?query=${q}`;
  if (kind === "BYL") return `https://www.law.go.kr/lsBylSc.do?query=${q}`;
  if (kind === "ORD") return `https://www.law.go.kr/ordinSc.do?menuId=3&subMenuId=27&tabMenuId=139&query=${q}`;
  return `https://www.law.go.kr/lsSc.do?query=${q}`; // LAW (default)
}

function buildUpperLawQuery(lawName) {
  return `${lawName}`.trim();
}

function buildOrdinanceQueryBase({ sido, sigungu }) {
  const parts = [];
  if (sido) parts.push(sido);
  if (sigungu) parts.push(sigungu);
  parts.push("조례");
  return parts.join(" ");
}

/* =========================
   doc_url 검증/선택
========================= */

function isValidDocUrl(url) {
  const u = clean(url);
  if (!u) return false;
  if (!(u.startsWith("http://") || u.startsWith("https://"))) return false;
  if (!u.includes("law.go.kr")) return false;
  return true;
}

function preferUrl(obj) {
  const doc = clean(obj?.doc_url);
  if (doc) return doc;
  const su = clean(obj?.search_url);
  if (su) return su;
  const legacy = clean(obj?.url);
  if (legacy) return legacy;
  return "";
}

/* =========================
   저장소 (v2)
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

function upsertSource({
  type,
  name,
  jurisdiction,
  query,
  search_url,
  doc_url,
  topicLabel,
  useLabel,
  kind,
}) {
  const lib = loadLibrary();
  const id = makeSourceId({ type, name, jurisdiction });

  const existing = lib.sources[id];
  const nextTopics = uniq([...(existing?.topics ?? []), topicLabel]);
  const nextUses = uniq([...(existing?.uses ?? []), useLabel].filter((x) => x && x !== "(미선택)"));

  const legacyUrl = clean(existing?.url);
  const normalizedSearch = clean(search_url) || clean(existing?.search_url) || legacyUrl || "";
  const normalizedDoc = clean(doc_url) || clean(existing?.doc_url) || "";

  lib.sources[id] = {
    id,
    type,
    kind: kind || existing?.kind || "",
    name,
    jurisdiction: jurisdiction || "-",
    query,
    search_url: normalizedSearch,
    doc_url: normalizedDoc,
    url: normalizedSearch, // legacy

    topics: nextTopics,
    uses: nextUses,
    created_at: existing?.created_at ?? nowIso(),
    updated_at: nowIso(),
  };

  saveLibrary(lib);
  return lib.sources[id];
}

function patchSource(id, patch) {
  const lib = loadLibrary();
  if (!lib.sources[id]) return null;
  lib.sources[id] = { ...lib.sources[id], ...patch, updated_at: nowIso() };
  if (patch.search_url) lib.sources[id].url = patch.search_url;
  saveLibrary(lib);
  return lib.sources[id];
}

function removeSource(id) {
  const lib = loadLibrary();
  delete lib.sources[id];
  saveLibrary(lib);
}

/* =========================
   시군구: select 기반 확정
========================= */

function getSigunguValue() {
  const sel = $("selSigungu");
  return sel ? clean(sel.value) : "";
}

function resetSigunguUI() {
  const sel = $("selSigungu");
  if (sel) sel.value = "";
}

function setSigunguOptionsForSido(sido) {
  const list = (SIGUNGU_BY_SIDO[sido] ?? []).slice().sort((a, b) => a.localeCompare(b, "ko-KR"));
  const sel = $("selSigungu");
  if (!sel) return;

  sel.innerHTML =
    `<option value="">(시군구 선택)</option>` +
    list.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("");
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
    selUse.innerHTML = USES
      .map((u) => `<option value="${escapeHtml(u.code)}">${escapeHtml(u.label)}</option>`)
      .join("");
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
    b.className = `btn ${a.cls ?? ""}`.trim();
    b.textContent = a.label;
    b.addEventListener("click", a.onClick);
    act.appendChild(b);
  });

  return el;
}

function promptDocUrl(existing) {
  const cur = clean(existing?.doc_url);
  const msg = [
    "법제처 본문 URL을 붙여넣어 저장해줘.",
    "예) https://www.law.go.kr/법령/...",
    "    https://www.law.go.kr/행정규칙/...",
    "",
    "※ law.go.kr + http(s) 만 허용",
  ].join("\n");

  const input = prompt(msg, cur || "");
  if (input == null) return { ok: false, canceled: true };

  const val = clean(input);
  if (!val) return { ok: true, value: "" };
  if (!isValidDocUrl(val)) return { ok: false, canceled: false, err: "law.go.kr 본문 URL만 저장 가능해." };
  return { ok: true, value: val };
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

  const topicKeywordsPreview = uniq(topic.keywords).slice(0, 4).join(", ");

  // 상위법 (LAW/ADM 분기)
  if (upperList) {
    if (!includeAct) {
      upperList.innerHTML = `<div class="hint">상위법 표시가 꺼져있습니다.</div>`;
    } else {
      const items = (topic.upperLaws ?? [])
        .map((x) => (typeof x === "string" ? { name: x, kind: "LAW" } : { name: x?.name ?? "", kind: x?.kind ?? "LAW" }))
        .filter((x) => clean(x.name));

      items.forEach(({ name: lawName, kind }) => {
        const q = buildUpperLawQuery(lawName);
        const search_url = lawUrl(kind, q);

        const id = makeSourceId({ type: "상위법", name: lawName, jurisdiction: "-" });
        const lib = loadLibrary();
        const existing = lib.sources[id];
        const doc_url = clean(existing?.doc_url);

        const openUrl = preferUrl({ doc_url, search_url });

        upperList.appendChild(
          renderItem({
            title: lawName,
            subtitle: `${kind === "ADM" ? "행정규칙" : "법령"} 검색: ${q}`,
            meta: [
              { text: kind === "ADM" ? "행정규칙" : "상위법", cls: "good" },
              { text: `토픽:${topic.label}` },
              topicKeywordsPreview ? { text: `키워드:${topicKeywordsPreview}` } : null,
              useLabel !== "(미선택)" ? { text: `용도:${useLabel}` } : null,
              doc_url ? { text: "본문연결됨", cls: "warn" } : null,
            ],
            actions: [
              { label: "열기", onClick: () => window.open(openUrl, "_blank", "noopener,noreferrer") },
              { label: "복사", onClick: () => copyToClipboard(openUrl) },
              {
                label: "저장",
                onClick: () => {
                  upsertSource({
                    type: kind === "ADM" ? "행정규칙" : "상위법",
                    kind,
                    name: lawName,
                    jurisdiction: "-",
                    query: q,
                    search_url,
                    doc_url,
                    topicLabel: topic.label,
                    useLabel,
                  });
                  toast("저장됨");
                  renderLibrary();
                },
              },
              {
                label: "본문URL 저장(연결)",
                cls: "ghost",
                onClick: () => {
                  const res = promptDocUrl({ doc_url });
                  if (res.canceled) return;
                  if (!res.ok) return toast(res.err || "URL 저장 실패");

                  const newDoc = res.value;
                  upsertSource({
                    type: kind === "ADM" ? "행정규칙" : "상위법",
                    kind,
                    name: lawName,
                    jurisdiction: "-",
                    query: q,
                    search_url,
                    doc_url: newDoc,
                    topicLabel: topic.label,
                    useLabel,
                  });

                  toast(newDoc ? "본문 URL 연결됨" : "본문 URL 삭제됨");
                  renderLibrary();
                  renderResultLists(ctx);
                },
              },
            ],
          })
        );
      });
    }
  }

  // 자치법규
  if (ordinList) {
    if (!includeOrdin) {
      ordinList.innerHTML = `<div class="hint">자치법규 표시가 꺼져있습니다.</div>`;
    } else {
      const jurisdiction = `${sido} ${sigungu}`;
      const baseQuery = buildOrdinanceQueryBase({ sido, sigungu });
      const search_url = lawUrl("ORD", baseQuery);

      const id = makeSourceId({ type: "자치법규", name: `${jurisdiction} 조례`, jurisdiction });
      const lib = loadLibrary();
      const existing = lib.sources[id];
      const doc_url = clean(existing?.doc_url);
      const openUrl = preferUrl({ doc_url, search_url });

      ordinList.appendChild(
        renderItem({
          title: `${jurisdiction} 조례(자치법규)`,
          subtitle: `자치법규 검색: ${baseQuery}`,
          meta: [
            { text: "자치법규", cls: "good" },
            { text: `지자체:${sigungu}` },
            topicKeywordsPreview ? { text: `키워드:${topicKeywordsPreview}` } : null,
            doc_url ? { text: "본문연결됨", cls: "warn" } : null,
          ],
          actions: [
            { label: "열기", onClick: () => window.open(openUrl, "_blank", "noopener,noreferrer") },
            { label: "복사", onClick: () => copyToClipboard(openUrl) },
            {
              label: "저장",
              onClick: () => {
                upsertSource({
                  type: "자치법규",
                  kind: "ORD",
                  name: `${jurisdiction} 조례`,
                  jurisdiction,
                  query: baseQuery,
                  search_url,
                  doc_url,
                  topicLabel: topic.label,
                  useLabel,
                });
                toast("저장됨");
                renderLibrary();
              },
            },
            {
              label: "본문URL 저장(연결)",
              cls: "ghost",
              onClick: () => {
                const res = promptDocUrl({ doc_url });
                if (res.canceled) return;
                if (!res.ok) return toast(res.err || "URL 저장 실패");

                const newDoc = res.value;
                upsertSource({
                  type: "자치법규",
                  kind: "ORD",
                  name: `${jurisdiction} 조례`,
                  jurisdiction,
                  query: baseQuery,
                  search_url,
                  doc_url: newDoc,
                  topicLabel: topic.label,
                  useLabel,
                });

                toast(newDoc ? "본문 URL 연결됨" : "본문 URL 삭제됨");
                renderLibrary();
                renderResultLists(ctx);
              },
            },
          ],
        })
      );

      const kws = uniq(topic.ordinKeywords);
      if (kws.length) {
        ordinList.appendChild(
          renderItem({
            title: "참고 키워드(본문에서 찾기)",
            subtitle: "※ 법제처 화면에서 ‘조문내용/본문 검색’에 아래 키워드를 사용하면 됩니다.",
            meta: kws.slice(0, 12).map((kw) => ({ text: kw })),
            actions: [{ label: "키워드 복사", onClick: () => copyToClipboard(kws.join(", ")) }],
          })
        );
      }
    }
  }
}

/* =========================
   저장소 렌더링 (필터 기능 제거 버전)
========================= */

function renderLibrary() {
  const lib = loadLibrary();
  const sources = Object.values(lib.sources ?? {});
  const listEl = $("libList");

  if ($("statSources")) $("statSources").textContent = String(sources.length);
  if ($("statTags")) {
    $("statTags").textContent = String(sources.reduce((acc, s) => acc + (s.topics?.length ?? 0), 0));
  }

  if (!listEl) return;
  listEl.innerHTML = "";

  sources
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
    .forEach((s) => {
      const el = document.createElement("div");
      el.className = "libItem";

      const tags = uniq([...(s.topics ?? [])]).map((t) => `<span class="metaPill">${escapeHtml(t)}</span>`).join("");
      const uses = uniq([...(s.uses ?? [])]).map((u) => `<span class="metaPill warn">${escapeHtml(u)}</span>`).join("");

      const hasDoc = !!clean(s.doc_url);
      const openUrl = preferUrl(s);

      el.innerHTML = `
        <div class="top">
          <div>
            <div class="title">${escapeHtml(s.name)}</div>
            <div class="sub">${escapeHtml(s.type)}${s.kind ? `(${escapeHtml(s.kind)})` : ""} · ${escapeHtml(s.jurisdiction || "-")}</div>
            <div class="tags">
              ${hasDoc ? `<span class="metaPill warn">본문연결</span>` : ``}
              ${tags}${uses}
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:flex-start; flex-wrap:wrap; justify-content:flex-end;">
            <button class="btn" data-act="open">열기</button>
            <button class="btn ghost" data-act="copy">복사</button>
            <button class="btn ghost" data-act="editDoc">본문 URL 수정</button>
            <button class="btn ghost" data-act="delDoc">본문 URL 삭제</button>
            <button class="btn danger" data-act="del">삭제</button>
          </div>
        </div>
        <div class="hint" style="margin-top:10px; word-break:break-word;">검색어: ${escapeHtml(s.query || "")}</div>
      `;

      el.querySelector('[data-act="open"]').addEventListener("click", () => {
        if (!openUrl) return toast("열 URL이 없어.");
        window.open(openUrl, "_blank", "noopener,noreferrer");
      });

      el.querySelector('[data-act="copy"]').addEventListener("click", () => {
        if (!openUrl) return toast("복사할 URL이 없어.");
        copyToClipboard(openUrl);
      });

      el.querySelector('[data-act="editDoc"]').addEventListener("click", () => {
        const res = promptDocUrl({ doc_url: s.doc_url });
        if (res.canceled) return;
        if (!res.ok) return toast(res.err || "본문 URL 수정 실패");
        patchSource(s.id, { doc_url: res.value });
        toast(res.value ? "본문 URL 수정됨" : "본문 URL 삭제됨");
        renderLibrary();
      });

      el.querySelector('[data-act="delDoc"]').addEventListener("click", () => {
        if (!clean(s.doc_url)) return toast("본문 URL이 없어요.");
        if (!confirm("본문 URL만 삭제할까? (검색 링크는 유지됨)")) return;
        patchSource(s.id, { doc_url: "" });
        toast("본문 URL 삭제됨");
        renderLibrary();
      });

      el.querySelector('[data-act="del"]').addEventListener("click", () => {
        if (!confirm("정말 삭제할까?")) return;
        removeSource(s.id);
        renderLibrary();
        toast("삭제됨");
      });

      listEl.appendChild(el);
    });

  if (sources.length === 0) {
    listEl.innerHTML = `<div class="hint">저장된 항목이 없습니다.</div>`;
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
    const { sido, sigungu } = v.ctx;
    const q = buildOrdinanceQueryBase({ sido, sigungu });
    await copyToClipboard(q);
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
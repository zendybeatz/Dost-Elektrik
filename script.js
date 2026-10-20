const CONFIG = {
  phoneDisplay: "0 (532) 419 2997",
  phoneTel:     "+905324192997",
  whatsapp:     "905324192997",
  address:      "Dost Elektrik",
  mapQuery:     "Elektrikçi",
};

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

$$('[data-bind="phone-link"]').forEach(a => { a.textContent = a.classList.contains("btn") ? "Ara" : CONFIG.phoneDisplay; a.href = "tel:" + CONFIG.phoneTel; });
$$('[data-bind="address"]').forEach(el => el.textContent = CONFIG.address);
$("#map").src = "https://maps.google.com/maps?q=" + encodeURIComponent(CONFIG.mapQuery) + "&hl=tr&z=16&output=embed";
$("#year").textContent = new Date().getFullYear();

const topbar = $("#topbar");
const onTop = () => topbar.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onTop, { passive:true }); onTop();

if ("IntersectionObserver" in window && !reduced) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold:.12, rootMargin:"0px 0px -6% 0px" });
  $$(".reveal").forEach(el => io.observe(el));
} else { $$(".reveal").forEach(el => el.classList.add("in")); }

$$(".svc").forEach(a => a.addEventListener("click", () => {
  const sel = $("#treatment"), v = a.dataset.reason;
  if (sel && v) sel.value = v;
}));

const state = { quad:"Belirtmek istemiyorum" };

$("#quads").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  state.quad = b.dataset.v;
  $$("#quads .chip").forEach(c => c.setAttribute("aria-pressed", String(c === b)));
});

function setErr(id, msg, field){ $("#err-" + id).textContent = msg; if (field) field.setAttribute("aria-invalid", msg ? "true" : "false"); }

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const name = $("#name"), phone = $("#phone");
  const digits = phone.value.replace(/\D/g, "");
  let ok = true, first = null;
  const fail = (id, msg, field) => { setErr(id, msg, field); ok = false; first = first || field || $("#err-" + id); };

  setErr("name","",name); setErr("phone","",phone);
  if (name.value.trim().length < 3) fail("name", "Adınızı ve soyadınızı yazın.", name);
  if (digits.length < 10) fail("phone", "Geçerli bir telefon numarası yazın.", phone);
  if (!ok) { first.scrollIntoView({ behavior:"smooth", block:"center" }); if (first.focus) first.focus({ preventScroll:true }); return; }

  const data = {
    reason: $("#treatment").value, area: state.quad,
    name: name.value.trim(), phone: phone.value.trim(), note: $("#note").value.trim()
  };

  const lines = [
    "Merhaba, Dost Elektrik'ten servis talep ediyorum.",
    "Ad soyad: " + data.name,
    "Telefon: " + data.phone,
    "İhtiyaç: " + data.reason,
    "Mekan: " + data.area
  ];
  if (data.note) lines.push("Adres/Not: " + data.note);
  $("#wa").href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));

  $("#done-title").textContent = "Talebiniz hazır";
  $("#done-text").textContent = "Aşağıdaki düğmeye tıklayarak talebinizi WhatsApp üzerinden doğrudan Serkan Usta'ya iletebilirsiniz.";
  
  const rows = [["İhtiyaç", data.reason], ["Mekan", data.area], ["Ad soyad", data.name], ["Telefon", data.phone]];
  $("#summary").innerHTML = rows.map(() => "<div><dt></dt><dd></dd></div>").join("");
  $$("#summary div").forEach((row, i) => { $("dt", row).textContent = rows[i][0]; $("dd", row).textContent = rows[i][1]; });

  $("#form").hidden = true; $("#done").hidden = false;
  $("#randevu").scrollIntoView({ behavior:"smooth", block:"start" });
});

$("#again").addEventListener("click", () => {
  $("#form").reset(); state.quad = "Belirtmek istemiyorum";
  $$("#quads .chip").forEach((c, i) => c.setAttribute("aria-pressed", String(i === 0)));
  $("#done").hidden = true; $("#form").hidden = false;
});
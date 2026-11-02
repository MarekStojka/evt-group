const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const slides = [...document.querySelectorAll('.slide')];
let current = 0, timer, paused = reduced.matches;
const pause = document.querySelector('#pause');
function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.classList.toggle('active', i === current); slide.setAttribute('aria-hidden', String(i !== current)); });
  document.querySelector('#slide-count').textContent = `0${current + 1} / 03`;
  document.querySelector('.progress i').style.width = `${(current + 1) / slides.length * 100}%`;
}
function schedule() { clearInterval(timer); if (!paused && !document.hidden) timer = setInterval(() => showSlide(current + 1), 6500); }
function syncPause() { pause.textContent = paused ? '▶' : 'Ⅱ'; pause.setAttribute('aria-label', paused ? 'Spustit carousel' : 'Pozastavit carousel'); schedule(); }
document.querySelector('#prev').addEventListener('click', () => { showSlide(current - 1); schedule(); });
document.querySelector('#next').addEventListener('click', () => { showSlide(current + 1); schedule(); });
pause.addEventListener('click', () => { paused = !paused; syncPause(); });
document.addEventListener('visibilitychange', schedule);
document.querySelector('.hero').addEventListener('mouseenter', () => clearInterval(timer));
document.querySelector('.hero').addEventListener('mouseleave', schedule);
document.querySelector('.hero').addEventListener('focusin', () => clearInterval(timer));
document.querySelector('.hero').addEventListener('focusout', schedule);
reduced.addEventListener('change', () => { paused = reduced.matches; syncPause(); });
showSlide(0); syncPause();
const menu = document.querySelector('.menu'), nav = document.querySelector('nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
if ('IntersectionObserver' in window && !reduced.matches) {
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
const photos = [...document.querySelectorAll('[data-photo]')], dialog = document.querySelector('#lightbox');
let photoIndex = 0;
function displayPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const source = photos[photoIndex].querySelector('img'), target = document.querySelector('#full-photo');
  target.src = source.src; target.alt = source.alt;
  document.querySelector('#photo-caption').textContent = source.alt;
  document.querySelector('#photo-count').textContent = `0${photoIndex + 1} / 03`;
}
photos.forEach((button, i) => button.addEventListener('click', () => { displayPhoto(i); dialog.showModal(); }));
document.querySelector('#close-photo').addEventListener('click', () => dialog.close());
document.querySelector('#photo-prev').addEventListener('click', () => displayPhoto(photoIndex - 1));
document.querySelector('#photo-next').addEventListener('click', () => displayPhoto(photoIndex + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') displayPhoto(photoIndex - 1); if (event.key === 'ArrowRight') displayPhoto(photoIndex + 1); });

// Pás fotografií: automatika pouze ve výřezu, pauza a ruční posun.
const galleryTrack = document.querySelector('.gallery-track');
const galleryCards = [...galleryTrack.querySelectorAll('.ribbon-photo')];
const galleryPause = document.querySelector('#gallery-pause');
let galleryIndex = 0, galleryTimer, galleryPaused = reduced.matches, galleryVisible = false;
function moveGallery(index) {
  galleryIndex = (index + galleryCards.length) % galleryCards.length;
  const first = galleryCards[0].offsetLeft;
  galleryTrack.scrollTo({left: galleryCards[galleryIndex].offsetLeft - first, behavior: reduced.matches ? 'instant' : 'smooth'});
}
function scheduleGallery() {
  clearInterval(galleryTimer);
  if (!galleryPaused && galleryVisible && !document.hidden && !dialog.open && !galleryTrack.matches(':hover') && !document.querySelector('.gallery-ribbon').contains(document.activeElement)) galleryTimer = setInterval(() => moveGallery(galleryIndex + 1), 7000);
}
function syncGalleryPause() {
  galleryPause.textContent = galleryPaused ? '▶' : 'Ⅱ';
  galleryPause.setAttribute('aria-label', galleryPaused ? 'Spustit posun galerie' : 'Pozastavit posun galerie');
  scheduleGallery();
}
galleryTrack.addEventListener('scroll', () => {
  const first = galleryCards[0].offsetLeft;
  galleryIndex = galleryCards.reduce((best, card, i) => Math.abs(card.offsetLeft - first - galleryTrack.scrollLeft) < Math.abs(galleryCards[best].offsetLeft - first - galleryTrack.scrollLeft) ? i : best, 0);
  document.querySelector('#gallery-count').textContent = `0${galleryIndex + 1} / 03`;
}, {passive:true});
document.querySelector('#gallery-prev').addEventListener('click', () => moveGallery(galleryIndex - 1));
document.querySelector('#gallery-next').addEventListener('click', () => moveGallery(galleryIndex + 1));
galleryPause.addEventListener('click', () => {galleryPaused = !galleryPaused; syncGalleryPause();});
galleryTrack.addEventListener('mouseenter', () => clearInterval(galleryTimer));
galleryTrack.addEventListener('mouseleave', scheduleGallery);
document.querySelector('.gallery-ribbon').addEventListener('focusin', () => clearInterval(galleryTimer));
document.querySelector('.gallery-ribbon').addEventListener('focusout', () => requestAnimationFrame(scheduleGallery));
galleryTrack.addEventListener('keydown', event => {if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); moveGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));}});
document.addEventListener('visibilitychange', scheduleGallery);
dialog.addEventListener('close', scheduleGallery);
reduced.addEventListener('change', () => {galleryPaused = reduced.matches; syncGalleryPause();});
if ('IntersectionObserver' in window) new IntersectionObserver(entries => {galleryVisible = entries[0].isIntersecting; scheduleGallery();}, {threshold:.25}).observe(galleryTrack);
syncGalleryPause();

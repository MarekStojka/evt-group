const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const foldPanels = [...document.querySelectorAll('.fold-panel')];
let foldIndex = 0;
function openFold(index) {
  foldIndex = (index + foldPanels.length) % foldPanels.length;
  foldPanels.forEach((panel, i) => {
    const active = i === foldIndex;
    panel.classList.toggle('is-open', active);
    panel.querySelector('.fold-trigger').setAttribute('aria-expanded', String(active));
    panel.querySelector('.fold-content').inert = !active;
  });
  document.querySelector('#fold-count').textContent = `0${foldIndex + 1} / 03`;
}
foldPanels.forEach((panel, i) => {
  panel.querySelector('.fold-trigger').addEventListener('click', () => openFold(i));
  panel.addEventListener('mouseenter', () => {if (matchMedia('(hover: hover) and (pointer: fine)').matches && !document.querySelector('.fold-panels').contains(document.activeElement)) openFold(i);});
  panel.querySelector('.fold-trigger').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    openFold(event.key === 'Home' ? 0 : event.key === 'End' ? foldPanels.length - 1 : foldIndex + (event.key === 'ArrowRight' ? 1 : -1));
    foldPanels[foldIndex].querySelector('.fold-trigger').focus();
  });
});
document.querySelector('#fold-prev').addEventListener('click', () => openFold(foldIndex - 1));
document.querySelector('#fold-next').addEventListener('click', () => openFold(foldIndex + 1));
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
photos.forEach((button, i) => button.addEventListener('click', () => { if (!button.classList.contains('is-active')) { moveGallery(i); return; } displayPhoto(i); dialog.showModal(); }));
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
  galleryCards.forEach((card, i) => {card.classList.toggle('is-active', i === galleryIndex); card.setAttribute('aria-expanded', String(i === galleryIndex));});
  document.querySelector('#gallery-count').textContent = `0${galleryIndex + 1} / 03`;
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

// Survol uniquement à la souris ; sur écran tactile, toucher pour déplier.
galleryCards.forEach((card, i) => card.addEventListener('mouseenter', () => {if (matchMedia('(hover: hover) and (pointer: fine)').matches) moveGallery(i);}));

const appointmentToggle = document.querySelector('#appointment-toggle');
const appointmentCard = document.querySelector('#appointment-card');
const appointmentClose = document.querySelector('#appointment-close');
function closeAppointment(restoreFocus = false) {
  appointmentCard.hidden = true;
  appointmentToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) appointmentToggle.focus();
}
appointmentToggle.addEventListener('click', () => {
  const opening = appointmentCard.hidden;
  appointmentCard.hidden = !opening;
  appointmentToggle.setAttribute('aria-expanded', String(opening));
  if (opening) appointmentClose.focus();
});
appointmentClose.addEventListener('click', () => closeAppointment(true));
document.addEventListener('keydown', event => {if (event.key === 'Escape' && !appointmentCard.hidden) closeAppointment(true);});
document.addEventListener('pointerdown', event => {if (!appointmentCard.hidden && !event.target.closest('.appointment-widget')) closeAppointment();});

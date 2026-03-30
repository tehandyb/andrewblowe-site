function createGallery(containerId, images) {
  const container = document.getElementById(containerId);
  container.className = 'gallery-wrapper';

  const thumbsDiv = document.createElement('div');
  thumbsDiv.className = 'gallery-thumbs';

  const captionEl = document.createElement('p');
  captionEl.className = 'gallery-caption-text';

  function showThumbnails() {
    thumbsDiv.innerHTML = '';
    captionEl.textContent = '';
    images.forEach(image => {
      const img = document.createElement('img');
      img.className = 'gallery-thumb-img';
      img.src = image.src;
      img.alt = image.alt;
      img.addEventListener('click', () => showBig(image));
      thumbsDiv.appendChild(img);
    });
  }

  function showBig(image) {
    thumbsDiv.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'gallery-big-img';
    img.src = image.src;
    img.alt = image.alt;
    img.title = 'Click to go back';
    img.addEventListener('click', showThumbnails);
    thumbsDiv.appendChild(img);
    captionEl.textContent = image.caption;
  }

  container.appendChild(thumbsDiv);
  container.appendChild(captionEl);
  showThumbnails();
}

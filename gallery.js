function createGallery(containerId, images, projectInfo) {
  const section = document.getElementById(containerId);

  const galleryContainer = document.createElement('div');
  galleryContainer.className = 'gallery-container';

  const imagesDiv = document.createElement('div');
  imagesDiv.className = 'gallery-images';

  const captionDiv = document.createElement('div');
  captionDiv.className = 'gallery-caption';
  captionDiv.innerHTML = `
    <h2 class="project-title">${projectInfo.name}</h2>
    <h4 class="project-info">${projectInfo.info}</h4>
    <p class="project-description" id="${containerId}-desc">${projectInfo.description}</p>
  `;

  const descEl = () => document.getElementById(`${containerId}-desc`);

  function showThumbnails() {
    imagesDiv.innerHTML = '';
    images.forEach(image => {
      const thumb = document.createElement('div');
      thumb.className = 'gallery-thumbnail';
      const img = document.createElement('img');
      img.className = 'gallery-img';
      img.src = image.src;
      img.alt = image.alt;
      img.addEventListener('click', () => showBigImage(image));
      thumb.appendChild(img);
      imagesDiv.appendChild(thumb);
    });
    descEl().textContent = projectInfo.description;
  }

  function showBigImage(image) {
    imagesDiv.innerHTML = '';
    const bigDiv = document.createElement('div');
    bigDiv.className = 'gallery-big';
    const img = document.createElement('img');
    img.className = 'gallery-img';
    img.src = image.src;
    img.alt = image.alt;
    img.addEventListener('click', showThumbnails);
    bigDiv.appendChild(img);
    imagesDiv.appendChild(bigDiv);
    descEl().textContent = image.caption;
  }

  showThumbnails();

  galleryContainer.appendChild(imagesDiv);
  galleryContainer.appendChild(captionDiv);
  section.appendChild(galleryContainer);
}

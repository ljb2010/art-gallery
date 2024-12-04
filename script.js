document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeButton = document.querySelector('.close');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.querySelector('.close-modal');
    const uploadForm = document.getElementById('uploadForm');

    // 加载所有图片
    async function loadImages() {
        try {
            const response = await fetch('http://localhost:5000/images');
            const images = await response.json();
            
            gallery.innerHTML = ''; // 清空现有内容
            
            images.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="http://localhost:5000${image.url}" alt="${image.filename}">
                    <div class="overlay">
                        <h3>${image.filename}</h3>
                        <p>${image.category || '未分类'} - ${image.artist || '佚名'}</p>
                        <button class="download-btn" data-filename="${image.filename}">下载作品</button>
                    </div>
                `;
                gallery.appendChild(galleryItem);
            });
            
            // 重新绑定事件
            setupGalleryEvents();
        } catch (error) {
            console.error('加载图片失败:', error);
        }
    }

    // 设置图片相关的事件
    function setupGalleryEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const downloadButtons = document.querySelectorAll('.download-btn');
        
        // 点击画廊项目时显示灯箱
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const title = item.querySelector('h3').textContent;
                const description = item.querySelector('p').textContent;

                lightboxImg.src = img.src;
                lightboxCaption.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
                lightbox.classList.add('active');
            });
        });

        // 下载功能
        downloadButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const img = button.closest('.gallery-item').querySelector('img');
                const filename = button.dataset.filename;
                
                try {
                    const response = await fetch(img.src);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    button.textContent = '下载成功！';
                    button.style.backgroundColor = '#4CAF50';
                    setTimeout(() => {
                        button.textContent = '下载作品';
                        button.style.backgroundColor = '#2196F3';
                    }, 2000);
                } catch (error) {
                    console.error('下载失败:', error);
                    button.textContent = '下载失败';
                    button.style.backgroundColor = '#f44336';
                    setTimeout(() => {
                        button.textContent = '下载作品';
                        button.style.backgroundColor = '#2196F3';
                    }, 2000);
                }
            });
        });
    }

    // 上传功能
    uploadBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        uploadModal.classList.remove('active');
    });

    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.classList.remove('active');
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const imageFile = document.getElementById('imageFile').files[0];
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const artist = document.getElementById('artist').value;
        
        formData.append('image', imageFile);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('artist', artist);
        
        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('上传成功！');
                uploadModal.classList.remove('active');
                uploadForm.reset();
                loadImages(); // 重新加载图片列表
            } else {
                alert(`上传失败: ${result.error}`);
            }
        } catch (error) {
            console.error('上传失败:', error);
            alert('上传失败，请稍后重试');
        }
    });

    // 关闭灯箱
    closeButton.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // 点击灯箱背景时关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // 分类过滤功能
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 更新活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // 获取选中的分类
            const category = link.textContent.trim();
            
            // 过滤画廊项目
            const galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                const itemCategory = item.querySelector('p').textContent.split(' - ')[0].trim();
                
                if (category === '全部作品') {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else if (category === '油画' && (itemCategory === '油画' || itemCategory === '抽象油画')) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else if (category === itemCategory) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 初始加载图片
    loadImages();
});

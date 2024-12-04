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
        const images = [
            {
                url: './images/artwork1.jpg',
                filename: '山水画作品1',
                category: '水墨',
                artist: '张三'
            },
            {
                url: './images/artwork2.jpg',
                filename: '风景油画',
                category: '油画',
                artist: '李四'
            }
            // 可以添加更多图片
        ];
        
        gallery.innerHTML = ''; // 清空现有内容
        
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.filename}">
                <div class="overlay">
                    <h3>${image.filename}</h3>
                    <p>${image.category || '未分类'} - ${image.artist || '佚名'}</p>
                </div>
            `;
            gallery.appendChild(galleryItem);
        });
        
        // 重新绑定事件
        setupGalleryEvents();
    }

    // 设置图片相关的事件
    function setupGalleryEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
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
    }

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

    // 修改上传功能为静态展示
    uploadBtn.addEventListener('click', () => {
        alert('GitHub Pages为静态网站，暂不支持上传功能。请直接修改代码添加新作品。');
    });

    // 初始加载图片
    loadImages();
});

// ===== Hamburger Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== Initialize AOS (Scroll Animations) =====
AOS.init({
    duration: 1000,
    once: false,
    mirror: true,
    offset: 100,
});

// ===== Initialize GLightbox =====
const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    autoplayVideos: true,
    descriptionPosition: 'bottom'
});

// ===== Gallery Filter with Smooth Animation =====
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        galleryItems.forEach((item, index) => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                item.classList.remove('hidden');
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 50 * index);
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
                item.style.opacity = '0';
            }
        });
    });
});

// ===== Smooth Scroll Active Link =====
window.addEventListener('scroll', () => {
    let current = '';
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 300) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.color = '';
        link.style.borderBottom = '';
        
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = '#d4af37';
            link.style.borderBottom = '3px solid #d4af37';
        }
    });

});

// ===== Counter Animation =====
function animateCounters() {
    const stats = document.querySelectorAll('.stat-card h3');
    
    stats.forEach(stat => {
        const target = stat.innerText;
        let count = 0;
        
        const increment = setInterval(() => {
            count++;
            if (target.includes('+')) {
                stat.innerText = count * 100 + '+';
                if (count >= 10) clearInterval(increment);
            } else if (target.includes('★')) {
                stat.innerText = (count / 2).toFixed(1) + '★';
                if (count >= 10) clearInterval(increment);
            }
        }, 50);
    });
}



// ===== Intersection Observer for Stats =====
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ===== Image Lazy Loading =====
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    }
});

// ===== Parallax Effect on Scroll =====
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-bg');
    if (hero) {
        const scrollPosition = window.pageYOffset;
        hero.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
    }
});

console.log('✨ ياقوت ستور - موقع احترافي وفاخر وملون ✨');




document.addEventListener('DOMContentLoaded', () => {
	// Counter animation for stats
	const countStats = () => {
		const statNumbers = document.querySelectorAll('.stat-number');
		const options = {
			threshold: 0.5
		};
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
					const target = parseInt(entry.target.dataset.target);
					const hasDecimal = entry.target.dataset.decimal === '1';
					const duration = 1000; // 1 second
					const startTime = Date.now();
					const start = 0;

					const animate = () => {
						const elapsed = Date.now() - startTime;
						const progress = Math.min(elapsed / duration, 1);
						const value = Math.floor(progress * (target - start) + start);

						if (hasDecimal) {
							entry.target.textContent = (value / 10).toFixed(1);
						} else {
							entry.target.textContent = value.toLocaleString();
						}

						if (progress < 1) {
							requestAnimationFrame(animate);
						} else {
							entry.target.classList.add('counted');
						}
					};
					animate();
				}
			});
		}, options);
		statNumbers.forEach(num => observer.observe(num));
	};
	countStats();

	const galleryGrid = document.getElementById('gallery-grid');

	// Smooth scroll for anchor links
	document.querySelectorAll('a[href^="#"]').forEach(link => {
		link.addEventListener('click', e => {
			const target = document.querySelector(link.getAttribute('href'));
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: 'smooth' });
			}
		});
	});

	// Only load gallery if gallery-grid exists
	if (galleryGrid) {
		fetch('images.json')
			.then(r => r.json())
			.then(list => {
				// Populate gallery grid — أول 3 صور ظاهرة، الباقي مخفي حتى "عرض المزيد"
				list.forEach((p, i) => {
					const gimg = document.createElement('img');
					gimg.src = p.image;
					gimg.alt = p.title || '';
					gimg.loading = i < 3 ? 'eager' : 'lazy';
					gimg.dataset.index = i;
					gimg.className = 'reveal' + (i >= 3 ? ' gallery-item-hidden' : '');
					galleryGrid.appendChild(gimg);
				});

				// زر عرض المزيد (يظهر فقط إذا كان هناك أكثر من 3 صور)
				if (list.length > 3) {
					const showMoreBtn = document.createElement('button');
					showMoreBtn.type = 'button';
					showMoreBtn.className = 'btn btn-primary gallery-show-more';
					showMoreBtn.textContent = 'عرض المزيد';
					showMoreBtn.setAttribute('aria-expanded', 'false');
					galleryGrid.parentElement.appendChild(showMoreBtn);
					showMoreBtn.addEventListener('click', () => {
						const expanded = galleryGrid.classList.toggle('expanded');
						showMoreBtn.setAttribute('aria-expanded', expanded);
						showMoreBtn.textContent = expanded ? 'عرض أقل' : 'عرض المزيد';
					});
				}

				// Lightbox handlers
				const lightbox = document.getElementById('lightbox');
				const lbImg = document.getElementById('lb-img');
				const lbCaption = document.getElementById('lb-caption');
				const lbClose = document.getElementById('lb-close');
				const lbPrev = document.getElementById('lb-prev');
				const lbNext = document.getElementById('lb-next');
				const lbCurrent = document.getElementById('lb-current');
				const lbTotal = document.getElementById('lb-total');

				let currentIndex = 0;
				let imageList = [];

				// Initialize lightbox
				if (lightbox && lbImg && lbCaption && lbClose) {
					imageList = list;
					lbTotal.textContent = list.length;

					// Function to show image in lightbox
					const showImage = (index) => {
						if (index < 0) index = list.length - 1;
						if (index >= list.length) index = 0;

						currentIndex = index;
						const item = list[index];

						// Add fade effect
						lbImg.style.opacity = '0';
						setTimeout(() => {
							lbImg.src = item.image;
							lbImg.alt = item.title || '';
							lbCaption.textContent = item.title || '';
							lbCurrent.textContent = index + 1;
							lbImg.style.opacity = '1';
						}, 150);
					};

					// Function to open lightbox
					const openLightbox = (index) => {
						currentIndex = index;
						showImage(index);
						lightbox.setAttribute('aria-hidden', 'false');
						document.body.style.overflow = 'hidden'; // Prevent background scroll
						lbClose.focus();
					};

					// Function to close lightbox
					const closeLightbox = () => {
						lightbox.setAttribute('aria-hidden', 'true');
						document.body.style.overflow = ''; // Restore scroll
						lbImg.src = '';
					};

					// Click on gallery image
					galleryGrid.addEventListener('click', e => {
						const t = e.target.closest('img');
						if (!t) return;
						const idx = Number(t.dataset.index);
						openLightbox(idx);
					});

					// Close button
					lbClose.addEventListener('click', (e) => {
						e.stopPropagation();
						closeLightbox();
					});

					// Previous button
					if (lbPrev) {
						lbPrev.addEventListener('click', (e) => {
							e.stopPropagation();
							showImage(currentIndex - 1);
						});
					}

					// Next button
					if (lbNext) {
						lbNext.addEventListener('click', (e) => {
							e.stopPropagation();
							showImage(currentIndex + 1);
						});
					}

					// Close when clicking on background
					lightbox.addEventListener('click', e => {
						if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
							closeLightbox();
						}
					});

					// Keyboard navigation
					document.addEventListener('keydown', e => {
						if (lightbox.getAttribute('aria-hidden') === 'false') {
							if (e.key === 'Escape') {
								closeLightbox();
							} else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
								e.preventDefault();
								if (e.key === 'ArrowRight') {
									showImage(currentIndex + 1);
								} else {
									showImage(currentIndex - 1);
								}
							}
						}
					});

					// Swipe support for mobile
					let touchStartX = 0;
					let touchEndX = 0;
					const minSwipeDistance = 50;

					lightbox.addEventListener('touchstart', e => {
						touchStartX = e.changedTouches[0].screenX;
					}, { passive: true });

					lightbox.addEventListener('touchend', e => {
						touchEndX = e.changedTouches[0].screenX;
						handleSwipe();
					}, { passive: true });

					const handleSwipe = () => {
						const swipeDistance = touchStartX - touchEndX;

						if (Math.abs(swipeDistance) > minSwipeDistance) {
							if (swipeDistance > 0) {
								// Swipe left - next image
								showImage(currentIndex + 1);
							} else {
								// Swipe right - previous image
								showImage(currentIndex - 1);
							}
						}
					};
				}

				// Reveal animations with IntersectionObserver
				const reveals = document.querySelectorAll('.reveal');
				const obs = new IntersectionObserver((entries, o) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							entry.target.classList.add('visible');
							o.unobserve(entry.target);
						}
					});
				}, { threshold: 0.12 });
				reveals.forEach((r, i) => {
					r.style.transitionDelay = `${Math.min(i * 30, 300)}ms`;
					obs.observe(r);
				});
			})
			.catch(err => {
				console.error('Failed to load images.json:', err);
				if (galleryGrid) {
					const p = document.createElement('p');
					p.textContent = 'تعذر تحميل الصور.';
					p.style.textAlign = 'center';
					p.style.padding = '20px';
					galleryGrid.parentElement.appendChild(p);
				}
			});
	}

	// FAQ Accordion
	const faqItems = document.querySelectorAll('.faq-item');
	faqItems.forEach(item => {
		const question = item.querySelector('.faq-question');
		if (question) {
			question.addEventListener('click', () => {
				const isActive = item.classList.contains('active');
				// Close all other items
				faqItems.forEach(i => i.classList.remove('active'));
				// Toggle current item
				if (!isActive) item.classList.add('active');
			});
		}
	});

	// Close FAQ when clicking outside
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.faq-item')) {
			faqItems.forEach(item => item.classList.remove('active'));
		}
	});


	// Sticky nav behavior - show when hero section scrolls out of view
	const stickyNav = document.getElementById('sticky-nav');
	const heroHeader = document.querySelector('.hero-header');
	if (stickyNav && heroHeader) {
		const toggleSticky = () => {
			const heroRect = heroHeader.getBoundingClientRect();
			if (heroRect.bottom < 0) {
				stickyNav.classList.add('visible');
			} else {
				stickyNav.classList.remove('visible');
			}
		};
		window.addEventListener('scroll', toggleSticky, { passive: true });
	}

	// Back-to-top button: ثابت على اليمين، يظهر بعد التمرير قليلاً
	const backBtn = document.getElementById('back-to-top');
	if (backBtn) {
		const toggleBtn = () => {
			if (window.scrollY > 200) {
				backBtn.classList.remove('hidden');
			} else {
				backBtn.classList.add('hidden');
			}
		};
		backBtn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			backBtn.blur();
		});
		window.addEventListener('scroll', toggleBtn, { passive: true });
		toggleBtn(); // Initial state
	}

	// Add keyboard navigation for buttons
	document.querySelectorAll('.btn, [role=\"button\"]').forEach(btn => {
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				btn.click();
			}
		});
	});

	// Performance optimization: Lazy load images in gallery
	if (galleryGrid && 'IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					if (img.dataset.src) {
						img.src = img.dataset.src;
						img.removeAttribute('data-src');
					}
					obs.unobserve(img);
				}
			});
		});
		document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
	}

	// Contact Form Handler
	const contactForm = document.getElementById('contact-form');
	if (contactForm) {
		contactForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const formData = new FormData(contactForm);
			const data = Object.fromEntries(formData);

			// Show success message
			const submitBtn = contactForm.querySelector('button[type="submit"]');
			const originalText = submitBtn.textContent;
			submitBtn.textContent = 'جاري الإرسال...';
			submitBtn.disabled = true;

			// Simulate form submission (replace with actual API call)
			setTimeout(() => {
				submitBtn.textContent = 'تم الإرسال بنجاح! ✓';
				submitBtn.style.background = '#25d366';
				contactForm.reset();

				setTimeout(() => {
					submitBtn.textContent = originalText;
					submitBtn.style.background = '';
					submitBtn.disabled = false;
				}, 3000);
			}, 1500);
		});
	}

	// Smooth scroll for navigation links
	document.querySelectorAll('.sticky-nav-menu a, .nav-link').forEach(link => {
		link.addEventListener('click', (e) => {
			const href = link.getAttribute('href');
			if (href.startsWith('#')) {
				e.preventDefault();
				const target = document.querySelector(href);
				if (target) {
					const offset = 80;
					const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
					window.scrollTo({
						top: targetPosition,
						behavior: 'smooth'
					});
				}
			}
		});
	});

	// Add year to footer
	const yearElement = document.getElementById('year');
	if (yearElement) {
		yearElement.textContent = new Date().getFullYear();
	}
});


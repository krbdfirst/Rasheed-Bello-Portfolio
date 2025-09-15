// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const closeBtn = document.querySelector('.close-btn');

hamburger.addEventListener('click', () => {
  mobileMenu.style.display = 'flex';
});
closeBtn.addEventListener('click', () => {
  mobileMenu.style.display = 'none';
});

// Sections and navigation
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const nextLabel = document.getElementById('next-label');
const nextBtn = document.querySelector('.next-section a');

// Order of sections
const sectionOrder = ['home', 'about', 'projects', 'experience', 'contact'];

// IntersectionObserver to detect current section
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const current = entry.target.id;

      // Update nav link active state
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });

      // Update next section button
      let idx = sectionOrder.indexOf(current);
      if (idx >= 0 && idx < sectionOrder.length - 1) {
        const next = sectionOrder[idx + 1];
        nextLabel.textContent = next.charAt(0).toUpperCase() + next.slice(1);
        nextBtn.setAttribute('href', `#${next}`);
      } else {
        // Loop back to Home
        nextLabel.textContent = 'Home';
        nextBtn.setAttribute('href', '#home');
      }
    }
  });
}, {
  threshold: 0.6 // section must be 60% visible
});

// Observe each section
sections.forEach(sec => observer.observe(sec));

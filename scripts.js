// Tab Navigation System
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.main-nav a[role="tab"]');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(targetId) {
        // Remove active class from all tabs and content
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });

        // Show target content
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            
            // Update active tab
            const activeTab = document.querySelector(`a[href="#${targetId}"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }
            
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Add click event listeners to tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            showTab(targetId);
        });
    });

    // Make showTab function globally available
    window.showTab = showTab;
});

// VA Compensation Calculator
function calculateCompensation() {
    const rating = parseInt(document.getElementById('disability-rating').value);
    const spouse = document.getElementById('spouse').value;
    const childrenUnder18 = parseInt(document.getElementById('children-under-18').value) || 0;
    const childrenOver18 = parseInt(document.getElementById('children-over-18').value) || 0;
    const dependentParents = parseInt(document.getElementById('dependent-parents').value) || 0;
    const smcK = parseInt(document.getElementById('smc-k').value) || 0;

    if (!rating) {
        alert('Please select a disability rating');
        return;
    }

    // 2025 VA Compensation Rates
    const baseRates = {
        10: { alone: 175.51 },
        20: { alone: 346.95 },
        30: { alone: 537.42, spouse: 601.42, child: 42.00, parent: 51.00, spouseAA: 63.00 },
        40: { alone: 774.16, spouse: 859.16, child: 57.00, parent: 68.00, spouseAA: 85.00 },
        50: { alone: 1102.04, spouse: 1208.04, child: 71.00, parent: 85.00, spouseAA: 106.00 },
        60: { alone: 1395.93, spouse: 1523.93, child: 85.00, parent: 102.00, spouseAA: 128.00 },
        70: { alone: 1759.19, spouse: 1908.19, child: 99.00, parent: 120.00, spouseAA: 149.00 },
        80: { alone: 2044.89, spouse: 2214.89, child: 114.00, parent: 137.00, spouseAA: 170.00 },
        90: { alone: 2297.96, spouse: 2489.96, child: 128.00, parent: 154.00, spouseAA: 192.00 },
        100: { alone: 3831.30, spouse: 4044.91, child: 213.61, parent: 171.44, spouseAA: 369.77 }
    };

    let totalCompensation = baseRates[rating].alone;
    let breakdown = [`Base disability compensation (${rating}%): $${baseRates[rating].alone.toFixed(2)}`];

    // Add spouse compensation
    if (spouse === 'yes' && rating >= 30) {
        const spouseAmount = baseRates[rating].spouse - baseRates[rating].alone;
        totalCompensation += spouseAmount;
        breakdown.push(`Spouse: $${spouseAmount.toFixed(2)}`);
    } else if (spouse === 'aa' && rating >= 30) {
        const spouseAmount = baseRates[rating].spouse - baseRates[rating].alone;
        const aaAmount = baseRates[rating].spouseAA;
        totalCompensation += spouseAmount + aaAmount;
        breakdown.push(`Spouse: $${spouseAmount.toFixed(2)}`);
        breakdown.push(`Spouse Aid & Attendance: $${aaAmount.toFixed(2)}`);
    }

    // Add children compensation
    if (rating >= 30) {
        const childAmount = baseRates[rating].child;
        
        if (childrenUnder18 > 0) {
            const under18Amount = childAmount * childrenUnder18;
            totalCompensation += under18Amount;
            breakdown.push(`Children under 18 (${childrenUnder18}): $${under18Amount.toFixed(2)}`);
        }
        
        if (childrenOver18 > 0) {
            const over18Amount = (rating === 100 ? 342.85 : childAmount * 3.3) * childrenOver18;
            totalCompensation += over18Amount;
            breakdown.push(`Children over 18 in school (${childrenOver18}): $${over18Amount.toFixed(2)}`);
        }
    }

    // Add dependent parents
    if (dependentParents > 0 && rating >= 30) {
        const parentAmount = baseRates[rating].parent * dependentParents;
        totalCompensation += parentAmount;
        breakdown.push(`Dependent parents (${dependentParents}): $${parentAmount.toFixed(2)}`);
    }

    // Add SMC-K
    if (smcK > 0) {
        const smcKAmount = 136.06 * smcK;
        totalCompensation += smcKAmount;
        breakdown.push(`SMC-K awards (${smcK}): $${smcKAmount.toFixed(2)}`);
    }

    // Display results
    const resultDiv = document.getElementById('calculation-result');
    const annualAmount = totalCompensation * 12;
    
    resultDiv.innerHTML = `
        <h4>Monthly Compensation Estimate</h4>
        <div style="font-size: 1.5rem; margin: 1rem 0;">
            <strong>$${totalCompensation.toFixed(2)} per month</strong>
        </div>
        <div style="font-size: 1.2rem; margin-bottom: 1rem;">
            <strong>$${annualAmount.toFixed(2)} per year</strong>
        </div>
        <div style="font-size: 0.9rem; text-align: left;">
            <strong>Breakdown:</strong><br>
            ${breakdown.join('<br>')}
        </div>
        <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.8;">
            *Rates based on 2025 VA compensation schedule. Consult with a qualified representative for official calculations.
        </div>
    `;
    resultDiv.classList.add('show');
    resultDiv.style.display = 'block';
}

// VA Math Calculator
function calculateVAMath() {
    const input = document.getElementById('individual-ratings').value;
    const bilateral = document.getElementById('bilateral').checked;
    
    if (!input.trim()) {
        alert('Please enter disability ratings');
        return;
    }

    // Parse ratings
    const ratings = input.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r) && r >= 0 && r <= 100);
    
    if (ratings.length === 0) {
        alert('Please enter valid disability ratings (0-100)');
        return;
    }

    // Sort ratings in descending order
    ratings.sort((a, b) => b - a);
    
    let steps = [];
    let combinedRating = 0;
    let remainingEfficiency = 100;

    // Calculate step by step
    ratings.forEach((rating, index) => {
        if (index === 0) {
            combinedRating = rating;
            remainingEfficiency = 100 - rating;
            steps.push(`Step ${index + 1}: ${rating}% = ${rating}% combined`);
        } else {
            const additionalDisability = (rating / 100) * remainingEfficiency;
            combinedRating += additionalDisability;
            remainingEfficiency -= additionalDisability;
            steps.push(`Step ${index + 1}: ${rating}% of remaining ${(remainingEfficiency + additionalDisability).toFixed(1)}% = ${additionalDisability.toFixed(1)}% additional`);
            steps.push(`Running total: ${combinedRating.toFixed(1)}%`);
        }
    });

    // Apply bilateral factor if checked
    if (bilateral && ratings.length >= 2) {
        const bilateralBonus = combinedRating * 0.10;
        combinedRating += bilateralBonus;
        steps.push(`Bilateral factor: +${bilateralBonus.toFixed(1)}% (10% of combined rating)`);
    }

    // Round to nearest 10%
    const roundedRating = Math.round(combinedRating / 10) * 10;
    
    // Display results
    const resultDiv = document.getElementById('va-math-result');
    resultDiv.innerHTML = `
        <h4>VA Math Calculation Results</h4>
        <div style="font-size: 1.5rem; margin: 1rem 0;">
            <strong>${roundedRating}% Combined Rating</strong>
        </div>
        <div style="font-size: 1rem; margin-bottom: 1rem;">
            (Exact calculation: ${combinedRating.toFixed(1)}%)
        </div>
        <div style="font-size: 0.9rem; text-align: left;">
            <strong>Step-by-step calculation:</strong><br>
            Individual ratings: ${ratings.join('%, ')}%<br><br>
            ${steps.join('<br>')}
        </div>
        <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.8;">
            *VA rounds to the nearest 10%. Use the Compensation Calculator for exact monthly amounts.
        </div>
    `;
    resultDiv.classList.add('show');
    resultDiv.style.display = 'block';
}

// Smooth scrolling for internal links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('This is a demo. Contact functionality would be implemented with backend services.');
        });
    });
});

// Button handling for AI assistant and other features
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.onclick && button.textContent.includes('Notify Me When Ready')) {
            button.addEventListener('click', function() {
                alert('Thank you for your interest! AI assistant features will be available soon.');
            });
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// Enhanced accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 1001;
    `;
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main id to main element
    const main = document.querySelector('main');
    if (main) {
        main.id = 'main';
    }
});

// Performance optimization - lazy load heavy content
document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observe cards for scroll animations
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});


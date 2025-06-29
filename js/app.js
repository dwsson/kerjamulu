const API_BASE_URL = 'https://bustling-foggy-erigeron.glitch.me/api'; // Set to your live Glitch backend URL

// Resume Builder functionality
function startResumeBuilder() {
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
}

function startResumeReview() {
    document.getElementById('review').scrollIntoView({ behavior: 'smooth' });
}

// Template selection
document.addEventListener('DOMContentLoaded', function() {
    const templateCards = document.querySelectorAll('.template-card');
    const colorDots = document.querySelectorAll('.color-dot');
    
    let selectedTemplate = '';
    let selectedColor = '';
    
    templateCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            templateCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked card
            this.classList.add('active');
            selectedTemplate = this.dataset.template;
            
            // Show resume form
            showResumeForm(selectedTemplate);
        });
    });
    
    colorDots.forEach(dot => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            // Remove active class from all color dots in the same card
            const parentCard = this.closest('.template-card');
            parentCard.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            // Add active class to clicked dot
            this.classList.add('active');
            selectedColor = this.dataset.color;
        });
    });
});

function showResumeForm(template) {
    const formHTML = `
    <div class="resume-form-modal" id="resumeFormModal">
        <div class="modal-content">
            <span class="close-modal" onclick="closeResumeForm()">&times;</span>
            <h2>Build Your Resume</h2>
            <form id="resumeForm">
                <div class="form-section">
                    <h3>Personal Information</h3>
                    <div class="form-grid">
                        <input type="text" name="fullName" placeholder="Full Name" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="tel" name="phone" placeholder="Phone" required>
                        <input type="text" name="location" placeholder="City, State">
                        <input type="url" name="linkedin" placeholder="LinkedIn URL">
                        <input type="url" name="website" placeholder="Portfolio Website">
                    </div>
                </div>
                
                <div class="form-section">
                    <h3>Professional Summary</h3>
                    <textarea name="summary" placeholder="Brief professional summary..." rows="4"></textarea>
                </div>
                
                <div class="form-section">
                    <h3>Work Experience</h3>
                    <div id="experienceContainer">
                        <div class="experience-item">
                            <input type="text" name="jobTitle[]" placeholder="Job Title" required>
                            <input type="text" name="company[]" placeholder="Company Name" required>
                            <input type="text" name="duration[]" placeholder="Duration (e.g., Jan 2020 - Present)">
                            <textarea name="responsibilities[]" placeholder="Key responsibilities and achievements..." rows="3"></textarea>
                        </div>
                    </div>
                    <button type="button" onclick="addExperience()">+ Add Experience</button>
                </div>
                
                <div class="form-section">
                    <h3>Education</h3>
                    <div id="educationContainer">
                        <div class="education-item">
                            <input type="text" name="degree[]" placeholder="Degree" required>
                            <input type="text" name="school[]" placeholder="School/University" required>
                            <input type="text" name="graduationYear[]" placeholder="Graduation Year">
                        </div>
                    </div>
                    <button type="button" onclick="addEducation()">+ Add Education</button>
                </div>
                
                <div class="form-section">
                    <h3>Skills</h3>
                    <textarea name="skills" placeholder="Enter skills separated by commas..." rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="closeResumeForm()">Cancel</button>
                    <button type="submit">Generate Resume</button>
                </div>
            </form>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // Add form submission handler
    document.getElementById('resumeForm').addEventListener('submit', handleResumeSubmit);
}

function closeResumeForm() {
    const modal = document.getElementById('resumeFormModal');
    if (modal) {
        modal.remove();
    }
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const newItem = document.createElement('div');
    newItem.className = 'experience-item';
    newItem.innerHTML = `
        <input type="text" name="jobTitle[]" placeholder="Job Title" required>
        <input type="text" name="company[]" placeholder="Company Name" required>
        <input type="text" name="duration[]" placeholder="Duration">
        <textarea name="responsibilities[]" placeholder="Key responsibilities and achievements..." rows="3"></textarea>
        <button type="button" onclick="removeExperience(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const newItem = document.createElement('div');
    newItem.className = 'education-item';
    newItem.innerHTML = `
        <input type="text" name="degree[]" placeholder="Degree" required>
        <input type="text" name="school[]" placeholder="School/University" required>
        <input type="text" name="graduationYear[]" placeholder="Graduation Year">
        <button type="button" onclick="removeEducation(this)">Remove</button>
    `;
    container.appendChild(newItem);
}

function removeExperience(button) {
    button.parentElement.remove();
}

function removeEducation(button) {
    button.parentElement.remove();
}

async function handleResumeSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const resumeData = {
        personalInfo: {
            name: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            linkedin: formData.get('linkedin'),
            website: formData.get('website')
        },
        summary: formData.get('summary'),
        experience: [],
        education: [],
        skills: formData.get('skills').split(',').map(skill => skill.trim()),
        template: document.querySelector('.template-card.active').dataset.template,
        color: document.querySelector('.color-dot.active')?.dataset.color || 'blue'
    };
    
    // Process experience data
    const jobTitles = formData.getAll('jobTitle[]');
    const companies = formData.getAll('company[]');
    const durations = formData.getAll('duration[]');
    const responsibilities = formData.getAll('responsibilities[]');
    
    for (let i = 0; i < jobTitles.length; i++) {
        resumeData.experience.push({
            jobTitle: jobTitles[i],
            company: companies[i],
            duration: durations[i],
            responsibilities: responsibilities[i].split('\n').filter(Boolean) // Split by newline for bullet points
        });
    }

    // Process education data
    const degrees = formData.getAll('degree[]');
    const schools = formData.getAll('school[]');
    const graduationYears = formData.getAll('graduationYear[]');

    for (let i = 0; i < degrees.length; i++) {
        resumeData.education.push({
            degree: degrees[i],
            school: schools[i],
            graduationYear: graduationYears[i]
        });
    }
    
    showLoading(); // Show loading spinner

    try {
        const response = await fetch(`${API_BASE_URL}/build-resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resumeData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resume build successful:', result);
        
        // Optionally, display success message or generated resume preview
        alert('Resume generated successfully! Check console for details.');
        closeResumeForm(); // Close the form after submission

    } catch (error) {
        console.error('Error building resume:', error);
        alert('Failed to generate resume. Please try again.');
    } finally {
        hideLoading(); // Hide loading spinner
    }
}

// Resume Review functionality (assuming this is managed separately or integrated here)
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const resumeFile = document.getElementById('resumeFile');
    const btnUpload = document.querySelector('.btn-upload');

    if (dropZone && resumeFile && btnUpload) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false); // For preventing outside the zone
        });

        // Highlight drop zone when item is dragged over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);
        resumeFile.addEventListener('change', handleFileSelect, false);
    }
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    this.classList.add('drag-over');
}

function unhighlight() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

async function handleFiles(files) {
    if (files.length === 0) {
        return;
    }
    const file = files[0];
    
    showLoading(); // Show loading spinner

    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await fetch(`${API_BASE_URL}/review-resume`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resume review successful:', result);
        displayReviewFeedback(result.feedback); // Function to display feedback

    } catch (error) {
        console.error('Error reviewing resume:', error);
        alert('Failed to review resume. Please try again.');
    } finally {
        hideLoading(); // Hide loading spinner
    }
}

function displayReviewFeedback(feedback) {
    // You'll need to create HTML elements to display this feedback.
    // For now, we'll just log it and show an alert.
    console.log('Feedback:', feedback);
    let feedbackMessage = `
        Overall Score: ${feedback.overallScore}/100
        Strengths: ${feedback.strengths.join(', ')}
        Improvements:
    `;
    feedback.improvements.forEach(imp => {
        feedbackMessage += `\n - Issue: ${imp.issue}\n   Suggestion: ${imp.suggestion}`;
    });
    feedbackMessage += `\nATS Compatibility: ${feedback.atsCompatibility.score} - ${feedback.atsCompatibility.explanation}`;
    feedbackMessage += `\nKeywords Suggestions: ${feedback.keywordsSuggestions.join(', ')}`;
    feedbackMessage += `\nFormatting: ${feedback.formatting}`;
    feedbackMessage += `\nContent Quality: ${feedback.contentQuality}`;

    alert('Resume Review Complete! Check console for detailed feedback or implement a modal/section to display it.');
    // In a real app, you would create a modal or a new section on the page
    // to beautifully display this 'feedback' object to the user.
}


// Loading Spinner Functions (make sure these are available in your CSS too)
function showLoading() {
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

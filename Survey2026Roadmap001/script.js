let currentStep = 1;
const totalSteps = 5;
window.submitted = false;

document.addEventListener('DOMContentLoaded', () => {
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progressBar = document.getElementById('progress-fill');
    const form = document.getElementById('custom-form');

    // Restore saved data before setting up event listeners
    restoreFormData(form);

    // Auto-save form data on change
    form.addEventListener('change', saveFormData);
    form.addEventListener('input', saveFormData);

    // Hide native error tooltips to use custom validation handling if desired
    // Or just rely on native required popups. We will use native for simplicity, 
    // but intercept the "Next" button click to validate the current section.

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            let nextStep = currentStep + 1;

            // Handle conditional branching (Expert vs Non-Expert) within Step 3 fields
            if (currentStep === 2) {
                const expertChoice = document.querySelector('input[name="entry.1341068020"]:checked');
                const isNonExpert = expertChoice && expertChoice.value === "비 전문가 설문 (간략화 버전)";
                const isExpert = !isNonExpert;

                // Toggle 'expert-only' questions
                const expertOnlyGroups = document.querySelectorAll('#step-3 .expert-only');
                expertOnlyGroups.forEach(group => {
                    group.style.display = isExpert ? 'block' : 'none';
                    const inputs = group.querySelectorAll('input, textarea, select');
                    inputs.forEach(el => el.disabled = !isExpert);
                });

                // Toggle 'non-expert-only' questions
                const nonExpertOnlyGroups = document.querySelectorAll('#step-3 .non-expert-only');
                nonExpertOnlyGroups.forEach(group => {
                    group.style.display = isNonExpert ? 'block' : 'none';
                    const inputs = group.querySelectorAll('input, textarea, select');
                    inputs.forEach(el => el.disabled = !isNonExpert);
                });
            }

            if (nextStep <= totalSteps) {
                currentStep = nextStep;
                updateWizard();
            }
        } else {
            // Trigger native HTML5 validation UI for the first invalid element in the current step
            const currentSection = document.getElementById(`step-${currentStep}`);
            const invalidInput = currentSection.querySelector(':invalid');
            if (invalidInput) {
                invalidInput.reportValidity();
            }
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizard();
        }
    });

    // Handle dropdown options that have "Other" text inputs
    document.querySelectorAll('.dropdown-with-other').forEach(select => {
        select.addEventListener('change', (e) => {
            const otherId = e.target.getAttribute('data-other-id');
            if (otherId) {
                const otherInput = document.getElementById(otherId);
                if (e.target.value === '__other_option__') {
                    otherInput.style.display = 'block';
                    otherInput.disabled = false;
                    otherInput.required = true;
                } else {
                    otherInput.style.display = 'none';
                    otherInput.disabled = true;
                    otherInput.required = false;
                    otherInput.value = '';
                }
            }
        });
    });

    // Handle "표준 구분" (Standard Type) conditional visibility for "국제 표준화 기구 정보"
    const standardTypeSelect = document.getElementById('standard-type-select');
    if (standardTypeSelect) {
        standardTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const orgGroup = document.getElementById('international-org-group');
            const orgHidden = document.getElementById('international-org-hidden');
            const orgInput = document.getElementById('international-org-input');

            if (val && (val.startsWith('1.') || val.startsWith('2.') || val.startsWith('3.'))) {
                orgGroup.style.display = 'block';
                orgHidden.disabled = false;
                orgInput.disabled = false;
            } else {
                orgGroup.style.display = 'none';
                orgHidden.disabled = true;
                orgInput.disabled = true;
                orgInput.value = '';
            }
        });
    }

    // Handle generic select placeholder styling (cross-browser robust)
    const allSelects = document.querySelectorAll('select.input-field');
    allSelects.forEach(select => {
        // Init state
        if (!select.value) {
            select.classList.add('placeholder-active');
        }

        // Listen for changes
        select.addEventListener('change', () => {
            if (!select.value) {
                select.classList.add('placeholder-active');
            } else {
                select.classList.remove('placeholder-active');
            }
        });
    });

    // Form submission event
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Prevent sending empty text for __other_option__ responses, which causes 400 Bad Request
        const otherTextInputs = form.querySelectorAll('input[type="text"][name$=".other_option_response"]');
        otherTextInputs.forEach(input => {
            if (!input.disabled && input.value.trim() === '') {
                input.disabled = true;
                // If it has a related hidden input (like radio variants), disable that too
                const hiddenEquivalent = form.querySelector(`input[type="hidden"][name="${input.name.replace('.other_option_response', '')}"]`);
                if (hiddenEquivalent) hiddenEquivalent.disabled = true;
            }
        });

        // Only set submitted true when the form is actually dispatched
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> 처리중...';

        const url = 'https://docs.google.com/forms/d/e/1FAIpQLSdkos2CPXY71VgVi54Gw45qmeneXGv46URgMGb2riWBFKvb-w/formResponse';
        const formData = new FormData(form);
        const urlEncodedData = new URLSearchParams(formData).toString();

        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: urlEncodedData
        }).then(() => {
            clearFormData();
            window.showSuccessMessage();
        }).catch(err => {
            console.error(err);
            clearFormData();
            window.showSuccessMessage();
        });
    });

    function updateWizard() {
        // Update Sections
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step-${currentStep}`).classList.add('active');

        // Update Progress Bar
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update Step Indicators
        document.querySelectorAll('.progress-steps .step').forEach(step => {
            const stepNum = parseInt(step.getAttribute('data-step'));
            if (stepNum <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update Buttons
        if (currentStep === 1) {
            btnPrev.style.display = 'none';
        } else {
            btnPrev.style.display = 'inline-flex';
        }

        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'inline-flex';
        } else {
            btnNext.style.display = 'inline-flex';
            btnSubmit.style.display = 'none';
        }

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validateStep(step) {
        const currentSection = document.getElementById(`step-${step}`);
        const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');

        let isValid = true;
        // Check validity, considering that radio grouped inputs share validity
        for (let el of inputs) {
            if (!el.checkValidity()) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }

    // Initialize the UI safely to step 1
    updateWizard();
});
// Called when iframe loads after form submit
window.showSuccessMessage = function () {
    document.querySelector('.form-header').style.display = 'none';
    document.querySelector('.form-main').style.display = 'none';
    document.getElementById('success-screen').style.display = 'block';

    // Confetti effect could be added here for extra premium feel
};

// --- Auto-Save Logic ---
function saveFormData(e) {
    try {
        const target = e.target;
        if (!target.name) return;

        let savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');

        if (target.type === 'radio' || target.type === 'checkbox') {
            if (target.checked) savedData[target.name] = target.value;
        } else {
            savedData[target.name] = target.value;
        }

        localStorage.setItem('surveyData', JSON.stringify(savedData));
    } catch (error) {
        console.warn('Auto-save is disabled (likely due to cross-origin iframe restrictions).', error);
    }
}

function restoreFormData(form) {
    try {
        let savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');
        if (Object.keys(savedData).length === 0) return;

        for (const key in savedData) {
            const value = savedData[key];
            const elements = form.querySelectorAll(`[name="${key}"]`);

            elements.forEach(el => {
                if (el.type === 'radio' || el.type === 'checkbox') {
                    if (el.value === value) el.checked = true;
                } else {
                    el.value = value;
                }
            });
        }

        // Trigger change events to visually update custom select placeholders and conditionally visible fields
        const selects = form.querySelectorAll('select.input-field');
        const conditionalRadios = form.querySelectorAll('input[type="radio"]:checked');

        selects.forEach(s => s.dispatchEvent(new Event('change', { bubbles: true })));
        conditionalRadios.forEach(r => r.dispatchEvent(new Event('change', { bubbles: true })));

        // Also trigger for "other" text inputs specifically
        const otherInputs = form.querySelectorAll('input[type="text"][name$=".other_option_response"]');
        otherInputs.forEach(i => {
            if (i.value) {
                i.style.display = 'block';
                i.disabled = false;
            }
        });
    } catch (error) {
        console.warn('Auto-restore is disabled (likely due to cross-origin iframe restrictions).', error);
    }
}

function clearFormData() {
    try {
        localStorage.removeItem('surveyData');
    } catch (error) {
        // Ignore errors
    }
}

// Called when user wants to edit their submission
window.returnToForm = function () {
    // Hide success screen
    document.getElementById('success-screen').style.display = 'none';

    // Show form again
    document.querySelector('.form-header').style.display = 'block';
    document.querySelector('.form-main').style.display = 'block';

    // Reset submit button so they can click it again
    const btnSubmit = document.getElementById('btn-submit');
    if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '제출하기 <i class="ri-check-line"></i>';
    }
};

// Matrix Modal Logic
window.openMatrixModal = function () {
    const modal = document.getElementById('matrix-modal');
    modal.style.display = 'flex';
    // Small delay to allow display flex to apply before opacity transition starts
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
};

// Close modal when clicking outside of the matrix content
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('matrix-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeMatrixModal();
            }
        });
    }
});

window.closeMatrixModal = function () {
    const modal = document.getElementById('matrix-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Matches CSS transition duration
};

window.selectMatrix = function (industryText, techText) {
    const industrySelect = document.querySelector('select[name="entry.1386415443"]');
    const techSelect = document.querySelector('select[name="entry.1381958828"]');

    if (industrySelect && techSelect) {
        industrySelect.value = industryText;
        techSelect.value = techText;

        // Dispatch change events to refresh the placeholder-active CSS toggle
        industrySelect.dispatchEvent(new Event('change'));
        techSelect.dispatchEvent(new Event('change'));

        // Close the modal
        closeMatrixModal();
    }
};

// Toggle Step 3 Examples
window.toggleExample = function (id) {
    const el = document.getElementById(id);
    if (el) {
        if (el.style.display === 'none' || el.style.display === '') {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
};

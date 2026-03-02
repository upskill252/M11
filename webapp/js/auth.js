const passwordInput = document.getElementById('reg_password');
const submitBtn = document.getElementById('reg_btn');
const strengthIndicator = document.getElementById('strength');

// Regex: Min 8 chars, 1 uppercase, 1 number, 1 special char
const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    
    if (strongRegex.test(val)) {
        strengthIndicator.innerText = "Strong Password ✅";
        strengthIndicator.style.color = "green";
        submitBtn.disabled = false; // Allow submission
    } else {
        strengthIndicator.innerText = "Weak: Need 8+ chars, Upper, Number, and Special Char.";
        strengthIndicator.style.color = "red";
        submitBtn.disabled = true; // Prevent submission
    }
});
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const strengthText = document.getElementById('strengthText');

// Regex: Min 8 chars, at least 1 number, and 1 special character
const strongRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

passwordInput.addEventListener('input', () => {
    if (strongRegex.test(passwordInput.value)) {
        strengthText.innerText = "Password Strength: Strong ✅";
        strengthText.style.color = "green";
        loginBtn.disabled = false;
    } else {
        strengthText.innerText = "Weak: Need 8+ chars, 1 number, 1 symbol.";
        strengthText.style.color = "red";
        loginBtn.disabled = true;
    }
});
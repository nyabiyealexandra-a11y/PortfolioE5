JavaScript
document.addEventListener("DOMContentLoaded", () => {
    // 1. Mise en surbrillance automatique du lien de navigation actif lors du défilement
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll("nav ul li a");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });

    // 2. Journalisation dans la console lors de l'accès aux documents
    const docButtons = document.querySelectorAll(".doc-btn, .btn");
    docButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const href = button.getAttribute("href");
            if (href && href.includes(".pdf")) {
                console.log(`[Portfolio] Consultation du document : ${href}`);
            }
        });
    });
});
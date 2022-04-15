describe("Skate Park System", () => {

  it("accediendo a la página de inicio", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Lista de participantes");
  });

  it("click en link administrar", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Administrar").click();
  });

  it("click en link registrarme", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Registrarme").click();
  });

  it("click en link iniciar sesión", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Iniciar Sesión").click();
  });

  it("probando acceso administrador", () => {
    cy.visit("http://localhost:3000/login-admin");
    cy.get('input[name="login"]').type("prueba");
    cy.get('input[name="password"]').type("prueba");
    cy.get("button").click();
  });

  it("probando acceso skater", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="email"]').type("prueba");
    cy.get('input[name="password"]').type("prueba");
    cy.get("button").click();
  });

});

/*
const nombreInput = cy.get("#nombre")
const nombre = "Goku"
nombreInput.type(nombre)

const emailInput = cy.get("#email")
emailInput.type("goky@gmail.com")

const passwordInput = cy.get("#password")
passwordInput.type("Gohan123")

const button = cy.get("button")
button.click()
cy.get("#nombre").should("have.value", nombre)
*/
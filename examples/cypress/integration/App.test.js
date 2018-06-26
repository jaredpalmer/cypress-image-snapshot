describe('App', () => {
  it('should visit the app', () => {
    cy.visit('http://localhost:3000');
    cy.matchImageSnapshot();
  });
});

describe('App', () => {
  it('should render on desktop', () => {
    cy.visit('http://localhost:3000');

    cy.matchImageSnapshot();
  });

  it('should render on mobile', () => {
    cy.visit('http://localhost:3000');

    cy.viewport(375, 812);
    cy.matchImageSnapshot('mobile/app');
  });
});

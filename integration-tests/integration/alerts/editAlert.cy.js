const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const EditAlertPage = require('../../pages/alerts/editAlertPage')
const AlertAlreadyClosedPage = require('../../pages/alerts/alertAlreadyClosedPage')
const NotFoundPage = require('../../pages/notFound')

const offenderNo = 'A12345'
const alertId = 1

context('A user can add an appointment', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI', roles: ['ROLE_UPDATE_ALERT'] })
    cy.signIn()
  })
  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubAlertTypes')
    cy.task('stubCreateAlert')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubGetAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
    cy.task('stubPutAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
  })

  it('A user can successfully edit an alert', () => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    const editAlertPage = EditAlertPage.verifyOnPage()
    const form = editAlertPage.form()
    form.comments().type('Test')
    form.alertStatusNo().click()
    form.submitButton().click()
    cy.url().should('include', `prisoner/${offenderNo}/alerts`)
  })

  it('Should show correct error messages', () => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    const editAlertPage = EditAlertPage.verifyOnPage()
    const form = editAlertPage.form()
    form.submitButton().click()

    EditAlertPage.verifyOnPage()
    editAlertPage
      .errorSummaryList()
      .find('li')
      .then(($errors) => {
        expect($errors.get(0).innerText).to.contain('Select yes if you want to close this alert')
      })
  })

  it('A user is presented with alert already created when 400 error', () => {
    cy.task('stubPutAlertErrors', {
      bookingId: 14,
      alertId,
      alert: { alertId: 1, comment: 'Test comment' },
      status: 400,
    })
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)

    const editAlertPage = EditAlertPage.verifyOnPage()
    const form = editAlertPage.form()
    form.comments().type('Test')
    form.alertStatusYes().click()
    form.submitButton().click()

    AlertAlreadyClosedPage.verifyOnPage()
  })
})

context('when a user has no permissions', () => {
  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })
  beforeEach(() => {
    cy.task('stubOffenderBasicDetails', offenderBasicDetails)
    cy.task('stubOffenderFullDetails', offenderFullDetails)
    cy.task('stubAlertTypes')
    cy.task('stubCreateAlert')
    cy.task('stubUserMe', {})
    cy.task('stubUserCaseLoads')
    cy.task('stubGetAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
    cy.task('stubPutAlert', { bookingId: 14, alertId, alert: { alertId: 1, comment: 'Test comment' } })
  })
  it('A user is presented with not found when they no role', () => {
    cy.visit(`/edit-alert?offenderNo=${offenderNo}&alertId=${alertId}`)
    NotFoundPage.verifyOnPage()
  })
})

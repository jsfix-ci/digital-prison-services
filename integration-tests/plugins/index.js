const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const keyworker = require('../mockApis/keyworker')
const caseNotes = require('../mockApis/caseNotes')

const { resetStubs } = require('../mockApis/wiremock')

module.exports = on => {
  on('task', {
    reset: () => Promise.all([resetStubs()]),

    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username, caseload }) =>
      Promise.all([auth.stubLogin(username, caseload), elite2api.stubUserMe(), elite2api.stubUserCaseloads()]),
    stubLoginCourt: () => Promise.all([auth.stubLoginCourt({}), elite2api.stubUserCaseloads()]),

    stubScheduledActivities: response => Promise.all([elite2api.stubUserScheduledActivities(response)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
    stubCaseNotes: response => caseNotes.stubCaseNotes(response),
    stubCaseNoteTypes: () => caseNotes.stubCaseNoteTypes(),

    stubPrisonerProfileHeaderData: ({ offenderBasicDetails, offenderFullDetails, iepSummary, caseNoteSummary }) =>
      Promise.all([
        auth.stubUserMe(),
        auth.stubUserMeRoles([{ roleCode: 'UPDATE_ALERT' }]),
        elite2api.stubOffenderBasicDetails(offenderBasicDetails),
        elite2api.stubOffenderFullDetails(offenderFullDetails),
        elite2api.stubIepSummaryForBookingIds(iepSummary),
        elite2api.stubOffenderCaseNoteSummary(caseNoteSummary),
        elite2api.stubUserCaseloads(),
        elite2api.stubStaffRoles(),
        elite2api.stubOffenderImage(),
        keyworker.stubKeyworkerByCaseloadAndOffenderNo(),
      ]),

    stubAlertTypes: () => Promise.all([elite2api.stubAlertTypes()]),
    stubAlertsForBooking: alerts => Promise.all([elite2api.stubAlertsForBooking(alerts)]),
    stubQuickLook: ({
      offence,
      prisonerDetails,
      sentenceDetails,
      balances,
      iepSummary,
      positiveCaseNotes,
      negativeCaseNotes,
      adjudications,
      nextVisit,
      visitBalances,
      todaysEvents,
      profileInformation,
    }) =>
      Promise.all([
        elite2api.stubMainOffence(offence),
        elite2api.stubPrisonerDetails(prisonerDetails),
        elite2api.stubPrisonerSentenceDetails(sentenceDetails),
        elite2api.stubPrisonerBalances(balances),
        elite2api.stubIepSummaryForBooking(iepSummary),
        elite2api.stubPositiveCaseNotes(positiveCaseNotes),
        elite2api.stubNegativeCaseNotes(negativeCaseNotes),
        elite2api.stubAdjudicationsForBooking(adjudications),
        elite2api.stubNextVisit(nextVisit),
        elite2api.stubPrisonerVisitBalances(visitBalances),
        elite2api.stubEventsForToday(todaysEvents),
        elite2api.stubProfileInformation(profileInformation),
      ]),
    stubReleaseDatesOffenderNo: releaseDates => Promise.all([elite2api.stubPrisonerSentenceDetails(releaseDates)]),
  })
}

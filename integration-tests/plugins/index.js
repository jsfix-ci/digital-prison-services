const auth = require('../mockApis/auth')
const elite2api = require('../mockApis/elite2')
const whereabouts = require('../mockApis/whereabouts')
const tokenverification = require('../mockApis/tokenverification')
const keyworker = require('../mockApis/keyworker')
const caseNotes = require('../mockApis/caseNotes')
const activityResponse = require('../mockApis/responses/activityResponse')
const {
  courtEventsWithDifferentStatusResponse,
  externalTransfersResponse,
} = require('../mockApis/responses/houseBlockResponse')
const alertsResponse = require('../mockApis/responses/alertsResponse')
const allocationManager = require('../mockApis/allocationManager')
const community = require('../mockApis/community')

const { resetStubs } = require('../mockApis/wiremock')

const extractOffenderNumbers = activityList => {
  const result = Object.keys(activityList).reduce((r, k) => {
    return r.concat(activityList[k])
  }, [])
  return [...new Set(result.map(item => item.offenderNo))]
}

module.exports = on => {
  on('task', {
    reset: resetStubs,
    resetAndStubTokenVerification: async () => {
      await resetStubs()
      return tokenverification.stubVerifyToken(true)
    },
    stubAuthHealth: status => Promise.all([auth.stubHealth(status)]),
    stubElite2Health: status => Promise.all([elite2api.stubHealth(status)]),
    stubWhereaboutsHealth: status => Promise.all([whereabouts.stubHealth(status)]),
    stubAllocationManagerHealth: status => Promise.all([allocationManager.stubHealth(status)]),
    stubKeyworkerHealth: status => Promise.all([keyworker.stubHealth(status)]),
    stubCaseNotesHealth: status => Promise.all([caseNotes.stubHealth(status)]),
    stubCommunityHealth: status => Promise.all([community.stubHealth(status)]),
    stubTokenverificationHealth: status => Promise.all([tokenverification.stubHealth(status)]),

    stubHealthAllHealthy: () =>
      Promise.all([
        auth.stubHealth(),
        elite2api.stubHealth(),
        whereabouts.stubHealth(),
        keyworker.stubHealth(),
        allocationManager.stubHealth(),
        caseNotes.stubHealth(),
        tokenverification.stubHealth(),
        community.stubHealth(),
      ]),
    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username = 'ITAG_USER', caseload = 'MDI', roles = [] }) =>
      Promise.all([
        auth.stubLogin(username, caseload, roles),
        elite2api.stubUserMe(),
        elite2api.stubUserCaseloads(),
        tokenverification.stubVerifyToken(true),
      ]),
    stubLoginCourt: () =>
      Promise.all([auth.stubLoginCourt(), elite2api.stubUserCaseloads(), tokenverification.stubVerifyToken(true)]),

    stubUserEmail: username => Promise.all([auth.stubEmail(username)]),
    stubUser: (username, caseload) => Promise.all([auth.stubUser(username, caseload)]),
    stubScheduledActivities: response => Promise.all([elite2api.stubUserScheduledActivities(response)]),
    stubProgEventsAtLocation: ({ caseload, locationId, timeSlot, date, activities }) =>
      Promise.all([elite2api.stubProgEventsAtLocation(caseload, locationId, timeSlot, date, activities)]),

    stubAttendanceChanges: response => Promise.all([whereabouts.stubAttendanceChanges(response)]),
    stubCourts: courts => Promise.all([whereabouts.stubCourtLocations(courts)]),
    stubGroups: caseload => Promise.all([whereabouts.stubGroups(caseload)]),
    stubAddVideoLinkAppointment: appointment => Promise.all([whereabouts.stubAddVideoLinkAppointment(appointment)]),
    stubCaseNotes: response => caseNotes.stubCaseNotes(response),
    stubCaseNoteTypes: () => caseNotes.stubCaseNoteTypes(),

    stubForAttendance: ({ caseload, locationId, timeSlot, date, activities }) => {
      const offenderNumbers = extractOffenderNumbers(activities)
      return Promise.all([
        elite2api.stubUserCaseloads(),
        elite2api.stubProgEventsAtLocation(locationId, timeSlot, date, activities),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        elite2api.stubVisits(activityResponse.visits),
        elite2api.stubActivityLocations(),
        elite2api.stubAppointments(),
        elite2api.stubActivities(),
        elite2api.stubCourtEvents(),
        elite2api.stubExternalTransfers(),
        elite2api.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        elite2api.stubAssessments(offenderNumbers),
        elite2api.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubGetActivityList: ({ caseload, locationId, timeSlot, date, inThePast = false, activities }) => {
      let activity
      if (activities) {
        activity = activities
      } else {
        activity = inThePast ? activityResponse.pastActivities : activityResponse.activities
      }
      const offenderNumbers = extractOffenderNumbers(activity)
      return Promise.all([
        elite2api.stubUserCaseloads(),
        elite2api.stubProgEventsAtLocation(locationId, timeSlot, date, activity),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'APP'),
        elite2api.stubUsageAtLocation(caseload, locationId, timeSlot, date, 'VISIT'),
        elite2api.stubVisits(activityResponse.visits),
        elite2api.stubActivityLocations(),
        elite2api.stubAppointments(activityResponse.appointments),
        elite2api.stubActivities(activityResponse.activities),
        elite2api.stubCourtEvents(courtEventsWithDifferentStatusResponse),
        elite2api.stubExternalTransfers(externalTransfersResponse),
        elite2api.stubAlerts({ locationId: 'MDI', alerts: alertsResponse }),
        elite2api.stubAssessments(offenderNumbers),
        elite2api.stubOffenderSentences(offenderNumbers, date),
      ])
    },

    stubPrisonerProfileHeaderData: ({
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary,
      caseNoteSummary,
      userRoles = [],
    }) =>
      Promise.all([
        auth.stubUserMe(),
        auth.stubUserMeRoles([...userRoles, { roleCode: 'UPDATE_ALERT' }]),
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
    stubAlerts: elite2api.stubAlerts,

    stubInmates: elite2api.stubInmates,
    stubUserLocations: elite2api.stubUserLocations,

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
    stubQuickLookApiErrors: () =>
      Promise.all([
        elite2api.stubMainOffence(null, 500),
        elite2api.stubPrisonerDetails([], 500),
        elite2api.stubPrisonerSentenceDetails(null, 500),
        elite2api.stubPrisonerBalances(null, 500),
        elite2api.stubIepSummaryForBooking(null, 500),
        elite2api.stubPositiveCaseNotes(null, 500),
        elite2api.stubNegativeCaseNotes(null, 500),
        elite2api.stubAdjudicationsForBooking(null, 500),
        elite2api.stubNextVisit(null, 500),
        elite2api.stubPrisonerVisitBalances(null, 500),
        elite2api.stubEventsForToday([], 500),
        elite2api.stubProfileInformation(null, 500),
      ]),
    stubPersonal: ({
      prisonerDetail,
      identifiers,
      aliases,
      property,
      contacts,
      addresses,
      secondaryLanguages,
      personAddresses,
      personEmails,
      personPhones,
      treatmentTypes,
      healthTypes,
      careNeeds,
      reasonableAdjustments,
      agencies,
      prisonOffenderManagers,
    }) =>
      Promise.all([
        elite2api.stubPrisonerDetail(prisonerDetail),
        elite2api.stubIdentifiers(identifiers),
        elite2api.stubOffenderAliases(aliases),
        elite2api.stubPrisonerProperty(property),
        elite2api.stubPrisonerContacts(contacts),
        elite2api.stubPrisonerAddresses(addresses),
        elite2api.stubSecondaryLanguages(secondaryLanguages),
        elite2api.stubPersonAddresses(personAddresses),
        elite2api.stubPersonEmails(personEmails),
        elite2api.stubPersonPhones(personPhones),
        elite2api.stubTreatmentTypes(treatmentTypes),
        elite2api.stubHealthTypes(healthTypes),
        elite2api.stubPersonalCareNeeds(careNeeds),
        elite2api.stubReasonableAdjustments(reasonableAdjustments),
        elite2api.stubAgencies(agencies),
        allocationManager.stubGetPomForOffender(prisonOffenderManagers),
      ]),
    stubReleaseDatesOffenderNo: releaseDates => Promise.all([elite2api.stubPrisonerSentenceDetails(releaseDates)]),
    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubGetAbsenceReasons: response => Promise.all([whereabouts.stubGetAbsenceReasons()]),
    stubGetAttendance: ({ caseload, locationId, timeSlot, date, data }) =>
      Promise.all([whereabouts.stubGetAttendance(caseload, locationId, timeSlot, date, data)]),
    stubPostAttendance: response => whereabouts.stubPostAttendance(response),
    stubPutAttendance: response => whereabouts.stubPutAttendance(response),
    verifyPostAttendance: () => whereabouts.verifyPostAttendance(),
    stubSentenceAdjustments: response => elite2api.stubGetSentenceAdjustments(response),
    stubOffenderBasicDetails: basicDetails => Promise.all([elite2api.stubOffenderBasicDetails(basicDetails)]),
    stubOffenderFullDetails: fullDetails => Promise.all([elite2api.stubOffenderFullDetails(fullDetails)]),
    stubAppointmentTypes: types => Promise.all([elite2api.stubAppointmentTypes(types)]),
    stubAppointmentsAtAgency: (agency, locations) =>
      Promise.all([elite2api.stubUsageAtAgency(agency, 'APP', locations)]),
    stubVisitsAtAgency: (agency, locations) => Promise.all([elite2api.stubUsageAtAgency(agency, 'VISIT', locations)]),
    stubActivityLocations: () => Promise.all([elite2api.stubActivityLocations()]),
    stubPostAppointments: () => Promise.all([elite2api.stubPostAppointments()]),
    stubSchedules: ({ agency, location, date, appointments, visits, activities }) =>
      Promise.all([
        elite2api.stubSchedulesAtAgency(agency, location, 'APP', date, appointments),
        elite2api.stubSchedulesAtLocation(location, 'APP', date, appointments),
        elite2api.stubSchedulesAtAgency(agency, location, 'VISIT', date, visits),
        elite2api.stubSchedulesAtLocation(location, 'VISIT', date, visits),
        elite2api.stubCourtEvents(),
        elite2api.stubActivitySchedules(location, date, activities),
        elite2api.stubVisits(visits),
        elite2api.stubExternalTransfers(),
        elite2api.stubAppointments(appointments),
        elite2api.stubActivities(activities),
      ]),
    stubSentenceData: details => Promise.all([elite2api.stubSentenceData(details)]),
    stubLocation: (locationId, locationData) => Promise.all([elite2api.stubLocation(locationId, locationData)]),
    stubAgencyDetails: ({ agencyId, details }) => Promise.all([elite2api.stubAgencyDetails(agencyId, details)]),
    stubAppointmentLocations: ({ agency, locations }) =>
      Promise.all([elite2api.stubAppointmentLocations(agency, locations)]),
    stubBookingOffenders: offenders => Promise.all([elite2api.stubBookingOffenders(offenders)]),
    stubAgencies: agencies => Promise.all([elite2api.stubAgencies(agencies)]),
    stubAppointmentsAtAgencyLocation: ({ agency, location, date, appointments }) =>
      Promise.all([elite2api.stubSchedulesAtAgency(agency, location, 'APP', date, appointments)]),
    stubCourtCases: courtCases => elite2api.stubCourtCases(courtCases),
    stubOffenceHistory: offenceHistory => elite2api.stubOffenceHistory(offenceHistory),
    stubSentenceTerms: sentenceTerms => elite2api.stubSentenceTerms(sentenceTerms),
  })
}

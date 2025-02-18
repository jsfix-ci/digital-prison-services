import moment from 'moment'

import {
  capitalizeStart,
  switchDateFormat,
  getCurrentPeriod,
  pascalToString,
  readableDateFormat,
  stripAgencyPrefix,
  putLastNameFirst,
} from '../../utils'

const attendanceReasonStatsUrl = '/manage-prisoner-whereabouts/attendance-reason-statistics'

const buildStatsViewModel = (dashboardStats, changes) => {
  const mapReasons = (reasons) =>
    Object.keys(reasons || [])
      .filter((name) => !name.endsWith('Description')) // filter out descriptions
      .filter((name) => name !== 'attended') // filter out attended
      .map((name) => ({
        id: capitalizeStart(name),
        name: reasons[`${name}Description`],
        value: Number(reasons[name]),
      }))

  return {
    ...dashboardStats,
    attended: dashboardStats?.attended,
    paidReasons: mapReasons(dashboardStats?.paidReasons),
    unpaidReasons: mapReasons(dashboardStats?.unpaidReasons),
    changes,
  }
}

const periodDisplayLookup = {
  AM: 'AM',
  PM: 'PM',
  ED: 'ED',
  AM_PM: 'AM and PM',
}

const extractCaseLoadInfo = (caseloads) => {
  const activeCaseLoad = caseloads.find((cl) => cl.currentlyActive)
  const inactiveCaseLoads = caseloads.filter((cl) => cl.currentlyActive === false)
  const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

  return {
    activeCaseLoad,
    inactiveCaseLoads,
    activeCaseLoadId,
  }
}

const absentReasonTableViewModel = (offenderData) => ({
  sortOptions: [
    { value: '0_ascending', text: 'Name (A-Z)' },
    { value: '0_descending', text: 'Name (Z-A)' },
    { value: '2_ascending', text: 'Location (A-Z)' },
    { value: '2_descending', text: 'Location (Z-A)' },
    { value: '3_ascending', text: 'Activity (A-Z)' },
    { value: '3_descending', text: 'Activity (Z-A)' },
  ],
  offenders: offenderData
    .sort((a, b) => a.offenderName.localeCompare(b.offenderName, 'en', { ignorePunctuation: true }))
    .map((data) => {
      const quickLookUrl = `/prisoner/${data.offenderNo}`

      // Return the data in the appropriate format to seed the table macro
      return [
        {
          html: data.location
            ? `<a href=${quickLookUrl} class="govuk-link" target="_blank" rel="noopener noreferrer">${data.offenderName}</a>`
            : data.offenderName,
        },
        {
          text: data.offenderNo,
        },
        {
          text: data.location || '--',
        },
        {
          html: data.suspended ? '<span class="suspended">Suspended</span>' : '',
        },
        {
          text: data.activity,
        },
        {
          text: data.comments,
        },
      ]
    }),
})

const validateDates = (dates) => {
  const errors = []

  const fromDate = moment(dates.fromDate, 'DD/MM/YYYY')
  const toDate = moment(dates.toDate, 'DD/MM/YYYY')

  const now = moment()
  if (fromDate.isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#fromDate' })

  if (fromDate.isAfter(now, 'day'))
    errors.push({ text: 'Select a date range that is not in the future', href: '#toDate' })

  if (toDate) {
    const weeks = fromDate.diff(toDate, 'week')

    if (Math.abs(weeks) > 2)
      errors.push({ text: 'Select a date range that does not exceed two weeks', href: '#fromDate' })
  }
  return errors
}

const dateRangeForStats = (subtractWeeks = 0) => {
  const sunday = moment().subtract(subtractWeeks, 'week').day(0).format('DD/MM/YYYY')
  const saturday = moment().subtract(subtractWeeks, 'week').day(6).format('DD/MM/YYYY')

  return {
    fromDate: sunday,
    toDate: saturday,
  }
}

const formatDatesForDisplay = ({ fromDate, toDate }) => {
  if (fromDate && toDate) {
    if (fromDate !== toDate)
      return `${readableDateFormat(fromDate, 'D/MM/YYYY')} to ${readableDateFormat(toDate, 'D/MM/YYYY')}`
  }

  return `${readableDateFormat(fromDate, 'D/MM/YYYY')}`
}

const getStatPresetsLinks = ({ activeCaseLoadId }) => {
  const currentWeek = dateRangeForStats()
  const previousWeek = dateRangeForStats(1)

  const statsForCurrentWeek = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${currentWeek.fromDate}&toDate=${currentWeek.toDate}`

  const statsForPreviousWeek = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${previousWeek.fromDate}&toDate=${previousWeek.toDate}`

  const statsFor2Weeks = `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=AM_PM&fromDate=${previousWeek.fromDate}&toDate=${currentWeek.toDate}`

  return {
    statsForCurrentWeek,
    statsForPreviousWeek,
    statsFor2Weeks,
  }
}

const urlWithDefaultParameters = ({ activeCaseLoadId, currentPeriod }) => {
  const today = moment().format('DD/MM/YYYY')
  return `${attendanceReasonStatsUrl}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}`
}

const getDateTimes = ({ fromDateValue, toDateValue, period }) => {
  switch (period) {
    case 'AM':
      return {
        fromDateTime: `${fromDateValue}T00:00`,
        toDateTime: `${toDateValue || fromDateValue}T11:59`,
      }
    case 'PM':
      return {
        fromDateTime: `${fromDateValue}T12:00`,
        toDateTime: `${toDateValue || fromDateValue}T16:59`,
      }
    case 'ED':
      return {
        fromDateTime: `${fromDateValue}T17:00`,
        toDateTime: `${toDateValue || fromDateValue}T23:59`,
      }
    default:
      return {
        fromDateTime: `${fromDateValue}T00:00`,
        toDateTime: `${toDateValue || fromDateValue}T23:59`,
      }
  }
}

const getSubheading = ({ fromDate, toDate, displayPeriod }) => {
  if (!toDate) return `${moment(fromDate, 'DD/MM/YYYY').format('D MMMM YYYY')} - ${displayPeriod}`

  return `${moment(fromDate, 'DD/MM/YYYY').format('D MMMM YYYY')}  to ${moment(toDate, 'DD/MM/YYYY').format(
    'D MMMM YYYY'
  )}  - ${displayPeriod}`
}

export const attendanceStatisticsFactory = (oauthApi, prisonApi, whereaboutsApi) => {
  const attendanceStatistics = async (req, res) => {
    const currentPeriod = getCurrentPeriod(moment().format())

    const { agencyId, fromDate, toDate } = req.query || {}
    const period = (req.query && req.query.period) || currentPeriod
    const roles = oauthApi.userRoles(res.locals)
    const [user, caseloads] = await Promise.all([oauthApi.currentUser(res.locals), prisonApi.userCaseLoads(res.locals)])

    const { activeCaseLoad, inactiveCaseLoads, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

    if (!period || !fromDate) return res.redirect(urlWithDefaultParameters({ activeCaseLoadId, currentPeriod }))

    const shouldClearFormValues = Boolean(fromDate && toDate)
    const displayPeriod = periodDisplayLookup[period]
    const fromDateValue = switchDateFormat(fromDate, 'DD/MM/YYYY')
    const toDateValue = toDate && switchDateFormat(toDate, 'DD/MM/YYYY')

    const dateRange = getDateTimes({ fromDateValue, toDateValue, period })

    const mainViewModel = {
      title: 'Attendance reason statistics',
      user: {
        displayName: user.name,
        activeCaseLoad: {
          description: activeCaseLoad.description,
          id: activeCaseLoadId,
        },
      },
      displayDate: formatDatesForDisplay({ fromDate, toDate }),
      caseLoadId: activeCaseLoad.caseLoadId,
      allCaseloads: caseloads,
      inactiveCaseLoads,
      userRoles: roles,
      shouldClearFormValues,
      period,
      fromDate,
      toDate,
      clickThrough: {
        fromDate,
        toDate,
        period,
      },
      displayPeriod,
      changeClickThrough: {
        ...dateRange,
        subHeading: getSubheading({ fromDate, toDate, displayPeriod }),
      },
      ...getStatPresetsLinks({ activeCaseLoadId }),
    }

    if (fromDate) {
      const errors = validateDates({ fromDate, toDate })

      if (errors.length > 0)
        return res.render('attendanceStatistics.njk', {
          errors,
          ...mainViewModel,
        })
    }

    const { changes } = await whereaboutsApi.getAttendanceChanges(res.locals, dateRange)
    const changesForAgency = (changes && changes.filter((change) => change.prisonId === agencyId).length) || 0

    const dashboardStats = await whereaboutsApi.getAttendanceStats(res.locals, {
      agencyId,
      fromDate: fromDateValue,
      toDate: toDateValue || fromDateValue,
      period: period === 'AM_PM' ? '' : period,
    })

    return res.render('attendanceStatistics.njk', {
      ...mainViewModel,
      dashboardStats: buildStatsViewModel(dashboardStats, changesForAgency),
    })
  }

  const attendanceStatisticsOffendersList = async (req, res) => {
    const { reason } = req.params
    const { agencyId, period, fromDate, toDate } = req.query || {}

    const formattedFromDate = switchDateFormat(fromDate, 'DD/MM/YYYY')
    const formattedToDate = switchDateFormat(toDate, 'DD/MM/YYYY')
    const currentPeriod = getCurrentPeriod(moment().format())
    const today = moment().format('DD/MM/YYYY')

    try {
      const roles = oauthApi.userRoles(res.locals)
      const [user, caseloads] = await Promise.all([
        oauthApi.currentUser(res.locals),
        prisonApi.userCaseLoads(res.locals),
      ])

      const { activeCaseLoad, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

      if (!period || !fromDate) {
        return res.redirect(
          `${attendanceReasonStatsUrl}/reason/${reason}?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}&toDate=${today}`
        )
      }

      const { absences, description: displayReason } = await whereaboutsApi.getAbsences(res.locals, {
        agencyId,
        reason,
        period: period === 'AM_PM' ? '' : period,
        fromDate: formattedFromDate,
        toDate: formattedToDate || formattedFromDate,
      })

      const offenderData = absences.map((absence) => ({
        offenderName: putLastNameFirst(absence.firstName, absence.lastName),
        offenderNo: absence.offenderNo,
        location: stripAgencyPrefix(absence.cellLocation, agencyId),
        activity: absence.eventDescription,
        comments: `${absence.subReasonDescription ? `${absence.subReasonDescription}: ` : ''}${absence.comments}`,
        eventDate: readableDateFormat(absence.eventDate, 'YYYY-MM-DD'),
        suspended: absence.suspended,
      }))

      const { offenders, sortOptions } = absentReasonTableViewModel(offenderData)

      return res.render('attendanceStatisticsOffendersList.njk', {
        title: displayReason,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        displayDate: formatDatesForDisplay({ fromDate, toDate }),
        displayPeriod: periodDisplayLookup[period],
        reason: displayReason,
        dashboardUrl: `${attendanceReasonStatsUrl}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${toDate}`,
        offenders,
        sortOptions,
        caseLoadId: activeCaseLoad.caseLoadId,
        allCaseloads: caseloads,
        userRoles: roles,
        totalOffenders: offenders.length,
      })
    } catch (error) {
      res.locals.redirectUrl = `${attendanceReasonStatsUrl}/reason/${reason}`
      throw error
    }
  }

  const attendanceStatisticsSuspendedList = async (req, res) => {
    const { agencyId, period, fromDate, toDate } = req.query || {}

    const formattedFromDate = switchDateFormat(fromDate, 'DD/MM/YYYY')
    const formattedToDate = toDate ? switchDateFormat(toDate, 'DD/MM/YYYY') : switchDateFormat(fromDate, 'DD/MM/YYYY')
    const currentPeriod = getCurrentPeriod(moment().format())
    const today = moment().format('DD/MM/YYYY')
    const roles = oauthApi.userRoles(res.locals)
    const [user, caseloads] = await Promise.all([oauthApi.currentUser(res.locals), prisonApi.userCaseLoads(res.locals)])

    const { activeCaseLoad, activeCaseLoadId } = extractCaseLoadInfo(caseloads)

    if (!period || !fromDate) {
      return res.redirect(
        `${attendanceReasonStatsUrl}/suspended?agencyId=${activeCaseLoadId}&period=${currentPeriod}&fromDate=${today}&toDate=${today}`
      )
    }

    const getSuspendedActivities = async (filteredPeriod) => {
      return prisonApi.getOffenderSuspendedActivitiesOverDateRange(res.locals, {
        agencyId,
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        period: filteredPeriod,
      })
    }

    const suspendedActivities = await (async () => {
      if (period === 'AM_PM') {
        const [AM, PM] = await Promise.all([getSuspendedActivities('AM'), getSuspendedActivities('PM')])
        return [...AM, ...PM]
      }
      return getSuspendedActivities(period)
    })()

    const totalOffenders = new Set(suspendedActivities.map((activity) => activity.bookingId)).size

    const suspendedAttendances = await whereaboutsApi.getAttendanceForBookingsOverDateRange(res.locals, {
      agencyId,
      period: period === 'AM_PM' ? '' : period,
      bookings: suspendedActivities.map((activity) => activity.bookingId),
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    })

    const formatAttendedData = (data) => {
      if (data.attended) {
        return 'Yes'
      }

      return `${data.paid ? 'Yes' : 'No'} - ${pascalToString(data.absentReason).toLowerCase()}`
    }

    const offendersData = suspendedActivities.map((activity) => {
      const attendanceDetails = suspendedAttendances.attendances.find(
        (attendance) => activity.eventId === attendance.eventId
      )

      const { offenderNo, firstName, lastName, comment, cellLocation } = activity
      const offenderName = putLastNameFirst(firstName, lastName)

      const offenderUrl = `/prisoner/${offenderNo}`

      return [
        {
          html: `<a href="${offenderUrl}" class="govuk-link">${offenderName}</a>`,
          attributes: {
            'data-sort-value': lastName,
          },
        },
        { text: offenderNo },
        { text: cellLocation },
        { text: comment },
        { text: attendanceDetails ? formatAttendedData(attendanceDetails) : 'Not recorded' },
      ]
    })

    return res.render('attendanceStatisticsSuspendedList.njk', {
      title: 'Suspended',
      user: {
        displayName: user.name,
        activeCaseLoad: {
          description: activeCaseLoad.description,
          id: activeCaseLoadId,
        },
      },
      displayDate: formatDatesForDisplay({ fromDate, toDate }),
      displayPeriod: periodDisplayLookup[period],
      dashboardUrl: `${attendanceReasonStatsUrl}?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}&toDate=${
        toDate || ''
      }`,
      offendersData,
      caseLoadId: activeCaseLoad.caseLoadId,
      allCaseloads: caseloads,
      userRoles: roles,
      totalRecords: suspendedActivities.length,
      totalOffenders,
    })
  }

  return {
    attendanceStatistics,
    attendanceStatisticsOffendersList,
    attendanceStatisticsSuspendedList,
  }
}

export default { attendanceStatisticsFactory }
